const ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'LIAM_CONNECT') {
      this.connectPlugin(data.plugin);
    }
  },

  connectPlugin: function(plugin) {
    let self = this;

    if (this.isConnected) {
      self.sendSocketNotification('LIAM_CONNECTED');
      return;
    }

    this.dashboard.liam.once(plugin, 'connect', function(data) {
      this.isConnected = true;
      self.sendSocketNotification('LIAM_CONNECTED');
    });

    /*
    this.dashboard.liam.on(plugin, 'change', function(data) {
      self.sendSocketNotification('SWITCH_STATUS', {id: data.id, state: data.state});
    });*/

    this.dashboard.liam.start(plugin);
  }
});
