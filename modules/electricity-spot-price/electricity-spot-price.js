/*global Module*/
Module.register('electricity-spot-price', {

  defaults: {
    title: 'Elpris',
    plugin: 'electricity-spot-price',
    id: 4,
    SCALE: 100, // scale of bars in graphs.
    NUMBER_OF_BARS: 23 // to fit in on the x-axis, an uneven number would be nice.
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
            <rect width="13" height="{{height}}" y="0" transform="scale(1, -1)"></rect>
            {{#if renderPrice}}
              <text class="label" x="0" y="14">{{price}}</text>
            {{/if}}
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

    let now = moment(),
        pricelist = data.hourly,
        currentPriceIndex = pricelist.findIndex(o => moment(o.date).isSameOrAfter(now, 'hour')),
        currentBarTime = pricelist[currentPriceIndex].date,
        barsAtSide = Math.ceil(this.config.NUMBER_OF_BARS / 2);

    // limit the number of bars in the graph, optimally the current time should be in the center of the graph all the time with equally numbers of bars at both sides.
    if (currentPriceIndex < barsAtSide) {
      // to few values for placing us in the center of the graph, we will settle with being in the left hand of the graph.
      pricelist = pricelist.slice(0, this.config.NUMBER_OF_BARS);
    } else if (currentPriceIndex > (pricelist.length - barsAtSide)) {
      // to few values left for placing us in the center of the graph, we will settle with being in the right hand of the graph.
      pricelist = pricelist.slice(pricelist.length - this.config.NUMBER_OF_BARS);
    } else {
      // perfect, there are more values to the left and right of us than we need, pick the closest (NUMBER_OF_BARS / 2) of each side of us.
      pricelist = pricelist.slice(currentPriceIndex - barsAtSide, currentPriceIndex + barsAtSide);
    }

    let hourPrices = pricelist.map(o => o.price);
    let maxHourPrice = Math.max(...hourPrices);
    let minHourPrice = Math.min(...hourPrices);

    let getStyle = (entry, index) => {
      let style = [];

      if (entry.price === maxHourPrice) {
        style.push('highprice');
      } else if (entry.price === minHourPrice) {
        style.push('lowprice');
      }

      if (entry.date === currentBarTime) {
        style.push('currentTime');
      }

      return style.join(' ');
    };

    let model = {
      maxHourPrice: maxHourPrice,
      minHourPrice: minHourPrice,
      hourPrices: pricelist.map((entry, index) => {
        return {
          price: +(Math.round(entry.price + 'e+3') + 'e-3'), // round to three digits.
          time: entry.date,
          height: (entry.price - minHourPrice) / (maxHourPrice - minHourPrice) * this.config.SCALE + 1, // +1 for preventing minHourPrice from being invisible.
          x: index * 15,
          optionalStyle: getStyle(entry, index),
          renderPrice: entry.price === maxHourPrice || entry.price === minHourPrice
        };
      })
    };

    return this.graphTemplate(model);
  }


});
