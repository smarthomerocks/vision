Module.register("camera",{

	defaults: {
		title: "Kamera",
		plugin: "blink",
		id: "Pool"
	},

	start: function() {
		console.log('Starting camera', this.config);

		this.isStateOn = false;

		this.sendSocketNotification('CAMERA_CONNECT', { id: this.config.id, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box box-4 camera"><div class="heading">'+ this.config.title +'</div><img src="" class="camera-img"><div class="updated"></div><span class="thumbnail"><svg fill="#fff" height="20" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M24 24H0V0h24v24z" id="a"/></defs><clipPath id="b"><use overflow="visible" xlink:href="#a"/></clipPath><path clip-path="url(#b)" d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/></svg></span><span class="livevideo"><svg fill="#fff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7z"/></svg></span><video width="100%" controls="controls"><source src=""></source</video></div>');

		this.$el.find('.thumbnail').on('click', function() {
			self.sendSocketNotification('CAMERA_SNAPSHOT', { id: self.config.id, plugin: self.config.plugin});
		});

			this.$el.find('.livevideo').on('click', function() {
			self.sendSocketNotification('CAMERA_LIVEVIDEO', { id: self.config.id, plugin: self.config.plugin});
		});

		this.$el.css({
     'opacity' : 0.4
    });


		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		//console.log(data);
		if (command === 'CAMERA_CONNECTED') {
			console.log('CAMERA_CONNECTED.... ' + self.config.id);	
			if (!this.$el) {
				this.getDom();
			}
			// Connected to plugin, get status
			this.sendSocketNotification('CAMERA_STATUS', { id: this.config.id, plugin: this.config.plugin });

		} else if (command === 'CAMERA_STATUS' && data.id === this.config.id) {
			console.log("CAMERA_STATUS " + this.config.id, data)
			self.lastdata = data;

			this.$el.css({
				'opacity' : 1
			});

			this.updateDom();
		}
	},

	updateDom: function() {

		var self = this;
				console.log("updateDom", self.lastdata)
		if (this.$el) {
			if(self.lastdata.thumbnail){
				this.$el.find('.camera-img').attr("src", self.lastdata.thumbnail);
			}

			if(self.lastdata.lastUpdate){
					this.$el.find('.updated').html(self.lastdata.lastUpdate);
			}
			
			if(self.lastdata.liveview){

				var $video = this.$el.find('video');
				videoSrc = $('source', $video).attr('src', self.lastdata.liveview);
				$video[0].load();
				$video[0].play();
			}
		}
	}
});
