var EventEmitter = require('events').EventEmitter;
var util = require('util');
var APIFetcher = require('./apifetcher.js');
var logger = require('../../logger').logger;
var colors = require('colors'); //eslint-disable-line no-unused-vars

function SMHI(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.start = function() {
    this.fetchers = [];

    this.emit('connect');

    logger.info('Plugin ' + 'smhi '.yellow.bold + 'connected'.blue);
  };

  this.getCurrent = function(lat, lon) {
    logger.debug('Plugin ' + 'smhi '.yellow.bold + 'getCurrent'.blue, lat, lon);

    var self = this,
        fetcher,
        id = lat + lon;

    if (typeof self.fetchers[id] === 'undefined') {
      fetcher = new APIFetcher(lat, lon, config.fetchInterval || 60000);

      fetcher.onReceive(function(fetcher) {
        var data = { lat: fetcher.lat(), lon: fetcher.lon(), currentWeather: fetcher.currentWeather()};

        logger.debug('Plugin ' + 'smhi '.yellow.bold + 'data'.blue, data);

        self.emit('change', data);
      });

      fetcher.onError(function(fetcher, error) {
        logger.error('Plugin ' + 'smhi '.yellow.bold + 'Fetch error'.blue, error);
      });

      self.fetchers[id] = fetcher;
    } else {
      logger.debug('Plugin ' + 'smhi '.yellow.bold + 'Use existing fetcher for lat: ' + lat + ' lon: ' + lon);
      fetcher = self.fetchers[id];
      fetcher.broadcastCurrentWeather();
    }

    fetcher.startFetch();
  };

}

util.inherits(SMHI, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new SMHI(Dashboard, app, io, config);
  }
};
