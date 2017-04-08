var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'APPLE_TV_REMOTE_CONNECT') {
			console.log('APPLE_TV_REMOTE_CONNECT');
			this.connectPlugin(data.plugin);
		} else if (command === 'APPLE_TV_REMOTE_SEND_COMMAND') {
			console.log('APPLE_TV_REMOTE_SEND_COMMAND');
			this.dashboard.remotecontrol.sendCommand(data.plugin, data.commands);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		this.dashboard.remotecontrol.on(plugin, 'connect', function(data) {
			self.sendSocketNotification('APPLE_TV_REMOTE_CONNECT');
		});

		this.dashboard.remotecontrol.start(plugin);
	}
});
