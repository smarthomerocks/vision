/*global Module*/
Module.register('camera-onvif', {

  defaults: {
    title: 'Camera',
    plugin: 'onvif',
    id: 'pool',
    streaming: false,
    size_x: 2,
    size_y: 2
  },
  
  getStyles: function() {
    return ['camera.css'];
  },

  getTemplates: function() {
    return ['camera.hbs'];
  },

  start: function() {
    console.log('Starting camera', this.config.title);

    this.viewdata = {};
    this.viewdata.config = this.config;
    this.viewdata.thumbnail = '';

    var sourceTemplate = '<div class="box-content">'+
				'<div class="heading">{{config.title}}</div>'+
      '<div class="spapshot"><img src="{{thumbnail}}"/>' +
      '<span class="thumbnail">' +
      '<i class="material-icons">play_circle_outline</i>' +
						'</span>'+
						'<div class="updated">{{updatedformatted}}</div>'+
      '</div>';
    /* <video id="gum-local" autoplay playsinline>
    Your brower does not support playback of video streams.
    </video>

    video.srcObject = stream*/
    
    this.template = Handlebars.compile(sourceTemplate);

    this.isConnected = false;

    this.sendSocketNotification('CAMERA_PLUGIN_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  updateSnapshot: function() {

    if(this.viewdata.updated) {
      var date = moment(this.viewdata.updated);
      this.viewdata.updatedformatted = 'Uppdaterad ' + date.fromNow();
      this.render();
    }
  },

  render: function() {
    this.$el.html(this.template(this.viewdata));
  },

  getDom: function() {
    var self = this;

    this.$el = $('<div class="box box-4 camera"></div>');

    this.$el.on('click', '.thumbnail', function() {
      self.viewdata.status = 'Hämtar snapshot...';
      self.sendSocketNotification('CAMERA_SNAPSHOT', { id: self.config.id, plugin: self.config.plugin});
    });

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'CAMERA_PLUGIN_CONNECTED') {
      if (!this.$el) {
        this.getDom();
      }

      this.isConnected = true;

    } else if (command === 'CAMERA_CONNECTED' && (data.id === this.config.id)) {
      this.lastdata = data;

      this.$el.css({
        'opacity': 1
      });

      //TODO: remove.
      this.sendSocketNotification('CAMERA_START_VIDEO', {id: this.config.id, plugin: this.config.plugin, streaming: false});

      this.updateDom();
    } else if (command === 'SNAPSHOT' && (data.id === this.config.id)) {
      console.log('got snapshot.');
      this.lastdata.thumbnail = data.uri;
      this.updateDom();
    } else if (command === 'CAMERA_DISCONNECTED' && (data.id === this.config.id)) {

      this.lastdata = null;

      this.$el.css({
        'opacity': 0.4
      });

      this.updateDom();
    }
  },

  updateDom: function() {

    if (this.$el) {

      if(this.lastdata.thumbnail) {
						// Keep state to busy while plugin is busy
        this.viewdata.status = this.viewdata.busyclass === 'idle' ? '' : this.viewdata.status;
        this.viewdata.thumbnail = this.lastdata.thumbnail;

        if(this.lastdata.lastUpdate) {
          this.viewdata.updated = this.lastdata.lastUpdate;
          var date = moment(this.viewdata.updated);
          this.viewdata.updatedformatted = 'Uppdaterad ' + date.fromNow();
        }
      }

      this.render();
    }
  }
});
