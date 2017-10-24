var EventEmitter = require('events').EventEmitter;
var util = require('util');
var CalendarFetcher = require('./calendarfetcher.js');
var colors = require('colors'); //eslint-disable-line no-unused-vars

function ICal(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.start = function() {
    this.fetchers = [];
    this.emit('connect');
    console.log('Plugin ' + 'ical '.yellow.bold + 'connected');
  };

  this.getEvents = function(url, fetchInterval, maximumEntries, maximumNumberOfDays, user, pass) {
    console.log('Plugin ' + 'ical '.yellow.bold + 'getEvents ' + url);
    var self = this,
        fetcher;

    if (typeof self.fetchers[url] === 'undefined') {

      console.log('Plugin ' + 'ical '.yellow.bold + 'fething ' + url);

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

}

util.inherits(ICal, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new ICal(Dashboard, app, io, config);
  }
};
