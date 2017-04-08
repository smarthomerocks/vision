var util = require('util'),
    path = require('path'),
    Basemodule = require(path.join(__dirname, '..', 'basemodule'));

function Electricity_spot_price(Dashboard, app, io) {
  Basemodule.call(this, Dashboard, app, io, 'electricity-spot-price');

  this.onSocketUpdate = function(command, data, socket) {
    if (command === 'SPOT_PRICE_CONNECT') {
      connectPlugin(data.plugin, socket);
    } else if (command === 'SPOT_PRICE_LIST') {
      Dashboard.electricity_spot_price.getPriceList(data.plugin, data.id);
    }
  };

  function connectPlugin(plugin, socket) {
    Dashboard.electricity_spot_price.on(plugin, 'connect', function(data) {
      socket.emit('SPOT_PRICE_CONNECTED');
    });

    Dashboard.electricity_spot_price.on(plugin, 'change', function(pricelist) {
      socket.emit('SPOT_PRICE_LIST', pricelist);
    });

    Dashboard.electricity_spot_price.start(plugin);
  }

  this.connectSocket();

  console.log(`Module "${this.moduleName.yellow.bold}" started.`);

  return {
    exit: this.exit
  };
}

util.inherits(Electricity_spot_price, Basemodule);

module.exports = {
  create: function(Dashboard, app, io) {
    return new Electricity_spot_price(Dashboard, app, io);
  }
};
