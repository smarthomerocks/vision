const fs = require('fs-extra'),
      uuid = require('uuid/v4'),
      request = require('request'),
      ModuleServer = require('../../lib/module-server.js'),
      rootCameraDirectory = `${process.cwd()}/public/module/camera`;

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    switch (command) {
      case 'CAMERA_PLUGIN_CONNECT':
        this.connectPlugin(data.plugin);
        break;
      case 'CAMERA_START_VIDEO':
        this.startVideo(data.plugin, data.id, !!data.streaming);
        break;
      case 'CAMERA_STOP_VIDEO':
        this.stopVideo(data.plugin, data.id);
        break;
    }
  },
  cameras: {},

  getCameraDirectory: function(id) {
    return `${rootCameraDirectory}/${id.replace(/\./g, '_')}`;
  },

  getCameraSnapshotUri: function(id) {
    return `module/camera/${id.replace(/\./g, '_')}/current.jpg?${uuid()}`; // add uuid to prevent webbrowsers from caching them.
  },

  startVideo: function(plugin, id, streaming) {
    //TODO: don't run this whole block if we are already playing for this camera. Hold a global list of camera status.
    let camState = this.cameras[id];

    // if camera not available or we are already playing, just ignore this command.
    if (!camState || camState.available !== 'CONNECTED' || camState.state === 'RECORDING') {
      return;
    }

    if (streaming) {
      camState.state = 'RECORDING';
      // https://github.com/meetecho/janus-gateway
      // https://janus.conf.meetecho.com/docs/JS.html
      // https://github.com/mpromonet/webrtc-streamer
      /*
       * Janus-gateway recently added a simple RTSP support (based on libcurl) to its streaming plugins since this commit

       Then it is possible to configure the gateway to negotiate RTSP with the camera and relay the RTP thought WebRTC adding in the streaming plugins configuration <prefix>/etc/janus/janus.plugin.streaming.cfg

       [camera]
       type = rtsp
       id = 99
       description = Dlink DCS-5222L camera
       audio = no
       video = yes
       url=rtsp://192.168.1.16/play2.sdp
       Next you will be able to access to the WebRTC stream using the streaming demo page http://..../demos/streamingtest.html
       */
    } else {
      camState.state = 'RECORDING';
      this.dashboard.camera_onvif.getSnapshot(plugin, id);

      camState.snapshotInterval = setInterval(() => {
        this.dashboard.camera_onvif.getSnapshot(plugin, id);
      }, 10000);
    }
  },

  stopVideo: function(plugin, id) {

    let camState = this.cameras[id];
    
    if (camState) {
      camState.state === '';

      if (camState.snapshotInterval) {
        clearInterval(camState.snapshotInterval);
        camState.snapshotInterval = undefined;
      }
    }
  },

  connectPlugin: function(plugin) {

    if (this.isConnected) {
      this.sendSocketNotification('CAMERA_PLUGIN_CONNECTED');
      return;
    }

    let self = this,
        cameraModules = this.dashboard.getConfig().modules.filter(module => module.module === 'camera-onvif');


    this.dashboard.camera_onvif.once(plugin, 'CONNECTED', function(data) {
      self.isConnected = true;
      self.sendSocketNotification('CAMERA_PLUGIN_CONNECTED');
    });

    this.dashboard.camera_onvif.on(plugin, 'CAMERA_ONLINE', function(id) {
      let cameraModule = cameraModules.find(camera => camera.config.id === id);

      if (cameraModule) {
        let camState = self.cameras[id] = self.cameras[id] || {};
        camState.module = cameraModule;
        camState.available = 'ONLINE';
        camState.cameraDirectory = self.getCameraDirectory(id);

        // create a directory where we can save pictures taken from the camera and serve them publically.
        fs.ensureDir(camState.cameraDirectory)
          .then(() => {
            self.dashboard.camera_onvif.connect(plugin, id, cameraModule.config.username, cameraModule.config.password);
          });
      }
    });

    this.dashboard.camera_onvif.on(plugin, 'CAMERA_CONNECTED', function(result) {
      let camState = self.cameras[result.id];
      camState.model = result.model;
      camState.manufacturer = result.manufacturer;
      camState.available = 'CONNECTED';

      self.sendSocketNotification('CAMERA_CONNECTED', result);
    });

    this.dashboard.camera_onvif.on(plugin, 'CAMERA_OFFLINE', function(id) {
      let camState = self.cameras[id] = self.cameras[id] || {};
      camState.available = 'OFFLINE';

      self.sendSocketNotification('CAMERA_DISCONNECTED', id);
    });

    this.dashboard.camera_onvif.on(plugin, 'SNAPSHOT', function(result) {
      let camState = self.cameras[result.id];

      // get remote picture and save to local public directory, so that we can serve it to our clients.

      let fileStream = fs.createWriteStream(`${camState.cameraDirectory}/current.jpg`);
      fileStream.on('finish', () => {
        let snapshot = {
          id: result.id,
          uri: self.getCameraSnapshotUri(result.id),
          datetime: result || new Date()
        };

        self.sendSocketNotification('SNAPSHOT', snapshot);
      });

      fileStream.on('error', err => {
        console.error('Failed to save snapshot to file.');
      });
      
      request.get(result.uri)
      .auth(camState.module.config.username, camState.module.config.password, false)
      .pipe(fileStream)
      .on('error', err => {
        console.eror('Failed to get snapshot picture from camera.');
      });        
    });

    this.dashboard.camera_onvif.start(plugin);
  }
});
