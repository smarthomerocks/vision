Module.register("electricity-spot-price", {

  defaults: {
    title: "El pris",
    plugin: "electricity-spot-price",
    id: 4,
    SCALE: 100
  },

  getStyles: function() {
    return ['electricity-spot-price.css'];
  },

  start: function() {
    console.log('Starting electricity-spot-price ' + this.config.title);

    this.graphTemplate = Handlebars.compile(`
      <svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="graph">
        {{#each hourPrices}}
          <g class="bar {{optionalStyle}}" transform="translate({{x}}, 100)">
            <rect width="8" height="{{height}}" y="0" transform="scale(1, -1)"></rect>
            <!--<text class="label" x="0" y="{{height}}">{{price}}</text>-->
          </g>
        {{/each}}
      </svg>
    `);

    this.sendSocketNotification('SPOT_PRICE_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  getDom: function() {
    this.$el = $(`
      <div class="box spot-price">
        <div class="box-content">
          <div class="heading">${this.config.title}</div>
          <div class="content"></div>
        </div>
      </div>`);

    this.$el.css({
      'opacity': 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {

    if (command === 'SPOT_PRICE_CONNECTED') {

      this.$el.css({
        'opacity': 1
      });

      // Connected to plugin, get status
      this.sendSocketNotification('SPOT_PRICE_LIST', {id: this.config.id, plugin: this.config.plugin});

    } else if (command === 'SPOT_PRICE_LIST' /*&& data.id === this.config.id*/) {
      this.currentData = data;

      this.updateDom();
    }
  },

  updateDom: function() {
    if (this.$el) {
      this.$el.find('.content').html(this.rendergraph(this.currentData));
    }
  },

  rendergraph: function(data) {
    let hourPrices = data.hourly.map(o => o.price);
    let maxHourPrice = Math.max(...hourPrices);
    let minHourPrice = Math.min(...hourPrices);

    let model = {
      maxHourPrice: maxHourPrice,
      minHourPrice: minHourPrice,
      hourPrices: data.hourly.map((entry, index) => {
        return {
          price: +(Math.round(entry.price + "e+3") + "e-3"), // round to two digits.
          time: entry.date,
          height: (entry.price - minHourPrice) / (maxHourPrice - minHourPrice) * this.config.SCALE,
          x: index * 10,
          optionalStyle: entry.price === maxHourPrice ? 'highprice' : (entry.price === minHourPrice) ? 'lowprice' : ''
        };
      })
    };

    return this.graphTemplate(model);
  }


});
