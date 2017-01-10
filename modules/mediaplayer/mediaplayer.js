Module.register("mediaplayer",{

	defaults: {
    title: "Kontor",
    plugin: "sonos",
    devicename: "Kontor-2"
	},

	start: function() {
		console.log('Starting mediaplayer');

		this.getDom();

		this.sendSocketNotification('MEDIAPLAYER_CONNECT', { device: this.config.devicename, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box sonos"><img class="albumart" src="https://i.scdn.co/image/2f17df68d14c2475433643fb949754178670e96b" /><div class="heading">'+ this.config.title +'</div><div class="buttons"><span class="prev"><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg></span><span class="play"><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg></span><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg></div><div class="scroll-text-container"><div class="title">Anna &amp; Barnkören - Luffarvisan - Fri som en fågel (Rasmus på Luffen)</div></div><input type="range" value="40" class="volume" /></div>');

		this.$el.find('.play').on('click', function() {
			self.sendSocketNotification('MEDIAPLAYER_PLAYSTATE_CHANGE', { device: self.config.devicename, plugin: self.config.plugin, state: self.lastdata.state == 'paused' ? 'playing' : 'paused' });
		});

		this.$el.find('.volume').on('change', function() {
			self.sendSocketNotification('MEDIAPLAYER_VOLUME_CHANGE', { device: self.config.devicename, plugin: self.config.plugin, volume: $(this).val() });
		});

		$('.main').append(this.$el);

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		if (command === 'MEDIAPLAYER_CONNECTED') {
			// Connected to plugin, get status
			this.sendSocketNotification('MEDIAPLAYER_STATUS', { device: this.config.devicename, plugin: this.config.plugin });
		} else if (command === 'MEDIAPLAYER_STATUS' && data.device === this.config.devicename) {
			self.lastdata = data.data;
			this.updateDom();
		}
	},

	updateDom: function() {
		var self = this;
		if (this.$el) {
			
			this.$el.find('.title').html(this.lastdata.currenttrack.artist +  " - " + this.lastdata.currenttrack.title);
			this.$el.find('.albumart').attr('src',this.lastdata.currenttrack.albumArtURL);
			this.$el.find('.volume').val(this.lastdata.volume);

			if(this.lastdata.state == 'playing'){
				this.$el.find('.buttons .play').html('<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve"><g><rect x="4" width="5" height="16" y="4"></rect><rect x="14" width="5" height="16" y="4"></rect></g></svg>');
			}else {
				this.$el.find('.buttons .play').html('<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');

			}
		}
	}
});
