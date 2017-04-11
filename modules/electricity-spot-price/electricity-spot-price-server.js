var ModuleServer = require("../../lib/module-server.js");

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'SPOT_PRICE_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'SPOT_PRICE_LIST') {
      this.dashboard.electricity_spot_price.getPriceList(data.plugin, data.plugin.id);
    }
  },

  connectPlugin: function(plugin) {
    var self = this;

    if (this.isConnected) {
      self.sendSocketNotification('SPOT_PRICE_CONNECTED');
      return;
    }

    this.isConnected = true;

    this.dashboard.electricity_spot_price.once(plugin, 'connect', function(data) {
      self.sendSocketNotification('SPOT_PRICE_CONNECTED');
    });

    this.dashboard.electricity_spot_price.on(plugin, 'change', function(pricelist) {
      self.sendSocketNotification('SPOT_PRICE_LIST', pricelist);
    });

    this.dashboard.electricity_spot_price.start(plugin);
  }
});