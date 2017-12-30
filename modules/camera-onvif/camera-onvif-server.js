const fs = require('fs-extra'),
      uuid = require('uuid/v4'),
      request = require('request'),
      logger = require('../../logger').logger,
      ModuleServer = require('../../lib/module-server.js'),
      rootCameraDirectory = `${process.cwd()}/public/module/camera`,
      PLUGIN = 'onvif';

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    switch (command) {
      case 'CAMERA_CONNECT':
        this.connect(data.id);
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
      this.dashboard.camera_onvif.getSnapshot(PLUGIN, id);

      camState.snapshotInterval = setInterval(() => {
        this.dashboard.camera_onvif.getSnapshot(PLUGIN, id);
      }, 3000);
    }
  },

  stopVideo: function(id) {

    let camState = this.cameras[id];
    
    if (camState) {
      camState.state === '';

      if (camState.snapshotInterval) {
        clearInterval(camState.snapshotInterval);
        camState.snapshotInterval = undefined;
      }
    }
  },

  connect: function(id) {

    let self = this,
        cameraModules = this.dashboard.getConfig().modules.filter(module => module.module === 'camera-onvif');

    // if another client connect to the dashboard when we already are up and running, notify the client that the camera is already connected.
    if (this.cameras[id]) {
      this.sendSocketNotification('CAMERA_CONNECTED', {id: id});
      return;
    }

    // if we already has started the plugin, nothing nee to be done.
    if (this.isConnected) {
      return;
    }

    this.dashboard.camera_onvif.once(PLUGIN, 'CONNECTED', () => {
      self.isConnected = true;
    });

    this.dashboard.camera_onvif.on(PLUGIN, 'CAMERA_CONNECTED', function(result) {
      let id = result.id,
          cameraModule = cameraModules.find(camera => camera.config.id === id);         
            
      if (cameraModule) {
        let camState = self.cameras[id] = self.cameras[id] || {};
        camState.module = cameraModule;
        camState.model = result.model;
        camState.manufacturer = result.manufacturer;
        camState.available = 'CONNECTED';
        camState.cameraDirectory = self.getCameraDirectory(id);

        // create a directory where we can save pictures taken from the camera and serve them publically.
        fs.ensureDir(camState.cameraDirectory)
          .then(() => {
            self.sendSocketNotification('CAMERA_CONNECTED', {id: id});
          });
      }
    });

    this.dashboard.camera_onvif.on(PLUGIN, 'CAMERA_DISCONNECTED', function(id) {
      let camState = self.cameras[id] = self.cameras[id] || {};
      camState.available = 'DISCONNECTED';

      self.sendSocketNotification('CAMERA_DISCONNECTED', id);
    });

    this.dashboard.camera_onvif.on(PLUGIN, 'SNAPSHOT', function(result) {
      let camState = self.cameras[result.id];

      // get remote picture and save to local public directory, so that we can serve it to our clients.

      let fileStream = fs.createWriteStream(`${camState.cameraDirectory}/current.jpg`);
      fileStream.on('finish', () => {
        let snapshot = {
          id: result.id,
          uri: self.getCameraSnapshotUri(result.id),
          datetime: result.datetime || new Date()
        };

        self.sendSocketNotification('SNAPSHOT', snapshot);
      });

      fileStream.on('error', err => {
        logger.error('Failed to save snapshot to file.');
      });
      
      request.get(result.uri)
      .auth(camState.module.config.username, camState.module.config.password, false)
      .pipe(fileStream)
      .on('error', err => {
        logger.eror('Failed to get snapshot picture from camera.');
      });        
    });

    this.dashboard.camera_onvif.start(PLUGIN);
  }
});
