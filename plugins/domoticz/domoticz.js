var EventEmitter = require('events').EventEmitter;
var util = require('util');
var mqtt    = require('node-domoticz-mqtt');
var options = {
      idx:        [ 1, 4 ],
      host:       '192.168.0.39',
      status:     'remote/connected',
      request:    true,
      log:        false
  };

function Domoticz() {
  EventEmitter.call(this);

  this.type = 'home';
  this.start = function() {
    var self = this;
    this.domoticz = new mqtt.domoticz(options);

    this.domoticz.on('data', function(data) {
      console.log('Domoticz data', data);

      self.emit('change', {id: data.idx, level: data.svalue1, isStateOn: !!data.nvalue });
    });

    this.domoticz.on('connect', function() {
      console.log('Domoticz connected');

      self.emit('connect');
    });
  };
  this.getStatus = function(id) {
    console.log('getStatus', id);
    this.domoticz.request(id);
  };
  this.switch = function(id, level) {
    console.log('swith', id, level);

    this.domoticz.switch(id, level);
  };
  this.toggle = function(id, state) {
    console.log('toggle', id, state);

    this.domoticz.switch(id, state ? 255 : 0);
  };
};

util.inherits(Domoticz, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io) {
		return new Domoticz(Dashboard, app, io);
	}
};
