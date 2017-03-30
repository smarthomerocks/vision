Module.register("camera",{

	defaults: {
		title: "Kamera",
		plugin: "blink",
		id: "Pool"
	},

	getStyles: function() {
		return ['camera.css'];
	},

	start: function() {
		var self = this;
		console.log('Starting camera', this.config);

		this.isStateUpdating = false;
		this.isConnected = false;

		this.sendSocketNotification('CAMERA_CONNECT', { id: this.config.id, plugin: this.config.plugin });

		setInterval(function(){
			self.updateLastUpdate();
		}, 60000);
	},

	updateLastUpdate: function(){
		var self = this;
		if(self.lastupdate && !self.isStateUpdating){
			var date = moment(self.lastupdate);
			self.$el.find('.updated').html("Uppdaterad " + date.fromNow());
		}

	},

	toggleButtonState: function(state){
		this.$el.find('.thumbnail').css("pointer-events", state ? "auto" : "none").css("opacity", state ? 1 : 0.4);
		this.$el.find('.livevideo').css("pointer-events", state ? "auto" : "none").css("opacity", state ? 1 : 0.4);
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box box-4 camera"><div class="box-content"><div class="heading">'+ this.config.title +'</div><div class="spapshot"><img src=""><!--<video><source src="" type="video/mp4"></video>--><span class="thumbnail"><svg fill="#fff" height="20" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M24 24H0V0h24v24z" id="a"/></defs><clipPath id="b"><use overflow="visible" xlink:href="#a"/></clipPath><path clip-path="url(#b)" d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/></svg></span></div><!--<span class="livevideo"><svg fill="#fff" height="20" viewBox="0 -1 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7z"/></svg></span>--><div class="updated"></div></div></div>');

		this.$el.find('.thumbnail').on('click', function() {
			self.isStateUpdating = true;
			self.$el.find('.updated').html('Hämtar stillbild...');
			self.toggleButtonState(false);
			self.sendSocketNotification('CAMERA_SNAPSHOT', { id: self.config.id, plugin: self.config.plugin});
		});
		
		this.$el.find('video').on('ended',function(){
				self.toggleButtonState(true);
				self.sendSocketNotification('CAMERA_SNAPSHOT', { id: self.config.id, plugin: self.config.plugin});
    });

		this.$el.find('.livevideo').on('click', function() {
			self.isStateUpdating = true;
			self.toggleButtonState(false);
			self.$el.find('.updated').html('Hämtar liveström...');
			self.sendSocketNotification('CAMERA_LIVEVIDEO', { id: self.config.id, plugin: self.config.plugin});
		});

		this.$el.css({
     'opacity' : 0.4
    });


		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		if (command === 'CAMERA_CONNECTED') {
			//console.log('CAMERA_CONNECTED.... ' + self.config.id);	
			if (!this.$el) {
				this.getDom();
			}
			
			if(!self.isConnected){
				// Connected to plugin, get status if we did not recieve any update
				this.sendSocketNotification('CAMERA_STATUS', { id: this.config.id, plugin: this.config.plugin });
				self.isConnected = true;
			}
			
		} else if (command === 'CAMERA_STATUS' && (data.id === this.config.id || data.state)) {
			//console.log("CAMERA_STATUS " + this.config.id, data)
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
					if(self.lastdata.thumbnail){
						self.isStateUpdating = false;
						this.$el.find('img').attr("src", 'data:image/jpeg;base64,' + self.lastdata.thumbnail);
						self.toggleButtonState(true);
						if(self.lastdata.lastUpdate){
							self.lastupdate = self.lastdata.lastUpdate;
							self.updateLastUpdate();
						}
				}

				if(self.lastdata.state){
					self.toggleButtonState(self.lastdata.state != 'busy');
				}

				if(self.lastdata.clip){
					self.isStateUpdating = false;
					var $video = this.$el.find('video');
					videoSrc = $('source', $video).attr('src', 'data:image/jpeg;base64,' + self.lastdata.clip);
					$video[0].load();
					$video[0].play();
					self.toggleButtonState(false);
					this.$el.find('.updated').html('LIVE');
				}
			
				if(self.lastdata.liveview){
					self.isStateUpdating = false;
					var $video = this.$el.find('video');
					videoSrc = $('source', $video).attr('src', self.lastdata.liveview+ "?rnd=" + new Date().getTime());
					$video[0].load();
					$video[0].play();
					self.toggleButtonState(false);
					this.$el.find('.updated').html('LIVE');
				}
		}
	}
});
