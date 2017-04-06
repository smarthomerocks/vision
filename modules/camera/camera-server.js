var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'CAMERA_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'CAMERA_STATUS') {
			this.dashboard.camera.getStatus(data.plugin, data.id);
		} else if (command === 'CAMERA_SNAPSHOT'){
			this.dashboard.camera.getSnapshot(data.plugin, data.id);
		} else if (command === 'CAMERA_LIVEVIDEO'){
			this.dashboard.camera.getLiveliew(data.plugin, data.id);
		}
	},

	connectPlugin: function(plugin) {
		var self = this;

		this.dashboard.camera.on(plugin, 'connect', function(data) {
			self.sendSocketNotification('CAMERA_CONNECTED');
		});

		this.dashboard.camera.on(plugin, 'change', function(data) {
			self.sendStatus(data.id, data.thumbnail, data.videothumbnail, data.lastUpdate, data.liveview, data.clip, data.state);
		});

		this.dashboard.camera.start(plugin);
	},

	sendStatus: function(id, thumbnail, videothumbnail, lastUpdate, liveview, clip, state) {
		this.sendSocketNotification('CAMERA_STATUS', { id: id,clip: clip ,thumbnail: thumbnail, videothumbnail:videothumbnail, lastUpdate: lastUpdate, liveview: liveview, state:state});
	}
});
