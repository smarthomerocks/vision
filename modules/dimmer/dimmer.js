/*global Module, winston*/
Module.register('dimmer', {

  defaults: {
    title: 'Lamp',
    plugin: 'mqtt',
    id: 1,
    readonly: false,
    type: 'slider',
    maxLevel: 100,
    minLevel: 0,
    size_x: 1,
    size_y: 2
  },
  self: undefined,

  getStyles: function() {
    return ['dimmer.css'];
  },

  start: function() {
    winston.info('Starting dimmer ' + this.config.title);

    this.isStateOn = false;
    this.self = this;

    this.sendSocketNotification('DIMMER_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  getDom: function() {
    var self = this;

    if (this.config.type === 'slider') {
      this.$el = $('<div class="box' +
        ' dimmer"><div class="box-content"><div class="heading">' + this.config.title + '</div><div class="slider-wrapper"><input class="js-dimmer-knob" type="range" min="' + this.config.minLevel + '" max="' + this.config.maxLevel + '"/></div></div></div>');
    } else {
      this.$el = $('<div class="box' + (this.config.readonly ? '' : ' box-clickable') + ' dimmer"><div class="box-content"><div class="heading">' + this.config.title + '</div><p>TBD</p></div></div>');
    }

    if(!this.config.readonly) {
      this.$el.find('.js-dimmer-knob').on('change', function() {
        self.level = $(this).val();
        self.sendSocketNotification('DIMMER_LEVEL', {id: self.config.id, plugin: self.config.plugin, level: self.level});
      });
    }

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'DIMMER_CONNECTED') {
      // Connected to plugin, get status
      this.sendSocketNotification('DIMMER_STATUS', {id: this.config.id, plugin: this.config.plugin});
    } else if (command === 'DIMMER_STATUS' && data.id === this.config.id) {
      this.level = data.level;

      this.$el.css({
        'opacity' : 1
      });

      this.updateDom();
    }
  },

  updateDom: function() {
    this.$el.find('.js-dimmer-knob').val(this.level);
  }
});
