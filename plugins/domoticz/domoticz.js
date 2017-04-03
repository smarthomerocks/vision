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

        self.emit('change', {id: data.idx, level: data.svalue1, isStateOn: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype });


            console.log('Plugin ' +  'domotics'.yellow.bold + ' data'.blue, {id: data.idx, level: data.svalue1, isStateOn: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype });
      });

      this.domoticz.on('connect', function() {
        console.log('Plugin ' + 'domoticz '.yellow.bold + 'connected'.blue + ' with MQTT');

        self.emit('connect');
      });
    }
  };
  this.getStatus = function(id) {
    console.log('Plugin ' + 'domoticz '.yellow.bold + 'getStatus'.blue, id);
    this.domoticz.request(id);
  };
  this.switch = function(id, level) {
    console.log('Plugin ' + 'domoticz '.yellow.bold + 'switch'.blue, id, level);
    this.domoticz.switch(id, level);
  };
  this.toggle = function(id, state) {
    console.log('Plugin ' + 'domoticz '.yellow.bold + 'toggle'.blue, id, state);
    this.domoticz.switch(id, state ? 255 : 0);
  };
};

util.inherits(Domoticz, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new Domoticz(Dashboard, app, io, config);
	}
};
