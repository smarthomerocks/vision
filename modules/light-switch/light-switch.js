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

		this.$el = $('<div class="box box-clickable light-switch"><div class="box-content"><div class="heading">'+ this.config.title +'</div><i class="material-icons md-64">lightbulb_outline</i></div></div>');

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
