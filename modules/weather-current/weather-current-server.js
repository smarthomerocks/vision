var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'WEATHER_CURRENT_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'WEATHER_CURRENT_STATUS') {
			this.dashboard.weather.getCurrent(data.plugin, data.lat, data.lon);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		this.dashboard.weather.on(plugin, 'connect', function(data) {
			self.sendSocketNotification('WEATHER_CURRENT_CONNECTED');
		});

		this.dashboard.weather.on(plugin, 'change', function(data) {
			self.sendSocketNotification('WEATHER_CURRENT_STATUS', { lat: data.lat, lon: data.lon, currentWeather: data.currentWeather });
		});

		this.dashboard.weather.start(plugin);
	}
});
