Module.register("temperature-meter",{

	defaults: {
		title: "Temperatud",
		plugin: "domoticz",
		id: 4
	},

	getStyles: function() {
		return ['temperature-meter.css'];
	},

	start: function() {
		console.log('Starting TEMP-meter ' + this.config.title);

		this.sendSocketNotification('TEMP_METER_CONNECT', { id: this.config.id, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box temperature">'+
		'<div class="box-content">'+
			'<div class="heading">'+ this.config.title +'</div>'+
				'<div class="current"></div>'+
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
		if (command === 'TEMP_METER_CONNECTED') {
			// Connected to plugin, get status
			this.sendSocketNotification('TEMP_METER_STATUS', { id: this.config.id, plugin: this.config.plugin });

		} else if (command === 'TEMP_METER_STATUS' && data.id === this.config.id) {
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
			this.$el.find('.current').html(self.lastdata.current +  "&deg;C");

			if(self.lastdata.lowest){
				this.$el.find('.lowest').html('Lägsta ' + self.lastdata.lowest +  '&deg;C ('+ self.lastdata.lowestdate +')');
			}

			if(self.lastdata.highest){
				this.$el.find('.highest').html('Högsta ' + self.lastdata.highest +  '&deg;C ('+ self.lastdata.highestdate +')');
			}
		}
	}
});
