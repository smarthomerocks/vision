/*global Module*/
Module.register('switch', {

  defaults: {
    title: 'Lamp',
    plugin: 'domoticz',
    id: '1',
    readonly: false,
    type: 'button',
    icon: 'lightbulb_outline',
    onCmd: 'ON',
    offCmd: 'OFF',
    size_x: 1,
    size_y: 1
  },

  getStyles: function() {
    return ['switch.css'];
  },

  start: function() {
    console.log('Starting switch ' + this.config.title);

    this.isStateOn = false;

    this.sendSocketNotification('SWITCH_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  getDom: function() {

    this.$el = $('<div class="box' + (this.config.readonly ? '' : ' box-clickable') + ' switch"><div class="box-content"><div class="heading">' + this.config.title + '</div><i class="material-icons md-64">' + this.config.icon + '</i></div></div>');

    if (this.isStateOn) {
      this.$el.addClass('switch-on');
    } else {
      this.$el.addClass('switch-off');
    }

    if (!this.config.readonly) {
      this.$el.on('touchstart', this.onPress.bind(this));
      this.$el.on('mousedown', this.onPress.bind(this));
      this.$el.on('touchend', this.onRelease.bind(this));
      this.$el.on('mouseup', this.onRelease.bind(this));
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

  socketNotificationReceived: function(command, data) {
    if (command === 'SWITCH_CONNECTED') {
			// Connected to plugin, get status
      this.sendSocketNotification('SWITCH_STATUS', {id: this.config.id, plugin: this.config.plugin});

    } else if (command === 'SWITCH_STATUS' && data.id === this.config.id) {
      this.isStateOn = data.isStateOn;

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
      } else {
        this.$el.addClass('switch-off');
      }
    }
  }
});