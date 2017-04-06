var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'CALENDAR_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'CALENDAR_EVENTS') {
			this.dashboard.calendar.getEvents(data.plugin, data.url, data.fetchInterval, data.maximumEntries, data.maximumNumberOfDays, data.user, data.pass);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		this.dashboard.calendar.on(plugin, 'connect', function(data) {
			self.sendSocketNotification('CALENDAR_CONNECTED');
		});

		this.dashboard.calendar.on(plugin, 'change', function(data) {
			self.sendSocketNotification('CALENDAR_EVENTS', { url: data.url, events: data.events });
		});

		this.dashboard.calendar.start(plugin);
	}
});
