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

		this.isStateOn = false;

		this.sendSocketNotification('TEMP_METER_CONNECT', { id: this.config.id, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box temperature"><div class="box-content"><div class="heading">'+ this.config.title +'</div><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve" width="512px" height="512px"><g><g><path d="M20,21.527V4.006C20,1.793,18.205,0,16,0c-2.209,0-4,1.787-4,4.006v17.521    c-1.228,1.099-2,2.696-2,4.473c0,3.312,2.687,6,6,6c3.312,0,6-2.688,6-6C22,24.223,21.229,22.626,20,21.527z M16,30    c-2.209,0-4-1.791-4-4c0-1.48,0.805-2.773,2-3.465V4.005C14,2.897,14.896,2,16,2c1.111,0,2,0.897,2,2.005v18.53    c1.195,0.691,2,1.984,2,3.465C20,28.209,18.209,30,16,30z" fill="#FFFFFF"/><circle cx="16" cy="26" r="3" fill="#FFFFFF"/></g></g></svg><div class="current"></div></div></div>');

		this.$el.css({
     'opacity' : 0.4
    });


		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		var self = this;
		//console.log(data);
		if (command === 'TEMP_METER_CONNECTED') {

			if (!this.$el) {
				this.getDom();
			}
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
			this.$el.find('.current').html(self.lastdata.current +  " &deg;C");
		}
	}
});
