Module.register("light-switch",{

	defaults: {
		title: "Lampa",
		plugin: "domoticz",
		id: 1
	},

		getStyles: function() {
		return ['light-switch.css'];
	},

	start: function() {
		console.log('Starting light-switch ' + this.config.title);

		this.isStateOn = false;

		this.sendSocketNotification('LIGHT_SWITCH_CONNECT', { id: this.config.id, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box box-4 lights"><div class="box-content"><div class="heading">'+ this.config.title +'</div><svg fill="#ffffff" height="160" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M0 0h24v24H0V0z" id="a"></path></defs><clipPath id="b"><use overflow="visible" xlink:href="#a"></use></clipPath><path clip-path="url(#b)" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path></svg></div></div>');

		if (this.isStateOn) {
			this.$el.addClass('light-switch-on');
		} else {
			this.$el.addClass('light-switch-off');
		}

		this.$el.on('click', function() {
			self.sendSocketNotification('LIGHT_SWITCH_TOGGLE', { id: self.config.id, plugin: self.config.plugin, stateOn: !self.isStateOn });
		});

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		if (command === 'LIGHT_SWITCH_CONNECTED') {
			// Connected to plugin, get status
			this.sendSocketNotification('LIGHT_SWITCH_STATUS', { id: this.config.id, plugin: this.config.plugin });


		} else if (command === 'LIGHT_SWITCH_STATUS' && data.id === this.config.id) {
			this.isStateOn = data.isStateOn;

			this.$el.css({
				'opacity' : 1
			});

			this.updateDom();
		}
	},

	updateDom: function() {
		if (this.$el) {
			this.$el.removeClass('light-switch-on light-switch-off');

			if (this.isStateOn) {
				this.$el.addClass('light-switch-on');
			} else {
				this.$el.addClass('light-switch-off');
			}
		}
	}
});
