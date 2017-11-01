const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      onvif = require('onvif');

function Onvif(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this,
    modulesConfig,
      cameras = new Map();

  /**
   * Scan network for ONVIF-enabled cameras.
   */
  function scan4Cams() {
    new onvif.Cam({
      hostname: "192.168.10.51",
      port: 10080,
      username: "admin",
      password: "R35x55H"
    }, function(err) {
      if (!err) {
        cameras.set(this.hostname, this);
        //this.absoluteMove({x: 1, y: 1, zoom: 1});
      this.getStreamUri({protocol:'RTSP'}, function(err, stream) {
        console.warn('mupp');
        });
      }
    });

    /*onvif.Discovery.probe(function(err, cams) {
      if (err) {
        console.warn('Got an error when scanning network for available ONVIF-compatible cameras. Error=' + err.message);
      } else {
        let tmpCameras = new Map();

        for (let cam of cams) {
          tmpCameras.set(cam.hostname, cam);

          if (!cameras.has(cam.hostname)) {
            setImmediate(() => {
              self.emit('CAMERA_ONLINE', cam.hostname);
            }, cam);

            console.log(`found new ONVIF-camera on ${cam.hostname}:${cam.port}.`);
          }
        }

        for (let cam of cameras) {
          if (!tmpCameras.has(cam.hostname)) {
            setImmediate(() => {
              self.emit('CAMERA_OFFLINE', cam.hostname);
              console.log(`ONVIF-camera on ${cam.hostname}:${cam.port} no longer available.`);
            }, cam);
          }
        }

        cameras = tmpCameras;
      }
    });*/
  }

  self.start = function() {

    modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'onvif').map(module => module.config);

    scan4Cams();
    self.probeInterval = setInterval(scan4Cams, 30000);

    self.emit('CONNECTED');
  };

  self.exit = function() {

    if (self.probeInterval) {
      clearInterval(self.probeInterval);
    }

    cameras.clear();
  };

  self.connect = function(id, username, password) {
    let cam = cameras.get(id);

    if (cam) {
      cam.username = username;
      cam.password = password;

      cam.connect(function() {
        //this.absoluteMove({x: 1, y: 1, zoom: 1});

        this.getDeviceInformation(function(error, data) {
          if (error) {
            console.error(`Failed to get device information about connected camera. Error: ${error.stack}".`);
            self.emit('CAMERA_CONNECTED', {
              error: {
                id: id,
                msg: 'Failed to get device information from camera.'
              }
            });
          } else {
            self.emit('CAMERA_CONNECTED', {
              id: id,
              model: data.model,
              manufacturer: data.manufacturer
            });

            console.log(`Connected to camera with id "${id}" and of model "${data.model}".`);
          }
        });
      });
    }
  };

  self.getSnapshot = function(id) {
    let camera = cameras.get(id);
    if (!camera) {
      self.emit('SNAPSHOT', {
        error: {
          id: id,
          msg: 'Failed to get snapshot from camera, camera not connected.'
        }
      });

      return;
    }

    camera.getSnapshotUri((error, data) => {
      if (error) {
        console.error(`Failed to get snapshot from camera. Error: ${error.stack}".`);
        self.emit('SNAPSHOT', {
          error: {
            id: id,
            msg: 'Failed to get snapshot from camera.'
          }
        });
      } else {
        self.emit('SNAPSHOT', {
          id: id,
          uri: data.uri,
          datetime: new Date()
        });
      }
    });
  };

  self.startLiveStream = function(id) {
    let camera = cameras.get(id);
    if (!camera) {
      self.emit('START_STREAM', {
        error: {
          id: id,
          msg: 'Failed to start videostream on camera, camera not connected.'
        }
      });

      return;
    }

    camera.getStreamUri({
      protocol: 'RTSP'
    }, function(err, stream) {
      self.emit('STARTED_STREAM', {
        id: id,
        uri: stream.uri,
        datetime: new Date()
      });
    });
  };

  self.stopLiveStream = function(id) {
    self.emit('STOPPED_STREAM', {
      id: id,
      datetime: new Date()
    });
  };
}

util.inherits(Onvif, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Onvif(Dashboard, app, io, config);
  }
};
