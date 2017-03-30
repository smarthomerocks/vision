Module.register("energy-meter",{

	defaults: {
		title: "Energiförbrukning",
		plugin: "domoticz",
		id: 4
	},


	getStyles: function() {
		return ['energy-meter.css'];
	},

	start: function() {
		console.log('Starting energy-meter ' + this.config.title);

		this.isStateOn = false;

		this.sendSocketNotification('ENERGY_METER_CONNECT', { id: this.config.id, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box energy"><div class="box-content"><div class="heading">'+ this.config.title +'</div><div class="current">0 W</div><div class="today"></div></div></div>');

		this.$el.css({
     'opacity' : 0.4
    });


		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		//console.log(data);
		if (command === 'ENERGY_METER_CONNECTED') {

			if (!this.$el) {
				this.getDom();
			}
			// Connected to plugin, get status
			this.sendSocketNotification('ENERGY_METER_STATUS', { id: this.config.id, plugin: this.config.plugin });

		} else if (command === 'ENERGY_METER_STATUS' && data.id === this.config.id) {
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
			this.$el.find('.current').html(Math.round(self.lastdata.current) +  " W");

			if (self.lastdata.today) {
				this.$el.find('.today').html(Math.round(self.lastdata.today/1000) +  " kWh idag");
			}
		}
	}
});
