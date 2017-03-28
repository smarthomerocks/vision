Module.register("mediaplayer-favorite",{

	defaults: {
		title: "Lampa",
		plugin: "sonos",
		devicename: 2
	},

	getStyles: function() {
		return ['mediaplayer-favorite.css'];
	},

	start: function() {
		console.log('Starting mediaplayer-favorite ' + this.config.title);

		this.isStateOn = false;

		this.sendSocketNotification('MEDIAPLAYER_FAVORITE_CONNECT', { device: this.config.devicename, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box box-clickable mediaplayer-favorite"><div class="box-content"><div class="heading">'+ this.config.title +'</div><svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div></div>');

		this.$el.on('click', function() {
			self.sendSocketNotification('MEDIAPLAYER_FAVORITE_PLAY', { device: self.config.devicename, plugin: self.config.plugin, favoriteName: self.config.favoriteName });
		});

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		if (command === 'MEDIAPLAYER_FAVORITE_CONNECTED') {
      this.$el.css({
        'opacity' : 1
      });
		}
	}
});
