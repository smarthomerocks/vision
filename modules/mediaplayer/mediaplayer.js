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

		this.$el = $('<div class="box box-double media-player"><img class="albumart" src="//placehold.it/80x80" /><div class="heading">'+ this.config.title +'</div><div class="buttons"><span class="prev"><i class="material-icons">fast_rewind</i></span><span class="play"><i class="material-icons">play_arrow</i></span><span class="next"><i class="material-icons">fast_forward</i></span></div><div class="title">&nbsp;</div><div class="artist">&nbsp;</div><div class="album">&nbsp;</div><div class="nexttrack">&nbsp;</div><div class="time"><span class="elapsed"></span><input type="range" value="0" min="0" max="100" class="position" /><span class="duration"></span></div><input type="range" value="0" class="volume" /></div>');

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
				this.$el.find('.buttons .play .material-icons').html('pause');
			}else {
				this.$el.find('.buttons .play .material-icons').html('play_arrow');
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
