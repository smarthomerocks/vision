/*global Module*/
Module.register('apple-tv-remote', {

  defaults: {
    title: 'Apple TV',
    plugin: 'itach'
  },

  getStyles: function() {
    return ['apple-tv-remote.css'];
  },

  start: function() {
    console.log('Starting apple-tv-remote ' + this.config.title);

    this.sendSocketNotification('APPLE_TV_REMOTE_CONNECT', { plugin: this.config.plugin });
  },

  getDom: function() {
    var self = this;

    this.$el = $('<div class="box box-4 apple-tv-remote"><div class="heading">'+ this.config.title +'</div><div class="apple-tv-remote-container"></div></div>');

    var row1 = $('<div class="grid"><div class="col-1-3 mobile-col-1-3"></div><div class="col-1-3 mobile-col-1-3"><button class="js-apple-tv-remote-up"><i class="material-icons">expand_less</i></button></div></div>');
    var row2 = $('<div class="grid"><div class="col-1-3 mobile-col-1-3"><button class="js-apple-tv-remote-left"><i class="material-icons">chevron_left</i></button></div><div class="col-1-3 mobile-col-1-3">' +
        '<button class="js-apple-tv-remote-enter">OK</button></div><div class="col-1-3 mobile-col-1-3"><button class="js-apple-tv-remote-right"><i class="material-icons">chevron_right</i></button></div></div>');
    var row3 = $('<div class="grid"><div class="col-1-3 mobile-col-1-3"></div><div class="col-1-3 mobile-col-1-3"><button class="js-apple-tv-remote-down"><i class="material-icons">expand_more</i></button></div></div>');
    var row4 = $('<div class="grid"><div class="col-1-2 mobile-col-1-2"><button class="js-apple-tv-remote-menu">Meny</button></div><div class="col-1-2 mobile-col-1-2"><button class="js-apple-tv-remote-play"><i class="material-icons">play_arrow</i></button></div></div>');

    this.$el.find('.apple-tv-remote-container').append(row1).append(row2).append(row3).append(row4);

    var commandMap = {
      'js-apple-tv-remote-up': this.config.buttons.up,
      'js-apple-tv-remote-left': this.config.buttons.left,
      'js-apple-tv-remote-right': this.config.buttons.right,
      'js-apple-tv-remote-down': this.config.buttons.down,
      'js-apple-tv-remote-enter': this.config.buttons.enter,
      'js-apple-tv-remote-menu': this.config.buttons.menu,
      'js-apple-tv-remote-play': this.config.buttons.play
    };

    this.$el.on('click', 'button', function() {
      self.sendSocketNotification('APPLE_TV_REMOTE_SEND_COMMAND', { plugin: self.config.plugin, commands: commandMap[$(this).attr('class')] });
    });

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'APPLE_TV_REMOTE_CONNECT') {
      this.$el.css({
        'opacity' : 1
      });
    }
  }
});
