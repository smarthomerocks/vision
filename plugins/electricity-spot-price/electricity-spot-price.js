const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      electricity = require('nordpool'),
      moment = require('moment');

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

  function getPricePerDay(day) {
    return new Promise((resolve, reject) => {
      self.prices.hourly({
        startDate: day,
        endDate: day,
        currency: config.currency,
        area: config.area
      },
          function(error, results) {
            error ? reject(error) : resolve(results);
          });
    });
  }

  self.getPriceList = function(id) {

    console.log('Electricity_spot_price: getting price list.');

    let requests = [
      getPricePerDay(moment().subtract(1, 'days')),
      getPricePerDay(moment()),
      getPricePerDay(moment().add(1, 'days'))
    ];

    Promise.all(requests)
        .then(results => {
          let pricelist = [].concat.apply([], results).map(entry => {
            return {
              date: entry.date.toISOString(),
              price: entry.value / 1000 // Mega Watt to Kilo Watt divider.
            };
          });

          self.emit('change', {hourly: pricelist});
        })
        .catch(error => {
          console.err('Electricity_spot_price: get price list error: ' + error.message);
        });
  };
}

util.inherits(Electricity_spot_price, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Electricity_spot_price(Dashboard, app, io, config);
  }
};
