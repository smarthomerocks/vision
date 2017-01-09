var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var mqtt = require('node-domoticz-mqtt');

function Domoticz(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.type = 'home';
  this.start = function() {

    var idx = _.map(_.filter(Dashboard.getConfig().modules, function(module){ return module.config.plugin == 'domoticz';}), function(module) { return module.config['id'] })

    var self = this,
        options = {
          idx: idx,
          host: config.host,
          status: 'remote/connected',
          request: true,
          log: config.log
        };

    if (this.domoticz) {
      this.emit('connect');
    } else {
      this.domoticz = new mqtt.domoticz(options);

      this.domoticz.on('data', function(data) {
        console.log('Domoticz data', data);

        self.emit('change', {id: data.idx, level: data.svalue1, isStateOn: !!data.nvalue });
      });

      this.domoticz.on('connect', function() {
        console.log('Domoticz connected');

        self.emit('connect');
      });
    }
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
	create: function(Dashboard, app, io, config) {
		return new Domoticz(Dashboard, app, io, config);
	}
};
