const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      onvif = require('onvif');

function Onvif(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this,
      modulesConfig,
      cameras = new Map();

  /**
   * Setup cameras from module config.
   */
  async function setupCameras() {
    let newCameras = new Map();

    // http://www.gadgetvictims.com/2017/01/veskys-and-digoo-bb-m2-ip-cameras-onvif.html
    
    for (let config of modulesConfig) {
      const camera = await initCamera(config);
      const information = await getCameraInformation(camera);
      const streamUri = await getStreamUri(camera);
      const snapshotUri = await getSnapshotUri(camera);
        
      newCameras.set(config.id, {
        id: config.id,
        cameraInstance: camera,
        manufacturer: information.manufacturer,
        model: information.model,
        streamUri: streamUri,
        snapshotUri: snapshotUri
      });
    }

    cameras = newCameras;
  }

  function initCamera(config) {
    return new Promise((resolve, reject) =>{ 
      new onvif.Cam({
        hostname: config.id,
        port: config.port || 10080,
        username: config.username,
        password: config.password
      }, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(this);
        }
      });
    });
  }

  function getCameraInformation(camera) {
    return new Promise((resolve, reject) => {
      camera.getDeviceInformation(function(error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  function getStreamUri(camera) {
    return new Promise((resolve, reject) => {
      camera.getStreamUri({protocol: 'RTSP'}, function(error, stream) {
        if (error) {
          reject(error);
        } else {
          resolve(stream.uri);
        }
      });
    });
  }

  function getSnapshotUri(camera) {
    return new Promise((resolve, reject) => {
      camera.getSnapshotUri(function(error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data.uri);
        }
      });
    });
  }

  self.start = function() {

    modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'onvif').map(module => module.config);

    self.emit('CONNECTED');

    setupCameras()
    .then(() => {
      for (let camera of cameras) {
        self.emit('CAMERA_CONNECTED', camera[1]);
      }      
    })
    .catch(error => {
      console.log(`Failed to setup cameras. Error: "${error.stack}".`);
    });
  };

  self.exit = function() {
    cameras.clear();
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

    self.emit('SNAPSHOT', {
      id: id,
      uri: camera.snapshotUri,
      datetime: new Date()
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

    //TODO: implement!
    self.emit('STARTED_STREAM', {
      id: id,
      uri: 'xxxx',
      datetime: new Date()
    });
  };

  self.stopLiveStream = function(id) {
    //TODO: implement!
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
