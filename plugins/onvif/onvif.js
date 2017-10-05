const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      onvif = require('onvif');

function Onvif(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this,
      cameras = new Map();
      //probeInterval;

// https://www.reddit.com/r/raspberry_pi/comments/5677qw/hardware_accelerated_x264_encoding_with_ffmpeg/


  /*if (!config.username || !config.password) {
   console.log('Plugin "' + 'onvif'.yellow.bold + '", please check config. Could not find username and/or password.'.red);
   return;
}*/

  /**
   * Scan network for onvif-enabled cameras.
   *
   */
  function scan4Cams() {
    onvif.Discovery.probe(function(err, cams) {
      if (err) {
        console.warn('Got an error when scanning network for available onvif-compatible cameras. Error=' + err.message);
      } else {
        let tmpCameras = new Map();

        for (let cam of cams) {
          tmpCameras.set(cam.hostname, cam);
          if (!cameras.has(cam.hostname)) {
            //self.emit('change', newcam);
            console.log(`found new onvif-camera on ${cam.hostname}:${cam.port}.`);
          }
        }

        for (let cam of cameras) {
          if (!tmpCameras.has(cam.hostname)) {
            //self.emit('change', removecam);
            console.log(`onvif-camera on ${cam.hostname}:${cam.port} no longer available.`);
          }
        }

        cameras = tmpCameras;
      }
    });
  }

  self.start = function() {

    scan4Cams();

    self.probeInterval = setInterval(scan4Cams, 30000);
    /*new onvif.Cam({
      hostname: "192.168.10.160",
      port: 10080,
      username: "admin",
      password: "R35x55H"
    }, function(err) {
      if (err) {
        console.error(err);
      } else {
        //this.absoluteMove({x: 1, y: 1, zoom: 1});
        this.getStreamUri({protocol: 'RTSP'}, function(err, stream) {

        });
      }
    });*/

    self.emit('connect');
  };

  self.exit = function() {

    if (self.probeInterval) {
      clearInterval(self.probeInterval);
    }

    cameras.clear();
  };

  self.getStatus = function(name) {

  };

  self.getSnapshot = function(name) {

  };

  self.getLiveliew = function(name) {

  };

}

util.inherits(Onvif, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Onvif(Dashboard, app, io, config);
  }
};
