var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'DOORLOCK_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'DOORLOCK_STATUS') {
			this.dashboard.doorlock.getStatus(data.plugin, data.alias, data.area);
		}
	},

	connectPlugin: function(plugin) {
		let self = this;
			

		if(this.isConnected) {
			self.sendSocketNotification('DOORLOCK_CONNECTED');	
			return;
		}

		this.isConnected = true;

		this.dashboard.doorlock.once(plugin, 'connect', function(data) {
				self.sendSocketNotification('DOORLOCK_CONNECTED');	
		});

		this.dashboard.doorlock.on(plugin, 'doorlock_change', function(data) {
			self.sendStatus(data.area, data.alias, data.lockstate, data.lockdate, data.method, data.user);
		});

    this.dashboard.doorlock.start(plugin);
	},

	sendStatus: function(area, alias, lockstate, lockdate, method, user) {
		this.sendSocketNotification('DOORLOCK_STATUS', { area:area, alias:alias, lockstate:lockstate, lockdate:lockdate ,method:method, user:user });
	}
});
