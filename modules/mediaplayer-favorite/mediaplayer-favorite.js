/*global Module winston*/
Module.register('mediaplayer-favorite', {

  defaults: {
    title: 'Favorite',
    plugin: 'sonos',
    icon: 'music_note',
    devicename: 2
  },

  getStyles: function() {
    return ['mediaplayer-favorite.css'];
  },

  start: function() {
    winston.info('Starting mediaplayer-favorite ' + this.config.title);

    this.isStateOn = false;

    this.sendSocketNotification('MEDIAPLAYER_FAVORITE_CONNECT', { device: this.config.devicename, plugin: this.config.plugin });
  },

  getDom: function() {
    var self = this;

    this.$el = $('<div class="box box-clickable mediaplayer-favorite"><div class="box-content"><div class="heading">'+ this.config.title +'</div><i class="material-icons">' + this.config.icon + '</i></div></div>');

    this.$el.on(this.clickEvent(), function() {
      self.sendSocketNotification('MEDIAPLAYER_FAVORITE_PLAY', { device: self.config.devicename, plugin: self.config.plugin, favoriteName: self.config.favoriteName });
    });

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'MEDIAPLAYER_FAVORITE_CONNECTED') {
      this.$el.css({
        'opacity' : 1
      });
    }
  }
});
