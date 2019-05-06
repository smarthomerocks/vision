const https = require('https'),
      url = require('url'),
      logger = require('../../logger').logger;

var APIFetcher = function(lat, lon, fetchInterval) {
  var self = this;

  var reloadTimer = null;
  var currentWeather = [];

  var fetchFailedCallback = function() {};
  var currentWeatherReceivedCallback = function() {};

  /* fetchCalendar()
	 * Initiates calendar fetch.
	 */
  var fetchWeather = function() {

    clearTimeout(reloadTimer);
    reloadTimer = null;

    let requestUrl = url.parse('https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/' + lon + '/lat/' + lat + '/data.json');
    
    https.request(requestUrl, response => {
      var res = '';

      response.on('data', function(chunk) {
        res += chunk;
      });

      response.on('end', function() {
        
        currentWeather = [];

        try {
          let now = new Date(),
              timeSeries = JSON.parse(res),
              datebuckets = new Map(timeSeries.timeSeries.map(t => {
                /* returns
                {
                  "2019-02-20": [],
                  "2019-02-21": [],
                  "2019-02-22": [],
                  ...
                }
                */
                return [
                  t.validTime.split('T')[0],
                  []
                ];
              })),
              currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()); // "2019-02-24T21:00:00Z" 
          /* returns
          [
            "2019-02-24": [
              {
                date:"1551027600000"
                icon:3
                temp:5.3
                windspeed:6.8
              },
              ...
            ],
            ...
          ]
          */
          for (let key of datebuckets.keys()) {
            datebuckets.set(key, timeSeries.timeSeries.filter(t => t.validTime.startsWith(key)).map(t => {
              let icon = t.parameters.find(i => i.name === 'Wsymb2');
              let temp = t.parameters.find(i => i.name === 't');
              let windspeed = t.parameters.find(i => i.name === 'ws');

              return {
                dateTime: t.validTime.replace('Z', ''), // strip UTC-marker since the response is really in localtime.
                icon: icon ? icon.values[0] : '', // https://opendata.smhi.se/apidocs/metfcst/parameters.html#parameter-wsymb
                temp: temp ? temp.values[0] : '',
                windspeed: windspeed ? windspeed.values[0] : ''
              };
            }));
          }

          // first position in array is the weather the current hour of this day.
          //let bucketIterator = datebuckets.values();
          //currentWeather.push(bucketIterator.next().value.find(t => new Date(t.dateTime).getTime() === currentHour.getTime())); //TODO: we are 1 hour off, no match!

          for (let hourEntries of datebuckets.values()) {
            if (hourEntries.length > 0) {
              currentWeather.push(hourEntries[Math.floor(hourEntries.length / 2)]);
            }
          }

          self.broadcastCurrentWeather();
        } catch (error) {
          logger.error(`Failed to parse SMHI response, url: "${requestUrl.format()}", "${error.stack}".`);
          fetchFailedCallback(self, error);
        }

        scheduleTimer();
      });
    }).on('error', function(e) {
      fetchFailedCallback(self, e);
      scheduleTimer();
    }).end();
  };

  /* scheduleTimer()
	 * Schedule the timer for the next update.
	 */
  var scheduleTimer = function() {
    //logger.debug('Schedule update timer.');
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(function() {
      fetchWeather();
    }, fetchInterval || 300000);
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
