var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
	socketNotificationReceived: function(command, data) {
		if (command === 'SECURITYALARM_CONNECT') {
			this.connectPlugin(data.plugin);
		} else if (command === 'SECURITYALARM_STATUS') {
			this.dashboard.security_alarm.getStatus(data.plugin, data.alias);
		}
	},

	connectPlugin: function(plugin) {
		let self = this;
			

		if(this.isConnected) {
			self.sendSocketNotification('SECURITYALARM_CONNECTED');	
			return;
		}

		this.isConnected = true;

		this.dashboard.doorlock.once(plugin, 'connect', function(data) {
				self.sendSocketNotification('SECURITYALARM_CONNECTED');	
		});

		this.dashboard.doorlock.on(plugin, 'security_alarm_change', function(data) {
			self.sendStatus(data.alias, data.lockstate, data.alarm_state, data.armdate);
		});
    this.dashboard.security_alarm.start(plugin);
	},

	sendStatus: function(alias, lockstate, alarm_state, armdate) {
		this.sendSocketNotification('SECURITYALARM_STATUS', { alias:alias, alarm_state:alarm_state, armdate:armdate });
	}
});
