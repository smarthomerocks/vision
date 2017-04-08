var EventEmitter = require('events').EventEmitter;
var util = require('util');
var electricity = require('nordpool');


function Electricity_spot_price(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this;
  self.intervalUpdate = null;
  self.prices = new electricity.Prices();

  self.start = function() {

    self.emit('connect');
    self.intervalUpdate = setInterval(self.getPriceList, 60 * 60 * 1000);  // get pricelist every hour.

  };

  self.exit = function() {

    if (self.intervalUpdate) {
      clearInterval(self.intervalUpdate);
    }

  };

  self.getPriceList = function(id) {

    console.log("Electricity_spot_price: getting price list.");

    self.prices.hourly({
      currency: config.currency,
      area: config.area
    },
        function(error, results) {
          if (error) {
            console.err('Electricity_spot_price: get price list error: ' + error.message);
            return;
          }

          let pricelist = results.map(entry => {
            return {
              date: entry.date,
              price: entry.value / 1000 // Mega Watt to Kilo Watt divider.
            };
          });

          self.emit('change', {hourly: pricelist});
        });

  };
}

util.inherits(Electricity_spot_price, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Electricity_spot_price(Dashboard, app, io, config);
  }
};
