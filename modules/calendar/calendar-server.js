function Calendar(Dashboard, app, io) {
	var socketList = [];
	var colors = require('colors');

	function connectSocket() {
		var nsp = io.of('/calendar');

		nsp.on('connection', function(socket) {
			socketList.push(socket);

			console.log('Module ' + 'calendar '.yellow.bold + 'connected');

			var onevent = socket.onevent;
			socket.onevent = function (packet) {
			    var args = packet.data || [];
			    onevent.call(this, packet);    	// original call
			    packet.data = ["*"].concat(args);
			    onevent.call(this, packet);     // additional call to catch-all
			};

			socket.on('*', function(command, data) {
				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');

			function onSocketUpdate(command, data) {
				if (command === 'CALENDAR_CONNECT') {
					connectPlugin(data.plugin);
				} else if (command === 'CALENDAR_EVENTS') {
		      Dashboard.calendar.getEvents(data.plugin, data.url, data.fetchInterval, data.maximumEntries, data.maximumNumberOfDays, data.user, data.pass);
				}
			}

		  function connectPlugin(plugin) {
		    Dashboard.calendar.on(plugin, 'connect', function(data) {
					socket.emit('CALENDAR_CONNECTED');
		    });

        Dashboard.calendar.on(plugin, 'change', function(data) {
          socket.emit('CALENDAR_EVENTS', { url: data.url, events: data.events });
		    });

		    Dashboard.calendar.start(plugin);
		  }

		});
	}

	function exit() {
		socketlist.forEach(function(socket) {
		  socket.close();
		});
	}

	connectSocket();

	console.log('Module ' + 'calendar '.yellow.bold + 'started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new Calendar(Dashboard, app, io);
	}
};
