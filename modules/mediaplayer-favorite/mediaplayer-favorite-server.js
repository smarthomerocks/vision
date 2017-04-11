var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'MEDIAPLAYER_FAVORITE_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'MEDIAPLAYER_FAVORITE_PLAY') {
			this.dashboard.mediaplayer.favorite(data.plugin, data.device, data.favoriteName);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		if (this.isConnected) {
			self.sendSocketNotification('MEDIAPLAYER_FAVORITE_CONNECTED');
			return;
		}

		this.isConnected = true;

		this.dashboard.mediaplayer.once(plugin, 'connect', function(data) {
			self.sendSocketNotification('MEDIAPLAYER_FAVORITE_CONNECTED');
		});

		this.dashboard.mediaplayer.start(plugin);
	}
});
