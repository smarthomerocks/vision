/*global Module*/
Module.register('counter', {

  defaults: {
    title: 'Räknare',
    plugin: 'domoticz',
    id: 4
  },

  getStyles: function() {
    return ['counter.css'];
  },

  start: function() {
    console.log('Starting counter ' + this.config.title);

    this.sendSocketNotification('COUNTER_CONNECT', { id: this.config.id, plugin: this.config.plugin });
  },

  getDom: function() {
    this.$el = $('<div class="box counter">'+
		'<div class="box-content">'+
			'<div class="heading">'+ this.config.title +'</div>'+
				'<div class="current"></div>'+
				'<div class="highest history"></div>'+
				'<div class="lowest history"></div>'+
			'</div>'+
		'</div>');

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    var self = this;
		//console.log(data);
    if (command === 'COUNTER_CONNECTED') {
			// Connected to plugin, get status
      this.sendSocketNotification('COUNTER_STATUS', { id: this.config.id, plugin: this.config.plugin });

    } else if (command === 'COUNTER_STATUS' && data.id === this.config.id) {
      self.lastdata = data;

      this.$el.css({
        'opacity' : 1
      });

      this.updateDom();
    }
  },

  updateDom: function() {
    var self = this;
    if (this.$el) {
      this.$el.find('.current').html(self.lastdata.current + (self.lastdata.unit ? self.lastdata.unit : ''));

      if(self.lastdata.lowest) {
        this.$el.find('.lowest').html('Lägsta ' + self.lastdata.lowest + (self.lastdata.unit ? self.lastdata.unit : ''));
      }

      if(self.lastdata.highest) {
        this.$el.find('.highest').html('Högsta ' + self.lastdata.highest + (self.lastdata.unit ? self.lastdata.unit : ''));
      }
    }
  }
});
