var EventEmitter = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var ical = require('ical');
var moment = require('moment');
var CalendarFetcher = require("./calendarfetcher.js");

function ICal(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.start = function() {
    var events = [];

		this.fetchers = [];

    this.emit('connect');

    console.log('ICal connected');
  };

  this.getEvents = function(url, fetchInterval, maximumEntries, maximumNumberOfDays, user, pass) {
    console.log('ICal getEvents: ', url);

    var self = this,
        fetchInterval,
        maximumNumberOfDays,
        user,
        pass,
        fetcher;

		if (typeof self.fetchers[url] === "undefined") {
			console.log("Create new calendar fetcher for url: " + url + " - Interval: " + fetchInterval || 10000);
			fetcher = new CalendarFetcher(url, fetchInterval, maximumEntries, maximumNumberOfDays, user, pass);

			fetcher.onReceive(function(fetcher) {

        self.emit('change', { url: fetcher.url(), events: fetcher.events()});
			});

			fetcher.onError(function(fetcher, error) {
        console.log('Fetch error: ', error);
			});

			self.fetchers[url] = fetcher;
		} else {
			console.log('Use existing news fetcher for url: ' + url);
			fetcher = self.fetchers[url];
			fetcher.broadcastEvents();
		}

		fetcher.startFetch();
  };

};

util.inherits(ICal, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new ICal(Dashboard, app, io, config);
	}
};
