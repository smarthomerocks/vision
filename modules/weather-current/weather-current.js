/*global Module winston*/
Module.register('weather-current', {

  defaults: {
    title: 'Visby',
    plugin: 'smhi',
    lat: '57.634800',
    lon: '18.294840'
  },

  getStyles: function() {
    return ['weather-current.css'];
  },

  start: function() {
    winston.info('Starting weather-current ' + this.config.title);

    this.isStateOn = false;

    this.sendSocketNotification('WEATHER_CURRENT_CONNECT', { plugin: this.config.plugin });
  },

  getDom: function() {

    this.$el = $('<div class="box wheater-current"><div class="box-content"><div class="heading">'+ this.config.title +'</div><div class="weather-current-content"><span class="temp hidden"></span><br /><i class="wi wi-day-sunny hidden"></i></div></div></div>');

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    // function getTime(dateTime) {
    //   var date = new Date(dateTime),
    //       hours = String(date.getHours()),
    //       minutes = String(date.getMinutes());
    //
    //   return (hours.length < 2 ? '0' : '') + hours + ':' + (minutes.length < 2 ? '0' : '') + minutes;
    // }

    if (command === 'WEATHER_CURRENT_CONNECTED') {
      this.$el.css({
        'opacity' : 1
      });

      this.sendSocketNotification('WEATHER_CURRENT_STATUS', { plugin: this.config.plugin, lat: this.config.lat, lon: this.config.lon });

    } else if (command === 'WEATHER_CURRENT_STATUS' && this.config.lat === data.lat && this.config.lon === data.lon) {
      var currentWeather = data.currentWeather,
          weatherIconMap = {
            '1': 'wi-day-sunny',
            '2': 'wi-day-sunny-overcast',
            '3': 'wi-day-cloudy',
            '4': 'wi-day-cloudy',
            '5': 'wi-cloudy',
            '6': 'wi-cloud',
            '7': 'wi-fog',
            '8': 'wi-showers',
            '9': 'wi-thunderstorm',
            '10': 'wi-sleet',
            '11': 'wi-rain-mix',
            '12': 'wi-rain',
            '13': 'wi-lightning',
            '14': 'wi-sleet',
            '15': 'wi-snow'
          };

      this.$el.find('.weather-current-content').html('<i class="wi ' + weatherIconMap[currentWeather.icon] + '"></i><br /><span class="temp"> ' + Math.round(currentWeather.temp, 10) + ' &deg;C</span>');
    }
  }
});
