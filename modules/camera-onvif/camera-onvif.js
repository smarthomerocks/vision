/*global Module*/
Module.register('camera-onvif', {

  defaults: {
    title: 'Camera',
    plugin: 'onvif',
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

    this.lastdata = {};
    this.viewdata = {};
    this.viewdata.config = this.config;
    this.viewdata.thumbnail = '';

    var sourceTemplate = '<div class="box-content">'+
				'<div class="heading">{{config.title}}</div>'+
      '<div class="spapshot"><img src="{{thumbnail}}"/>' +
      '<span class="thumbnail"></span>' +
      '<div class="updated">{{updatedformatted}}</div>'+
      '</div>';
    /* <video id="gum-local" autoplay playsinline>
    Your brower does not support playback of video streams.
    </video>

    video.srcObject = stream*/
    
    this.template = Handlebars.compile(sourceTemplate);

    if (!this.$el) {
      this.getDom();
    }

    this.sendSocketNotification('CAMERA_CONNECT', {id: this.config.id});
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
    this.$el = $('<div class="box box-4 camera"><i class="material-icons md-36">videocam</i></div>');
    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'CAMERA_CONNECTED' && (data.id === this.config.id)) {
      this.lastdata = data || {};

      this.$el.css({
        'opacity': 1
      });

      this.sendSocketNotification('CAMERA_START_VIDEO', {id: this.config.id, plugin: this.config.plugin, streaming: false});
      this.updateDom();

    } else if (command === 'SNAPSHOT' && (data.id === this.config.id)) {

      this.lastdata.snapshotUri = data.uri;
      this.updateDom();

    } else if (command === 'CAMERA_DISCONNECTED' && (data.id === this.config.id)) {

      this.lastdata = {};
      this.$el.css({
        'opacity': 0.4
      });

      this.updateDom();
    }
  },

  updateDom: function() {

    if (this.$el) {

      if(this.lastdata.snapshotUri) {
        this.viewdata.thumbnail = this.lastdata.snapshotUri;
      }

      this.render();
    }
  }
});
