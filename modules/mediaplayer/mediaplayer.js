Module.register("mediaplayer",{

	defaults: {
    title: "Kontor",
    plugin: "sonos",
    devicename: "Kontor-2"
	},

	getStyles: function() {
		return ['mediaplayer.css'];
	},

	start: function() {
		console.log('Starting mediaplayer ' + this.config.devicename);

		this.sendSocketNotification('MEDIAPLAYER_CONNECT', { device: this.config.devicename, plugin: this.config.plugin });

	var self = this;
		setInterval(function() {
			self.updateDuration();
		}, 1000);
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box box-double media-player"><img class="albumart" src="//placehold.it/80x80" /><div class="heading">'+ this.config.title +'</div><div class="buttons"><span class="prev"><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg></span><span class="play"><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg></span><span class="next"><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg></div><div class="title">&nbsp;</div><div class="artist">&nbsp;</div><div class="album">&nbsp;</div><div class="nexttrack">&nbsp;</div><div class="time"><span class="elapsed"></span><input type="range" value="0" min="0" max="100" class="position" /><span class="duration"></span></div><input type="range" value="0" class="volume" /></div>');

		this.$el.find('.play').on('click', function() {
			if(!self.lastdata) return;
			self.sendSocketNotification('MEDIAPLAYER_PLAYSTATE_CHANGE', { device: self.config.devicename, plugin: self.config.plugin, state: self.lastdata.playbackstate == 'PAUSED_PLAYBACK' ? 'playing' : 'paused' });
		});

		this.$el.find('.prev').on('click', function() {
			if(!self.lastdata) return;
			self.sendSocketNotification('MEDIAPLAYER_PLAYSTATE_PREV', { device: self.config.devicename, plugin: self.config.plugin });
		});

		this.$el.find('.next').on('click', function() {
			if(!self.lastdata) return;
			self.sendSocketNotification('MEDIAPLAYER_PLAYSTATE_NEXT', { device: self.config.devicename, plugin: self.config.plugin });
		});

		this.$el.find('.volume').on('change', function() {
			if(!self.lastdata) return;
			self.sendSocketNotification('MEDIAPLAYER_VOLUME_CHANGE', { device: self.config.devicename, plugin: self.config.plugin, volume: $(this).val() });
		});

		this.$el.find('.position').on('change', function() {
			if(!self.lastdata) return;
			self.sendSocketNotification('MEDIAPLAYER_TRACK_SEEK', { device: self.config.devicename, plugin: self.config.plugin, duration: Math.round(($(this).val()/100) * self.lastdata.currenttrack.duration)});
		});

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		if (command === 'MEDIAPLAYER_CONNECTED') {
			// Connected to plugin, get status
			this.sendSocketNotification('MEDIAPLAYER_STATUS', { device: this.config.devicename, plugin: this.config.plugin });

		} else if (command === 'MEDIAPLAYER_STATUS' && data.device === this.config.devicename) {

			this.$el.css({
				'opacity' : 1
			});

			self.lastdata = data.data;
			self.lastdata.timestate = {};
			self.lastdata.timestate.lastupdate = Date.now();

			this.updateDom();
		}
	},
	updateDuration: function () {
		var self = this;

		if(!self.lastdata) return;

		var elapsedMillis, realElapsed;

    if (self.lastdata.playbackstate == "PLAYING"){
				elapsedMillis = self.lastdata.elapsedtime * 1000 + (Date.now() - self.lastdata.timestate.lastupdate);
				realElapsed = Math.floor(elapsedMillis / 1000);

		} else {
				realElapsed = self.lastdata.elapsedtime;
				elapsedMillis = realElapsed * 1000;
		}

		if (this.$el) {
			this.$el.find('.elapsed').html(self.toFormattedTime(realElapsed));
			this.$el.find('.duration').html(self.toFormattedTime(self.lastdata.currenttrack.duration));
			this.$el.find('.position').val(Math.round(realElapsed/self.lastdata.currenttrack.duration*100));
		}
  },

	updateDom: function() {
		var self = this;
		if (this.$el) {

			this.$el.find('.artist').html(this.lastdata.currenttrack.artist);
			this.$el.find('.title').html(this.lastdata.currenttrack.title);
			this.$el.find('.album').html(this.lastdata.currenttrack.album);
			this.$el.find('.albumart').attr('src',this.lastdata.currenttrack.albumart);
			this.$el.find('.bg').attr('src',this.lastdata.currenttrack.albumart);
			this.$el.find('.volume').val(this.lastdata.volume);

			if(this.lastdata.playbackstate == 'PLAYING'){
				this.$el.find('.buttons .play').html('<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve"><g><rect x="5" width="5" height="14" y="5"></rect><rect x="14" width="5" height="14" y="5"></rect></g></svg>');
			}else {
				this.$el.find('.buttons .play').html('<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
			}

			if(this.lastdata.currenttrack.type == 'radio'){
				this.$el.find('.time').hide();
			}else {
					this.$el.find('.time').show();
			}

			if(this.lastdata.nexttrack && this.lastdata.nexttrack.title && this.lastdata.nexttrack.artist){
				this.$el.find('.nexttrack').html("Nästa: " + this.lastdata.nexttrack.title + " - " + this.lastdata.nexttrack.artist);
			}else {
				this.$el.find('.nexttrack').html("");
			}

			self.updateDuration();
		}
	},
	zpad : function(number, width) {
		var str = number + "";
		if (str.length >= width) return str;
		var padding = new Array(width - str.length + 1).join('0');
		return padding + str;
	},
	toFormattedTime: function (seconds) {
			var self = this;
			var chunks = [];
			var modulus = [60 ^ 2, 60];
			var remainingTime = seconds;
			// hours
			var hours = Math.floor(remainingTime / 3600);

			if (hours > 0) {
				chunks.push(zpad(hours, 1));
				remainingTime -= hours * 3600;
			}

			// minutes
			var minutes = Math.floor(remainingTime / 60);
			// If we have hours, pad minutes, otherwise not.
			var padding = chunks.length > 0 ? 2 : 1;
			chunks.push(this.zpad(minutes, padding));
			remainingTime -= minutes * 60;
			// seconds
			chunks.push(this.zpad(Math.floor(remainingTime), 2))
			return chunks.join(':');
		}
});
