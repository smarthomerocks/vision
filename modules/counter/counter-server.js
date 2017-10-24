var ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'COUNTER_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'COUNTER_STATUS') {
      this.dashboard.counter.getStatus(data.plugin, data.id);
    }
  },

  connectPlugin: function(plugin) {
    var self = this;

    if (this.isConnected) {
      self.sendSocketNotification('COUNTER_CONNECTED');
      return;
    }

    this.isConnected = true;

    this.dashboard.tempmeter.once(plugin, 'connect', function(data) {
      self.sendSocketNotification('COUNTER_CONNECTED');
    });

    this.dashboard.tempmeter.on(plugin, 'change', function(data) {
      self.sendStatus(data.id, data.value, data.value_extra, data.lowest, data.lowestdate, data.highest, data.highestdate, data.unit);
    });

    this.dashboard.tempmeter.start(plugin);
  },

  sendStatus: function(id, value, value_extra, lowest, lowestdate, highest, highestdate, unit) {
    this.sendSocketNotification('COUNTER_STATUS', { id: id, current:value, today:value_extra, lowest:lowest, lowestdate: lowestdate, highest:highest, highestdate: highestdate, unit: unit });
  }
});
