var EventEmitter = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var APIFetcher = require("./apifetcher.js");

function SMHI(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.start = function() {
    this.fetchers = [];

    this.emit('connect');

    console.log('SMHI connected');
  };

  this.getCurrent = function(lat, lon) {
    console.log('SMHI getCurrent: ', lat, lon);

    var self = this,
        fetcher,
        id = lat + lon;

		if (typeof self.fetchers[id] === "undefined") {
			fetcher = new APIFetcher(lat, lon, config.fetchInterval || 60000);

			fetcher.onReceive(function(fetcher) {
        self.emit('change', { lat: fetcher.lat(), lon: fetcher.lon(), currentWeather: fetcher.currentWeather()});
			});

			fetcher.onError(function(fetcher, error) {
        console.log('Fetch error: ', error);
			});

			self.fetchers[id] = fetcher;
		} else {
			console.log('Use existing fetcher for lat: ' + lat + ' lon: ' + lon);
			fetcher = self.fetchers[id];
			fetcher.broadcastCurrentWeather();
		}

		fetcher.startFetch();
  };

};

util.inherits(SMHI, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new SMHI(Dashboard, app, io, config);
	}
};
