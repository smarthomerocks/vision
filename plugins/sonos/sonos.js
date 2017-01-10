var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var sonosdevice = require('sonos');
var Listener = require('sonos/lib/events/listener');
var async = require('async');

function Sonos(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.timeout = config.timeout;
  var devices = [];
  
  this.type = 'home';
  this.start = function() {
    var self = this;
    console.log("Sonos plugin start. Scanning for devices");

    sonosdevice.search({timeout:this.timeout}, function (device, model) {
      var data = {ip: device.host, port: device.port, model: model}

      var exists = _.find(devices, function(dev){ return dev.device.host == device.host; });
      if(exists == null){

      device.getZoneAttrs(function (err, attrs) {
        if (!err) {
          _.extend(data, attrs)
        }
        device.getZoneInfo(function (err, info) {
          if (!err) {
            _.extend(data, info)
          }
          device.getTopology(function (err, info) {
            if (!err) {
              info.zones.forEach(function (group) {
                if (group.location === 'http://' + data.ip + ':' + data.port + '/xml/device_description.xml') {
                  _.extend(data, group)
                }
              })
            }

            var x = new Listener(device, {'interface': 'public'}) // Specify interface name when using multiple interfaces. or public for default.
            x.listen(function (err) {
              if (err) throw err

              x.addService('/MediaRenderer/AVTransport/Event', function (error, sid) {
                if (error) throw err
                  x.addService('/MediaRenderer/RenderingControl/Event', function (error, sidRender) {
                      if (error) throw err
                        devices.push({device: device, data:data, listener: x, listenertransport: sid, listenerrender: sidRender});
                    })
              })

              x.on('serviceEvent', function (endpoint, sid, outdata) {
                device.currentTrack(function (err, track) {
                  device.getVolume(function (err, volume) {
                    device.getCurrentState(function (err, state) {
                      device.getQueue(function (err, queue) {
                        self.emit('change', {device: data.CurrentZoneName, currenttrack: track, volume: volume, state:state });
                     })
                    })
                  })
                })
              })
              
            })

          });
        });
      });

      }

    });

    setTimeout(function () {
      self.getBridges(devices).forEach(function (bridge) {
        console.log(bridge)
        getBridgeDevices(devices).forEach(function (device) {
        })
      })
      self.getZones(devices).forEach(function (zone) {
        var coordinator = self.getZoneCoordinator(zone, devices)
        if (coordinator !== undefined) {
        }
        self.getZoneDevices(zone, devices).forEach(function (device) {
          
        })
      })
      self.emit('connect');
    }, this.timeout);
  };

  this.getBridges = function (deviceList) {
    var bridges = []
    deviceList.forEach(function (device) {
      if (device.CurrentZoneName === 'BRIDGE' && bridges.indexOf(device.ip + ':' + device.port) === -1) {
        bridges.push(device.ip + ':' + device.port)
      }
    })
    return bridges
  };

  this.getBridgeDevices = function (deviceList) {
    var bridgeDevices = []
    deviceList.forEach(function (device) {
      if (device.CurrentZoneName === 'BRIDGE') {
        bridgeDevices.push(device)
      }
    })
    return bridgeDevices
  };

  this.getZones = function(deviceList) {
    var zones = []
    deviceList.forEach(function (device) {
      if (zones.indexOf(device.CurrentZoneName) === -1 && device.CurrentZoneName !== 'BRIDGE') {
        zones.push(device.CurrentZoneName)
      }
    })
    return zones
  };

  this.getZoneDevices= function (zone, deviceList) {
    var zoneDevices = []
    deviceList.forEach(function (device) {
      if (device.CurrentZoneName === zone) {
        zoneDevices.push(device)
      }
    })
    return zoneDevices
  };

this.getZoneCoordinator = function(zone, deviceList) {
  var coordinator
  deviceList.forEach(function (device) {
    if (device.CurrentZoneName === zone && device.coordinator === 'true') {
      coordinator = device
    }
  })
  return coordinator
}

this.changePlayState = function(devicename, state){
  _.each(devices, function(device){
  if (device.data.CurrentZoneName == devicename){
    if(state === "playing"){
      device.device.play(function (err, stopped) {
      });
    }else if(state === "paused"){
      device.device.pause(function (err, stopped) {
      });
    }
    }
  });
},

this.changeVolume = function(devicename, volume){
  console.log("changeVolume devicename " + devicename, volume);
  _.each(devices, function(device){
    if (device.data.CurrentZoneName == devicename){
      device.device.setVolume(volume, function (err, stopped) {
      });
    }
  });
},

this.prev = function(devicename){
  console.log("prev devicename " + devicename);
  _.each(devices, function(device){
    if (device.data.CurrentZoneName == devicename){
      device.device.previous(function (err, stopped) {
      });
    }
  });
},

this.next = function(devicename){
  console.log("next devicename " + devicename);
  _.each(devices, function(device){
    if (device.data.CurrentZoneName == devicename){
      device.device.next(function (err, stopped) {
      });
    }
  });
},

 this.getStatus = function(devicename) {

    var self = this;
    _.each(devices, function(device){
      if (device.data.CurrentZoneName  == devicename){
      device.device.currentTrack(function (err, track) {
        device.device.getVolume(function (err, volume) {
          device.device.getCurrentState(function (err, state) {
            self.emit('change', {device: device.data.CurrentZoneName, currenttrack: track, volume: volume, state:state });
          });
        });
      });
    }
  });
}; 

this.exit = function() {
  devices.forEach(function (device) {
    device.listener.removeService(device.listenertransport, function(err, result){
      if(!err){
        console.log("Succesfully removed transport listener... " + device.listenertransport);
      }
    });
    device.listener.removeService(device.listenerrender, function(err, result){
      if(!err){
        console.log("Succesfully removed render listener... " + device.listenerrender);
      }
    });

    device.listener = null;
  })
}; 
};

util.inherits(Sonos, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new Sonos(Dashboard, app, io, config);
	}
};
