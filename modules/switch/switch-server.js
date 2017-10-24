var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'SWITCH_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'SWITCH_TOGGLE') {
			this.dashboard.switch.toggle(data.plugin, data.id, data.stateOn);
		} else if (command === 'SWITCH_STATUS') {
			this.dashboard.switch.getStatus(data.plugin, data.id);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		if (this.isConnected) {
			self.sendSocketNotification('SWITCH_CONNECTED');
			return;
		}

		this.isConnected = true;

		this.dashboard.switch.once(plugin, 'connect', function(data) {
			self.sendSocketNotification('SWITCH_CONNECTED');
		});

		this.dashboard.switch.on(plugin, 'change', function(data) {
			self.sendStatus(data.id, data.isStateOn);
		});

		this.dashboard.switch.start(plugin);
	},

	sendStatus: function(id, isStateOn) {
		this.sendSocketNotification('SWITCH_STATUS', {id: id, isStateOn: isStateOn});
	}
});
