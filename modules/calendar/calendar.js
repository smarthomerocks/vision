Module.register("calendar",{

	defaults: {
		title: "Kalender",
		plugin: "google-calendar",
		numberOfEvents: 10,
    calendarId: 'primary'
	},

	getStyles: function() {
		return ['calendar.css'];
	},

	start: function() {
		console.log('Starting calendar ' + this.config.title);

		this.isStateOn = false;

		this.sendSocketNotification('CALENDAR_CONNECT', { calendarId: this.config.calendarId, plugin: this.config.plugin });
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box calendar"><div class="box-content"><div class="heading">'+ this.config.title +'</div><div class="calendar-events"></div></div></div>');

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
    function getTime(dateTime) {
      var date = new Date(dateTime),
          hours = String(date.getHours()),
          minutes = String(date.getMinutes());

      return (hours.length < 2 ? '0' : '') + hours + ':' + (minutes.length < 2 ? '0' : '') + minutes;
    }

		if (command === 'CALENDAR_CONNECTED') {
      this.$el.css({
        'opacity' : 1
      });

      this.sendSocketNotification('CALENDAR_EVENTS', { calendarId: this.config.calendarId, numberOfEvents: this.config.numberOfEvents, plugin: this.config.plugin });

		} else if (command === 'CALENDAR_EVENTS') {
      var eventsEl = this.$el.find('.calendar-events').html(''),
          hasTomorrowTitle = false;

      for (var i = 0, length = data.events.length; i < length; i++) {
        var event = data.events[i],
            startDate = new Date(event.start),
            tomorrow = new Date();

        tomorrow.setDate(tomorrow.getDate() + 1);

        if (startDate.toDateString() === new Date().toDateString() || startDate.toDateString() === tomorrow.toDateString()) {
          if (!hasTomorrowTitle && startDate.toDateString() !== new Date().toDateString()) {
            eventsEl.append('<div class="heading tomorrow">' + startDate.getDate() + '/' + (startDate.getMonth() + 1) + '</div>');
            hasTomorrowTitle = true;
          }

          eventsEl.append('<div class="event"><div class="time">' + (event.isAllDay ? 'Heldag' : getTime(event.start)) + '</div><div class="description">' + event.description + '</div></div>');
        }
      }
    }
	}
});
