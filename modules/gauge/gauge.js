/*global Module winston, jsel, LinearGauge, RadialGauge*/
Module.register('gauge', {

  defaults: {
    title: '',
    plugin: 'MQTT',
    id: '1',
    type: 'text',
    gaugeConfig: {},
    size_x: 1,
    size_y: 1
  },

  getStyles: function() {
    return ['gauge.css'];
  },

  start: function() {
    winston.info('Starting gauge ' + this.config.title);

    this.sendSocketNotification('GAUGE_CONNECT', { id: this.config.id, plugin: this.config.plugin });
  },

  getDom: function() {
    let gaugeDom = '';

    if (this.config.type === 'text') {
      gaugeDom = `<div class="text js-gauge-${this.config.id}">...</div>`;
    } else if (this.config.type === 'lcd') {
      gaugeDom = `<div class="text textLCD js-gauge-${this.config.id}">...</div>`;
    } else if (this.config.type === 'linear-gauge' || this.config.type === 'radial-gauge') {
      gaugeDom = `<canvas class="js-gauge-${this.config.id}"></canvas>`;
    } else {
      gaugeDom = '<p>Unsupported gauge-type</p>';
    }

    this.$el = $(
      `<div class="box gauge">
        <div class="box-content">
          <div class="js-heading heading">${this.config.title}</div>
          ${gaugeDom}
        </div>
      </div>`
    );

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'GAUGE_CONNECTED') {
      // Connected to plugin, get status
      this.sendSocketNotification('GAUGE_STATUS', { id: this.config.id, plugin: this.config.plugin });
      this.value = 0;

    } else if (command === 'GAUGE_STATUS' && data.id === this.config.id) {
      
      if (this.config.stateParseExpression && this.config.stateParseExpression.length > 0) {
        this.value = jsel(JSON.parse(data.state)).select(this.config.stateParseExpression);
      } else {
        this.value = data.state;
      }

      this.$el.css({
        'opacity' : 1
      });

      this.updateDom();
    }
  },

  shown: function() {
    if (!this.gauge && (this.config.type === 'linear-gauge' || this.config.type === 'radial-gauge')) {
      // create gauge if first time shown

      // we let canvas gauge show title instead
      this.$el.find('.js-heading').hide();
      // override some config we want to set in code (these should never be used in the config-file anyway)
      let boxContentEl = this.$el.find('.box-content');
      let config = this.config.gaugeConfig;
      config.renderTo = this.$el.find(`.js-gauge-${this.config.id}`)[0];
      config.title = this.config.title;
      config.value = Number(this.value);
      config.height = boxContentEl.height();
      config.width = boxContentEl.width();
      this.gauge = this.config.type === 'linear-gauge' ? new LinearGauge(config): new RadialGauge(config);
      this.gauge.draw();
    }
  },

  updateDom: function() {
    if (this.$el) {
      if (this.config.type === 'text' || this.config.type === 'lcd') {
        this.$el.find(`.js-gauge-${this.config.id}`).html(this.value);
      } else if (this.config.type === 'linear-gauge' || this.config.type === 'radial-gauge') {
        if (this.gauge) {
          this.gauge.value = Number(this.value);
          this.gauge.draw(); // this should not be needed according to documentation, yet it fails to update value from time to time if not specified.
        }
      }
    }
  }
});
