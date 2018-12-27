const ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'DIMMER_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'DIMMER_LEVEL') {
      this.dashboard.dimmer.setLevel(data.plugin, data.id, data.level);
    } else if (command === 'DIMMER_STATUS') {
      this.dashboard.dimmer.getStatus(data.plugin, data.id);
    }
  },

  connectPlugin: function(plugin) {
    let self = this;

    if (this.isConnected) {
      self.sendSocketNotification('DIMMER_CONNECTED');
      return;
    }

    this.dashboard.dimmer.once(plugin, 'connect', function(data) {
      this.isConnected = true;
      self.sendSocketNotification('DIMMER_CONNECTED');
    });

    this.dashboard.dimmer.on(plugin, 'change', function(data) {
      self.sendSocketNotification('DIMMER_STATUS', {id: data.id, state: data.state});
    });

    this.dashboard.dimmer.start(plugin);
  }
});
