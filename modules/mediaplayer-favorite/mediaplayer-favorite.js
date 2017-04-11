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

		this.$el = $('<div class="box box-clickable mediaplayer-favorite"><div class="box-content"><div class="heading">'+ this.config.title +'</div><i class="material-icons">favorite</i></div></div>');

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
