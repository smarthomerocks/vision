
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'dashboard-google-calendar.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      console.log('run: "node ' + __dirname + '/google-authorize.js" to create a authorize token to Google calendar.');
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function GoogleCalendar(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.googleAuth = null;

  this.start = function() {
    var self = this;

    if (this.googleAuth) {
      this.emit('connect');
    } else {
      // Load client secrets from a local file.
      fs.readFile(__dirname + '/client_secret.json', function processClientSecrets(err, content) {
        if (err) {
          console.log('Error loading client secret file: ' + err);
          console.log('run: "node ' + __dirname + '/google-authorize.js" to create a authorize token to Google calendar.');
          return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        authorize(JSON.parse(content), function(auth) {
          self.googleAuth = auth;
          self.emit('connect');
        });
      });

    }
  };

  this.getEvents = function(calendarId, numberOfEvents) {
    clearTimeout(this.eventIndex);

    var self = this,
        calendar = google.calendar('v3'),
        today = new Date();

    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);

    calendar.events.list({
      auth: this.googleAuth,
      calendarId: calendarId || 'primary',
      timeMin: today.toISOString(),
      maxResults: numberOfEvents || 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return callback(err);
      }

      var events = [];

      for (var i = 0, length = response.items.length; i < length; i++) {
        var event = response.items[i];

        events.push({
          description: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          isAllDay: !!(event.start.date && event.end.date)
        });
      }

      self.emit('change', { calendarId: calendarId || 'primary', events: events});

      self.eventIndex = setTimeout(function() {
        self.getEvents(calendarId, numberOfEvents);
      }, config.pollingInterval || 60000);
    });
  };

};

util.inherits(GoogleCalendar, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new GoogleCalendar(Dashboard, app, io, config);
	}
};
