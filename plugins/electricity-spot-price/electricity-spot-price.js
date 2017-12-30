const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      nordpool = require('nordpool'),
      moment = require('moment'),
      logger = require('../../logger').logger;

function Electricity_spot_price(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this;
  self.intervalUpdate = null;
  self.prices = new nordpool.Prices();

  self.start = function() {

    if(self.connected) {
      self.emit('connect');
      return;
    }

    self.intervalUpdate = setInterval(self.getPriceList, 60 * 60 * 1000);  // get pricelist every hour.
    self.connected = true;
    self.emit('connect');
  };

  self.exit = function() {

    if (self.intervalUpdate) {
      clearInterval(self.intervalUpdate);
    }

  };

  function getPricePerDay(day) {
    return new Promise((resolve, reject) => {
      self.prices.hourly({
        date: day,
        currency: config.currency,
        area: config.area
      },
          function(error, results) {
            error ? reject(error) : resolve(results);
          });
    });
  }

  self.getPriceList = function(id) {

    logger.debug('Electricity_spot_price: getting price list.');

    let requests = [
      getPricePerDay(moment().subtract(1, 'days')), // to handle day rollover
      getPricePerDay(moment()),
      getPricePerDay(moment().add(1, 'days')) // to handle day rollover
    ];

    Promise.all(requests)
        .then(results => {
          let pricelist = [].concat.apply([], results).map(entry => {
            return {
              date: entry.date.tz(config.timezone || 'Europe/Stockholm').toISOString(),
              price: entry.value / 1000 // Mega Watt to Kilo Watt divider.
            };
          });

          self.emit('change', {hourly: pricelist});
        })
        .catch(error => {
          logger.error('Electricity_spot_price: get price list error: ' + error.message);
        });
  };
}

util.inherits(Electricity_spot_price, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Electricity_spot_price(Dashboard, app, io, config);
  }
};
