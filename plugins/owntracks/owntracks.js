var EventEmitter = require('events').EventEmitter;
var util = require('util');
var mqtt = require('mqtt');
var logger = require('../../logger').logger;

function Owntracks(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.mqttConnection = null;
  this.lastReceivedData = null;

  this.start = function() {
    var self = this;

    if (this.mqttConnection) {
      this.emit('connect');

      if (this.lastReceivedData) {
        this.emit('change', this.lastReceivedData);
      }
    } else {
      this.mqttConnection = mqtt.connect('mqtt://' + config.host);

      this.mqttConnection.on('message', function(topic, message) {
        var deviceId = topic.split('/')[2],
            data = JSON.parse(message),
            owntracksData = {id: deviceId, lat: data.lat, lon: data.lon};

        self.lastReceivedData = owntracksData;
        self.emit('change', owntracksData);

        logger.debug('Owntracks data: ' + JSON.stringify(owntracksData));
      });

      this.mqttConnection.on('connect', function() {
        logger.info('Owntracks connected');

        self.mqttConnection.subscribe('owntracks/#');

        self.emit('connect');
      });
    }
  };

}

util.inherits(Owntracks, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Owntracks(Dashboard, app, io, config);
  }
};
