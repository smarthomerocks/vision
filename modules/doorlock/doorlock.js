/*global Module*/
Module.register('doorlock', {
  
  defaults: {
    title: "Ytterdörr",
    plugin: "verisure",
  },
  
  getStyles: function() {
    return ['doorlock.css'];
  },

  start: function() {
    console.log('Starting doorlock ' + this.config.title);

    this.isConnected = false;this.sendSocketNotification('DOORLOCK_CONNECT', { plugin: this.config.plugin});
  },

  getDom: function() {
    this.$el = $('<div class="box doorlock">'+
    '<div class="box-content">'+
      '<div class="heading">'+ this.config.title +'</div>'+
        '<div class="state"></div>'+
        '<div class="date"></div>'+
        '<div class="user"></div>'+
      '</div>'+
    '</div>');

    this.$el.css({
     'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    var self = this;
    if (command === 'DOORLOCK_CONNECTED') {
      // Connected to plugin, get status

      this.$el.css({
        'opacity' : 1
      });

      if (!self.isConnected) {
        // Connected to plugin, get status if we did not recieve any update
        this.sendSocketNotification('DOORLOCK_STATUS', { alias: this.config.alias, plugin: this.config.plugin, area: this.config.area });
        self.isConnected = true;
      }
    } else if (command === 'DOORLOCK_STATUS' && data.area === this.config.area && data.alias === this.config.alias) {
      self.lastdata = data;

      this.updateDom();
    }
  },
  
  updateDom: function() {
    var self = this;
    if (this.$el) {
      this.$el.find('.state').html(self.lastdata.lockstate ? '<i class="material-icons md-48">lock</i>' : '<i class="material-icons md-48">lock_open</i>');
      this.$el.find('.date').html(moment(self.lastdata.lockdate).calendar());
      this.$el.find('.user').html(self.lastdata.user ? self.lastdata.user : '');
    }
  }
});