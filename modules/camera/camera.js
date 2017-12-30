/*global Module winston*/
Module.register('camera', {

  defaults: {
    title: 'Kamera',
    plugin: 'blink',
    id: 'Pool'
  },

  getStyles: function() {
    return ['camera.css'];
  },

  getTemplates: function() {
    return ['camera.hbs'];
  },

  start: function() {
    var self = this;
    winston.info('Starting camera', this.config);

    this.viewdata = {};
    this.viewdata.config = this.config;
    this.viewdata.thumbnail = '/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAKAAD/4QMxaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc' +
        '1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzExMSA3OS4xNTgzMjUsIDIwMTUvMDkvMTAtMDE6MTA6M' +
        'jAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDo' +
        'vL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY' +
        '2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY3M0RBNTkyMEUzNjExRTc4RkRDQTEzNkU5QUYyNDNGIiB4bXB' +
        'NTTpEb2N1bWVudElEPSJ4bXAuZGlkOjY3M0RBNTkzMEUzNjExRTc4RkRDQTEzNkU5QUYyNDNGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc3MDlCRkYwRTBCMTFFNzhGRENBM' +
        'TM2RTlBRjI0M0YiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc3MDlDMDAwRTBCMTFFNzhGRENBMTM2RTlBRjI0M0YiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2t' +
        'ldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAUEBAZEhknFxcnMiYfJjIuJiYmJi4+NTU1NTU+REFBQUFBQUREREREREREREREREREREREREREREREREREREREARUZGSAcICYYGCY2JiAmNkQ2Kys2REREQjVCR' +
        'ERERERERERERERERERERERERERERERERERERERERERERERERET/wAARCAFoAoADASIAAhEBAxEB/8QAVQABAQEAAwEAAAAAAAAAAAAAAQACBAUGAwEBAQEBAAAAAAAAAAAAAAAAAAEDAhABAQEAAAAAAAAAAAAAAAAAABE' +
        'BEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDziSBJIEkgKBBJIVEEEQQSRBEFRFEUFEAVDBAjDAZijUUARRqKAzFGoYDMUaigMxRqKAzBG4oDEUbiiDEUbggMxRqKAzFGooKzFGooDMUaigMxQxQBEVABMUAEx' +
        'QEUQBKQSKBJEAUQCKQSSBJIRApAJIAiAdeknaJIgEUCSQJFCpIgkUCKhigJhgohhhgCKNRQBDDDAZhhhgMwxqKCMxRuKAzFGoYDEMaigMxRqKAzBG4ogxFG4oDEUaigrMUaggMxRqKAzFGoIDMUaigMxRqKAzFDFAEMMUA' +
        'QwxQFEYQCJQCKBIoAUQCKQCKAIgQIgECEECgdejE7QIkGSVACMMFCMMAIwwBDDFFVQwwwBDDDAEMMMAQwwwBFGoYDMMaigMwxqKAzDGooIzFG4oDMUaigMxRqKIrMUaigMRRuCAzBG4IDMUaigMRRqKIMwRuCCsxRqCAzF' +
        'GooDMUMUARNRACiAJQJFACUARQgKIBFAEUgAUIAUDKIAIoHBijUUdIzFGooDMMMMBmKNRQURRqKAIYYYqiGGGAIYYYAjUMMAQwxqAzDGoYDMMahgMQxqGAzFG4oDMUahgMxRqKAzFG4oDEUbiiDEEbigMRRqKAxFGoogxF' +
        'GooKxFGooDEUaigMwRqKAzBGooDMUaggCIwwAiQBRAIkAigCKEBRAIoAGgIEUDIaCABQMooHEijUUdIzFGooDMMaigrMMMMBmGGGKrMMahgMwxqGAIY1DAEMMagMwxqGAIYYYDMMahgMwxqKAzDGoYDEMaigMxRuKAxFG4' +
        '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';

    var sourceTemplate = '<div class="box-content">'+
				'<div class="heading">{{config.title}}</div>'+
					'<div class="spapshot"><img src="data:image/jpeg;base64,{{thumbnail}}"/>'+
						'<span class="thumbnail {{busyclass}}">'+
							'<svg fill="#fff" height="20" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>' +
                '<path d="M24 24H0V0h24v24z" id="a"/></defs><clipPath id="b"><use overflow="visible" xlink:href="#a"/></clipPath><path clip-path="url(#b)" ' +
                'd="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/></svg>'+
						'</span>'+
						'<div class="updated">{{updatedformatted}}</div>'+
						'<div class="status">{{status}}</div></div>'+
				'</div>';

    this.template = Handlebars.compile(sourceTemplate);

    this.isConnected = false;

    this.sendSocketNotification('CAMERA_CONNECT', { id: this.config.id, plugin: this.config.plugin });

    setInterval(function() {
      self.updateLastUpdate();
    }, 60000);
  },

  updateLastUpdate: function() {
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
    var self = this;
    if (command === 'CAMERA_CONNECTED') {
      if (!this.$el) {
        this.getDom();
      }
			
      if(!self.isConnected) {
				// Connected to plugin, get status if we did not recieve any update
        this.sendSocketNotification('CAMERA_STATUS', { id: this.config.id, plugin: this.config.plugin });
        self.isConnected = true;
      }
			
    } else if (command === 'CAMERA_STATUS' && (data.id === this.config.id || data.state)) {
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
					
      if(self.lastdata.state) {
        self.viewdata.busyclass = self.lastdata.state;
      }

      if(self.lastdata.armed) {
        self.viewdata.armed = self.lastdata.armed;
      }
					
      if(self.lastdata.thumbnail) {
						// Keep state to busy while plugin is busy
        self.viewdata.status = self.viewdata.busyclass == 'idle' ? '' : self.viewdata.status ;
        self.viewdata.thumbnail = self.lastdata.thumbnail;

        if(self.lastdata.lastUpdate) {
          self.viewdata.updated = self.lastdata.lastUpdate;
          var date = moment(self.viewdata.updated);
          self.viewdata.updatedformatted = 'Uppdaterad ' + date.fromNow();
        }
      }

      self.render();
    }
  }
});
