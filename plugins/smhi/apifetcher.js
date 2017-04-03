var http = require("http");
var url = require("url");
var moment = require("moment");

var APIFetcher = function(lat, lon, fetchInterval) {
	var self = this;

	var reloadTimer = null;
	var currentWeather = null;

	var fetchFailedCallback = function() {};
	var currentWeatherReceivedCallback = function() {};

	/* fetchCalendar()
	 * Initiates calendar fetch.
	 */
	var fetchWeather = function() {

		clearTimeout(reloadTimer);
		reloadTimer = null;

    var request = http.request(url.parse('http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/' + lon + '/lat/' + lat + '/data.json'
        ), function(response) {
          var res = '';

          response.on('data', function (chunk) {
            res += chunk;
          });

          response.on('end', function () {
            var timeSeries = JSON.parse(res);

            currentWeather = null;

            var now = new Date(),
                currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();

            for (var i = 0, length = timeSeries.timeSeries.length; i < length; i++) {
              var time = timeSeries.timeSeries[i],
                  validDate = new Date(time.validTime);

              if (currentHour === validDate.getTime()) {
                currentWeather = {
                  date: moment(validDate).format('x'),
                  icon: (time.parameters && time.parameters[18]) ? time.parameters[18].values[0] : '',
                  temp: (time.parameters && time.parameters[1]) ? time.parameters[1].values[0] : ''
                };
              }
            }

      			self.broadcastCurrentWeather();
      			scheduleTimer();
          });
        });

    request.on('error', function (e) {
      fetchFailedCallback(self, e);
      scheduleTimer();
    });

    request.end();
	};

	/* scheduleTimer()
	 * Schedule the timer for the next update.
	 */
	var scheduleTimer = function() {
		//console.log('Schedule update timer.');
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function() {
			fetchWeather();
		}, fetchInterval);
	};

	/* public methods */

	/* startFetch()
	 * Initiate fetchCalendar();
	 */
	this.startFetch = function() {
		fetchWeather();
	};

	/* broadcastItems()
	 * Broadcast the existing events.
	 */
	this.broadcastCurrentWeather = function() {
		if (currentWeather) {
		    currentWeatherReceivedCallback(self);
    }
	};

	/* onReceive(callback)
	 * Sets the on success callback
	 *
	 * argument callback function - The on success callback.
	 */
	this.onReceive = function(callback) {
		currentWeatherReceivedCallback = callback;
	};

	/* onError(callback)
	 * Sets the on error callback
	 *
	 * argument callback function - The on error callback.
	 */
	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};

	this.lat = function() {
		return lat;
	};

  this.lon = function() {
		return lon;
	};

	/* events()
	 * Returns current available events for this fetcher.
	 *
	 * return array - The current available events for this fetcher.
	 */
	this.currentWeather = function() {
		return currentWeather;
	};

};


module.exports = APIFetcher;
