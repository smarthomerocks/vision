var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var mqtt = require('node-domoticz-mqtt');
var request = require('request');
var logger = require('../../logger').logger;

function Domoticz(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let modulesConfig;
  this.type = 'home';

  this.start = function() {

    modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'domoticz').map(module => module.config);

    let idx = modulesConfig.map(config => config['id']);

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

        // Try to get more info by polling Domoticz thru http 
        if(data.stype === 'kWh' || data.dtype === 'kWh') {
          // Energy meter
          request({
            uri: 'http://' + config.host + ':' + config.httpport + '/json.htm?type=graph&sensor=counter&idx='+data.idx+'&range=month'
          }, function(err, response, body) {
            var result = JSON.parse(body);

            if(result.status === 'OK') {

              var todayDate = new Date();
              var lowest = _.min(result.result, function(o) {return o.v;});
              var highest = _.max(result.result, function(o) {return o.v;});
              var today = _.find(result.result, function(o) { return o.d === todayDate.toISOString().substring(0, 10);});

              if(lowest && highest) {
                self.emit('change', {id: data.idx, level: data.svalue1, state: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype, lowest: lowest.v, lowestdate: lowest.d, highest: highest.v, highestdate: highest.d, today: today ? today.v : null });
              }
            }
          });
        } else if(data.stype === 'Temp' || data.dtype === 'Temp') {
          // Temperature
          request({
            uri: 'http://' + config.host + ':' + config.httpport + '/json.htm?type=graph&sensor=temp&idx='+data.idx+'&range=month'
          }, function(err, response, body) {
            var result = JSON.parse(body);
            if(result.status === 'OK') {
              var lowest = _.min(result.result, function(o) {return o.tm;});
              var highest = _.max(result.result, function(o) {return o.te;});

              if(lowest && highest) {
                self.emit('change', {id: data.idx, level: data.svalue1, state: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype, lowest: lowest.tm, lowestdate: lowest.d, highest: highest.te, highestdate: highest.d });
              }
            }
          });
        } else if(data.stype === 'RFXMeter counter' || data.dtype === 'RFXMeter') {
          // Counter
          request({
            uri: 'http://' + config.host + ':' + config.httpport + '/json.htm?type=graph&sensor=temp&idx='+data.idx+'&range=month'
          }, function(err, response, body) {
            var result = JSON.parse(body);
            if(result.status === 'OK') {
              var lowest = _.min(result.result, function(o) {return o.tm;});
              var highest = _.max(result.result, function(o) {return o.te;});

              if(lowest && highest) {
                self.emit('change', {id: data.idx, level: data.svalue1, state: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype, lowest: lowest.tm, lowestdate: lowest.d, highest: highest.te, highestdate: highest.d, unit: data.ValueUnits });
              }
            }
          });
        } else {
          self.emit('change', {id: data.idx, level: data.svalue1, state: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype, unit: data.ValueUnits });
        }

        //logger.debug('Plugin ' +  'domotics'.yellow.bold + ' data'.blue, {id: data.idx, level: data.svalue1, state: !!data.nvalue, value: data.svalue1, value_extra: data.svalue2, type: data.stype });
      });

      this.domoticz.on('connect', function() {
        logger.info('Plugin ' + 'domoticz '.yellow.bold + 'connected'.blue + ' with MQTT');

        // Momentary buttons should all be off to start with.
        for (let module of modulesConfig) {
          if (module.type === 'button momentary') {
            self.client.publish(module.setTopic, 0);
          }
        }

        self.emit('connect');
      });
    }
  };
  this.getStatus = function(id) {
    logger.debug('Plugin ' + 'domoticz '.yellow.bold + 'getStatus'.blue, id);
    this.domoticz.request(id);
  };
  this.setLevel = function(id, level) {
    logger.debug('Plugin ' + 'domoticz '.yellow.bold + 'setLevel'.blue, id, level);
    this.domoticz.switch(id, level);
  };
  this.toggle = function(id, state) {
    logger.debug('Plugin ' + 'domoticz '.yellow.bold + 'toggle'.blue, id, state);
    this.domoticz.switch(id, state ? 255 : 0);
  };
}

util.inherits(Domoticz, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Domoticz(Dashboard, app, io, config);
  }
};
