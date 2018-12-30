/*global Module winston, jsel*/
Module.register('switch', {

  defaults: {
    title: 'Lamp',
    plugin: 'domoticz',
    id: '1',
    readonly: false,
    type: 'button',
    icon_on: 'lightbulb',
    icon_off: 'lightbulb_outline',
    onCmd: 'ON',
    offCmd: 'OFF',
    size_x: 1,
    size_y: 1
  },

  getStyles: function() {
    return ['switch.css'];
  },

  start: function() {
    winston.info('Starting switch ' + this.config.title);

    this.isStateOn = false;

    this.sendSocketNotification('SWITCH_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  getDom: function() {

    this.$el = $('<div class="box' + (this.config.readonly ? '' : ' box-clickable') + ' switch"><div class="box-content"><div class="heading">' + this.config.title + '</div><i class="js-switch-icon material-icons md-64">' + (this.isStateOn ? this.config.icon_on : this.config.icon_off) + '</i></div></div>');

    if (this.isStateOn) {
      this.$el.addClass('switch-on');
    } else {
      this.$el.addClass('switch-off');
    }

    if (!this.config.readonly) {
      if (this.isTouchSupported()) {
        this.$el.on('touchstart', this.onPress.bind(this));
        this.$el.on('touchend', this.onRelease.bind(this));
      } else {
        this.$el.on('mousedown', this.onPress.bind(this));
        this.$el.on('mouseup', this.onRelease.bind(this));
      }
    }

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  onPress: function() {
    if (this.config.type === 'button momentary') {
      this.sendSocketNotification('SWITCH_TOGGLE', {id: this.config.id, plugin: this.config.plugin, stateOn: true});
    }
  },

  onRelease: function() {
    if (this.config.type === 'button momentary') {
      this.sendSocketNotification('SWITCH_TOGGLE', {id: this.config.id, plugin: this.config.plugin, stateOn: false});
    } else {
      this.sendSocketNotification('SWITCH_TOGGLE', {id: this.config.id, plugin: this.config.plugin, stateOn: !this.isStateOn});
    }
  },

  parseValue: function(value) {
    if (isNaN(value)) {
      return String(value).toLowerCase() === 'on';
    } else {
      return value > 0;
    }
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'SWITCH_CONNECTED') {
      // Connected to plugin, get status
      this.sendSocketNotification('SWITCH_STATUS', {id: this.config.id, plugin: this.config.plugin});

    } else if (command === 'SWITCH_STATUS' && data.id === this.config.id) {

      if (this.config.stateParseExpression && this.config.stateParseExpression.length > 0) {
        let value = jsel(JSON.parse(data.state)).select(this.config.stateParseExpression);
        this.isStateOn = this.parseValue(value);
      } else {
        this.isStateOn = this.parseValue(data.state);
      }
 
      this.$el.css({
        'opacity' : 1
      });

      this.updateDom();
    }
  },

  updateDom: function() {
    if (this.$el) {
      this.$el.removeClass('switch-on switch-off');

      if (this.isStateOn) {
        this.$el.addClass('switch-on');
        this.$el.find('.js-switch-icon').text(this.config.icon_on);
      } else {
        this.$el.addClass('switch-off');
        this.$el.find('.js-switch-icon').text(this.config.icon_off);
      }
    }
  }
});
