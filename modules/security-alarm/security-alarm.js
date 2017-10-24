/*global Module*/
Module.register('security-alarm', {

  defaults: {
    title: 'Ytterdörr',
    plugin: 'verisure'
  },

  getStyles: function() {
    return ['security-alarm.css'];
  },

  start: function() {
    console.log('Starting security-alarm ' + this.config.title);

    this.isConnected = false;

    this.sendSocketNotification('SECURITYALARM_CONNECT', { plugin: this.config.plugin});
  },

  getDom: function() {

    this.$el = $('<div class="box security-alarm">'+
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
    if (command === 'SECURITYALARM_CONNECTED') {
      // Connected to plugin, get status

      this.$el.css({
        'opacity' : 1
      });

      if(!self.isConnected) {
        // Connected to plugin, get status if we did not recieve any update
        this.sendSocketNotification('SECURITYALARM_STATUS', { alias: this.config.alias, plugin: this.config.plugin, area: this.config.area });
        self.isConnected = true;
      }


    } else if (command === 'SECURITYALARM_STATUS' && data.alias === this.config.alias) {
      self.lastdata = data;

      this.updateDom();
    }
  },

  updateDom: function() {
    var self = this;
    if (this.$el) {
      this.$el.find('.state').html(
        (self.lastdata.alarm_state === 'ARMED_AWAY' ? 'Larmat' : (self.lastdata.alarm_state === 'ARMED_HOME' ? 'Skalskyddat' : 'Avlarmat'))
      );

      this.$el.find('.date').html(moment(self.lastdata.armdate).calendar());
    }
  }
});
