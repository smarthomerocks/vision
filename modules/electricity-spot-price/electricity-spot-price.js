Module.register("electricity-spot-price", {

  defaults: {
    title: "El pris",
    plugin: "electricity-spot-price",
    id: 4
  },

  getStyles: function() {
    return ['electricity-spot-price.css'];
  },

  start: function() {
    console.log('Starting electricity-spot-price ' + this.config.title);

    this.graphTemplate = Handlebars.compile(`
      {{#each .}}
        <g class="bar" transform="translate({{x}},100)">
          <rect width="18" height="{{height}}" y="0" transform="scale(1, -1)"></rect>
          <text class="label" x="0" y="{{height}}">{{price}}</text>
        </g>
      {{/each}}
      
    `);

    this.sendSocketNotification('SPOT_PRICE_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  getDom: function() {
    this.$el = $(`
      <div class="box box-4 spot-price">
        <div class="box-content">
          <div class="heading">${this.config.title}</div>
          <svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="graph"></svg>
        </div>
      </div>`);

    this.$el.css({
      'opacity': 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {

    if (command === 'SPOT_PRICE_CONNECTED') {

      if (!this.$el) {
        this.getDom();
      }
      // Connected to plugin, get status
      this.sendSocketNotification('SPOT_PRICE_LIST', {id: this.config.id, plugin: this.config.plugin});

    } else if (command === 'SPOT_PRICE_LIST' /*&& data.id === this.config.id*/) {
      this.currentData = data;

      this.updateDom();
    }
  },

  updateDom: function() {
    if (this.$el) {
      this.$el.find('.graph').html(this.rendergraph(this.currentData));
    }
  },

  rendergraph: function(data) {
    let model = data.hourly.map((entry, index) => {
      return {
        price: +(Math.round(entry.price + "e+2") + "e-2"), // round to two digits.
        time: entry.date,
        height: entry.price * 100,
        x: index * 20
      };
    });

    return this.graphTemplate(model);
  }


});
