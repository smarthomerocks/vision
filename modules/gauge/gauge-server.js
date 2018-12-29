const ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'GAUGE_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'GAUGE_STATUS') {
      this.dashboard.gauge.getStatus(data.plugin, data.id);
    }
  },

  connectPlugin: function(plugin) {
    let self = this;

    if (this.isConnected) {
      self.sendSocketNotification('GAUGE_CONNECTED');
      return;
    }

    this.dashboard.gauge.once(plugin, 'connect', function() {
      this.isConnected = true;
      self.sendSocketNotification('GAUGE_CONNECTED');
    });

    this.dashboard.gauge.on(plugin, 'change', function(data) {
      self.sendSocketNotification('GAUGE_STATUS', {id: data.id, state: data.state});
    });

    this.dashboard.gauge.start(plugin);
  }
});
