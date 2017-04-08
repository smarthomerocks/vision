Module.register("calendar",{

	defaults: {
		title: "Kalender",
		plugin: "iCal",
		url: null,
		fetchInterval: 5 * 60 * 1000, // Update every 5 minutes.
		maximumEntries: 10,
		maximumNumberOfDays: 365,
		user: null,
		pass: null
	},

	getStyles: function() {
		return ['calendar.css'];
	},

	start: function() {
		console.log('Starting calendar ' + this.config.title);

		this.isStateOn = false;

		this.sendSocketNotification('CALENDAR_CONNECT', { plugin: this.config.plugin });
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

      this.sendSocketNotification('CALENDAR_EVENTS', { plugin: this.config.plugin, url: this.config.url, fetchInterval: this.config.fetchInterval, maximumEntries: this.config.maximumEntries, maximumNumberOfDays: this.config.maximumNumberOfDays, user: this.config.user, pass: this.config.pass });

		} else if (command === 'CALENDAR_EVENTS') {
      var eventsEl = this.$el.find('.calendar-events').html(''),
          lastDate = data.events.length > 0 ? new Date(new Date().setDate(new Date().getDate()-1)) : null;

      for (var i = 0, length = data.events.length; i < length; i++) {
        var event = data.events[i],
						currentDate = new Date(parseInt(event.startDate)),
						momentDate = new moment(currentDate);

        if (lastDate.toDateString() !== currentDate.toDateString()) {
          eventsEl.append('<div class="heading tomorrow">' + momentDate.calendar(new Date(),{        
						sameDay: '[Idag]',
        		nextDay: '[Imorgon]',
        		lastDay: '[Igår]',
        		nextWeek: '[På] dddd',
        		sameElse: 'dddd do MMM'})+ '</div>');
          lastDate = currentDate;
        }

        eventsEl.append('<div class="event"><div class="time">' + (event.fullDayEvent ? 'Heldag' : getTime(parseInt(event.startDate))) + '</div><div class="description">' + event.title + '</div></div>');
      }
    }
	}
});
