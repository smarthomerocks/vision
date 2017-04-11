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

		this.sendSocketNotification('ENERGY_METER_CONNECT', { id: this.config.id, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box energy">'+
		'<div class="box-content">'+
		'<div class="heading">'+ this.config.title +'</div>'+
		'<div class="current">0 W</div>'+
		'<div class="today"></div>'+
		'<div class="highest history"></div>'+
		'<div class="lowest history"></div>'+
		'</div>'+
		'</div>');

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		//console.log(data);
		if (command === 'ENERGY_METER_CONNECTED') {
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
			this.$el.find('.current').html((self.lastdata.current / 1000) >= 1 ? Math.round(self.lastdata.current/100,1)/10 + ' kW' : self.lastdata.current + ' W' );

			if (self.lastdata.today) {
				this.$el.find('.today').html(Math.round(self.lastdata.today*10)/10 +  "kWh idag");
			}

			if(self.lastdata.lowest){
				this.$el.find('.lowest').html('Lägsta ' + Math.round(self.lastdata.lowest*10)/10 +  'kWh ('+ self.lastdata.lowestdate+ ')');
			}

			if(self.lastdata.highest){
				this.$el.find('.highest').html('Högsta ' + Math.round(self.lastdata.highest*10)/10 +  'kWh ('+ self.lastdata.highestdate + ')');
			}
		}
	}
});
