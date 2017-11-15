var ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'DIMMER_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'DIMMER_LEVEL') {
      this.dashboard.switch.switch(data.plugin, data.id, data.level);
    } else if (command === 'DIMMER_STATUS') {
      this.dashboard.switch.getStatus(data.plugin, data.id);
    }
  },

  connectPlugin: function(plugin) {
    var self = this;

    if (this.isConnected) {
      self.sendSocketNotification('DIMMER_CONNECTED');
      return;
    }

    this.dashboard.switch.once(plugin, 'connect', function(data) {
      this.isConnected = true;
      self.sendSocketNotification('DIMMER_CONNECTED');
    });

    this.dashboard.switch.on(plugin, 'change', function(data) {
      self.sendStatus(data.id, data.level);
    });

    this.dashboard.switch.start(plugin);
  },

  sendStatus: function(id, level) {
    this.sendSocketNotification('DIMMER_STATUS', {id: id, level: level});
  }
});
