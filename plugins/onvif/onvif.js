const EventEmitter = require('events').EventEmitter,
      logger = require('../../logger').logger,
      util = require('util'),
      onvif = require('onvif');

function Onvif(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this;
  self.cameras = new Map();
  self.connected = false;

  /**
   * Setup cameras from module config.
   */
  async function setupCameras() {
    let newCameras = new Map();

    // http://www.gadgetvictims.com/2017/01/veskys-and-digoo-bb-m2-ip-cameras-onvif.html
    
    for (let config of self.modulesConfig) {
      try {
        const camera = await initCamera(config);
        const information = await getCameraInformation(camera);
        const streamUri = await getStreamUri(camera);
        const snapshotUri = await getSnapshotUri(camera);
        
        logger.info(`Camera setup using id: ${config.id}, title: ${config.title}, manufacturer: ${information.manufacturer}, model: ${information.model}.`);

        newCameras.set(config.id, {
          id: config.id,
          cameraInstance: camera,
          manufacturer: information.manufacturer,
          model: information.model,
          streamUri: streamUri,
          snapshotUri: snapshotUri
        });
      } catch(error) {
        logger.error(`Failed to setup camera with id: ${config.id}, title: ${config.title}. Error: "${error.stack}".`);
      }
    }

    self.cameras = newCameras;
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

    if(self.connected) {
      self.emit('CONNECTED');
      return;
    }

    self.modulesConfig = Dashboard.getModulesByPluginName('onvif').map(module => module.config);
    self.connected = true;
    self.emit('CONNECTED');

    setupCameras()
      .then(() => {
        for (let camera of self.cameras) {
          self.emit('CAMERA_CONNECTED', camera[1]);
        }      
      }); 
  };

  self.exit = function() {
    self.cameras.clear();
  };

  self.getSnapshot = function(id) {
    let camera = self.cameras.get(id);

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
    let camera = self.cameras.get(id);

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
