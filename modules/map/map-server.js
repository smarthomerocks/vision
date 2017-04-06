var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'MAP_CONNECT') {
			this.connectPlugin(data.plugin);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		this.dashboard.location.on(plugin, 'connect', function(data) {
			self.sendSocketNotification('MAP_CONNECTED');
		});

		this.dashboard.location.on(plugin, 'change', function(data) {
			self.sendSocketNotification('MAP_STATUS', data);
		});

		this.dashboard.location.start(plugin);
	}
});
