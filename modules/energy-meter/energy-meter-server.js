var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'ENERGY_METER_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'ENERGY_METER_STATUS') {
			this.dashboard.energymeter.getStatus(data.plugin, data.id);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		if (this.isConnected) {
			self.sendSocketNotification('ENERGY_METER_CONNECTED');
			return;
		}

		this.isConnected = true;

		this.dashboard.energymeter.once(plugin, 'connect', function(data) {
			self.sendSocketNotification('ENERGY_METER_CONNECTED');
		});

		this.dashboard.energymeter.on(plugin, 'change', function(data) {
			self.sendStatus(data.id, data.value, data.value_extra, data.lowest, data.lowestdate, data.highest, data.highestdate, data.today);
		});

		this.dashboard.energymeter.start(plugin);
	},

	sendStatus: function(id, value, value_extra, lowest, lowestdate, highest, highestdate, today) {
		this.sendSocketNotification('ENERGY_METER_STATUS', { id: id, current:value, today:today, lowest:lowest, lowestdate: lowestdate, highest:highest, highestdate: highestdate });
	}
});
