const ModuleServer = require('../../lib/module-server.js');

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
    let self = this;

    if (this.isConnected) {
      self.sendSocketNotification('SWITCH_CONNECTED');
      return;
    }

    this.dashboard.switch.once(plugin, 'connect', function(data) {
      this.isConnected = true;
      self.sendSocketNotification('SWITCH_CONNECTED');
    });

    this.dashboard.switch.on(plugin, 'change', function(data) {
      self.sendSocketNotification('SWITCH_STATUS', {id: data.id, state: data.state});
    });

    this.dashboard.switch.start(plugin);
  }
});
