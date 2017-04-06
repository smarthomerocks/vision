var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'TEMP_METER_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'TEMP_METER_STATUS') {
			this.dashboard.tempmeter.getStatus(data.plugin, data.id);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		this.dashboard.tempmeter.on(plugin, 'connect', function(data) {
			self.sendSocketNotification('TEMP_METER_CONNECTED');
		});

		this.dashboard.tempmeter.on(plugin, 'change', function(data) {
			self.sendStatus(data.id, data.value, data.value_extra, data.lowest, data.lowestdate, data.highest, data.highestdate);
		});

		this.dashboard.tempmeter.start(plugin);
	},

	sendStatus: function(id, value, value_extra, lowest, lowestdate, highest, highestdate) {
		this.sendSocketNotification('TEMP_METER_STATUS', { id: id, current:value, today:value_extra, lowest:lowest, lowestdate: lowestdate, highest:highest, highestdate: highestdate  });
	}
});
