var EventEmitter = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var itach = require('itach');
var logger = require('../../logger');

function ITach(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.commands = {};
  this.isConnected = false;

  for (var hardware in config.hardwares) {
    if (config.hardwares.hasOwnProperty(hardware)) {
      if (!this.commands.hasOwnProperty(hardware)) {
        this.commands[hardware] = require(__dirname + '/commands/' + config.hardwares[hardware].commands);
      }
    }
  }

  this.start = function() {
    var self = this;

    if (this.isConnected) {
      this.emit('connect');
    } else {
      itach.on('connect', function() {
        logger.info('ITach connected');

        self.isConnected = true;

        self.emit('connect');
      });

      itach.connect({ host: config.host, reconnect: false });
    }
  };

  this.sendCommand = function(commands, callback) {
    var self = this,
        hasError = false;

    async.eachSeries(commands, function(command, callback) {
      var options = {
        repeat: command.repeat || 1,
        module: config.hardwares[command.hardware].module,
        ir: self.commands[command.hardware][command.command]
      };

      itach.sendir(options, function(err, data) {
        if (err) {
          hasError = true;
        }

        setTimeout(callback, 100);
      });
    }, function() {
      if (callback) {
        callback(hasError);
      }
    });
  };
}

util.inherits(ITach, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new ITach(Dashboard, app, io, config);
  }
};
