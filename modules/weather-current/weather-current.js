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

    this.$el = $(`
    <div class="box wheater-current">
      <div class="box-content">
        <div class="heading">${this.config.title}</div>  
        <div class="weather-forcasts">
          <div class="weather-forcast">
            <div class="wi wi-day-sunny hidden"></div>
            <div class="temp hidden">10&deg;C</div>
            <div class="windspeed hidden">0&nbsp;m/s</div>
          </div>
        </div>
      </div>
    </div>
    `);

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'WEATHER_CURRENT_CONNECTED') {
      this.$el.css({
        'opacity' : 1
      });

      this.sendSocketNotification('WEATHER_CURRENT_STATUS', { plugin: this.config.plugin, lat: this.config.lat, lon: this.config.lon });

    } else if (command === 'WEATHER_CURRENT_STATUS' && this.config.lat === data.lat && this.config.lon === data.lon) {
      let currentWeather = data.currentWeather,
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
          },
          forecastDOM = '';

      currentWeather.length = currentWeather.length >= this.config.size_x ? this.config.size_x : currentWeather.length; // show as many weather forecast as the width of the module (if there are more forecasts available).

      for (let weather of currentWeather) {
        forecastDOM += `
        <div class="weather-forcast">
          <div class="wi ${weatherIconMap[weather.icon]}"></div>
          <div class="temp">${Math.round(weather.temp, 10)}&deg;C</div>
          <div class="windspeed">${Math.round(weather.windspeed, 10)}&nbsp;m/s</div>
        </div>
        `;
      } 

      this.$el.find('.weather-forcasts').html(forecastDOM);
    }
  }
});
