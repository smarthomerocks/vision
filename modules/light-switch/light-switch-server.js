var ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'LIGHT_SWITCH_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'LIGHT_SWITCH_TOGGLE') {
      this.dashboard.lights.toggle(data.plugin, data.id, data.stateOn);
    } else if (command === 'LIGHT_SWITCH_STATUS') {
      this.dashboard.lights.getStatus(data.plugin, data.id);
    }
  },

  connectPlugin: function(plugin) {
    var self = this;

    if (this.isConnected) {
      self.sendSocketNotification('LIGHT_SWITCH_CONNECTED');
      return;
    }

    this.isConnected = true;

    this.dashboard.lights.once(plugin, 'connect', function(data) {
      self.sendSocketNotification('LIGHT_SWITCH_CONNECTED');
    });

    this.dashboard.lights.on(plugin, 'change', function(data) {
      self.sendStatus(data.id, data.isStateOn);
    });

    this.dashboard.lights.start(plugin);
  },

  sendStatus: function(id, isStateOn) {
    this.sendSocketNotification('LIGHT_SWITCH_STATUS', { id: id, isStateOn: isStateOn });
  }
});
