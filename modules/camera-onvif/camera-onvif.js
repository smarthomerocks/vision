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
    this.viewdata.snapshot = '';

    var sourceTemplate = 
    `<div class="heading">{{config.title}}</div>     
       {{#if streaming}}
         <div class="video">
           <video autoplay playsinline>
             Your brower does not support playback of video streams.
           </video>
         </div>
       {{else}}
         <div class="snapshot">
           <img src="{{snapshot}}"/>
           <div class="updated">{{updatedformatted}}</div>
         </div>
       {{/if}}
     </div>`;
    
    this.template = Handlebars.compile(sourceTemplate);

    if (!this.$el) {
      this.getDom();
    }

    this.sendSocketNotification('CAMERA_CONNECT', {id: this.config.id});
  },

  updateSnapshot: function() {
    /*if(this.lastdata.updated) {
      var date = moment(this.viewdata.updated);
      this.viewdata.updatedformatted = 'Uppdaterad ' + date.fromNow();
    }*/

    if(this.lastdata.snapshotUri) {
      this.viewdata.snapshot = this.lastdata.snapshotUri;
    }

    this.render();
  },

  render: function() {
    this.$el.html(this.template(this.viewdata));
  },

  getDom: function() {
    this.$el = $(
      `<div class="box box-4 camera">
        <div class="box-content"></div>
       </div>`);
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

      this.sendSocketNotification('CAMERA_START_VIDEO', {id: this.config.id, plugin: this.config.plugin, streaming: this.config.streaming});
      this.render();

    } else if (command === 'SNAPSHOT' && (data.id === this.config.id)) {

      this.lastdata.snapshotUri = data.uri;
      this.lastdata.updated = data.datetime;

      this.updateSnapshot();

    } else if (command === 'CAMERA_DISCONNECTED' && (data.id === this.config.id)) {

      this.lastdata = {};
      this.$el.css({
        'opacity': 0.4
      });

      this.render();
    }
  }
});
