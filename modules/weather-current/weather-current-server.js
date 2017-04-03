function WeatherCurrent(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/weather-current');

		nsp.on('connection', function(socket) {
			socketList.push(socket);

      console.log('Module ' + 'Weather-current'.yellow.bold + ' connected');

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
				if (command === 'WEATHER_CURRENT_CONNECT') {
					connectPlugin(data.plugin);
				} else if (command === 'WEATHER_CURRENT_STATUS') {
		      Dashboard.weather.getCurrent(data.plugin, data.lat, data.lon);
				}
			}

		  function connectPlugin(plugin) {
		    Dashboard.weather.on(plugin, 'connect', function(data) {
					socket.emit('WEATHER_CURRENT_CONNECTED');
		    });

        Dashboard.weather.on(plugin, 'change', function(data) {
          socket.emit('WEATHER_CURRENT_STATUS', { lat: data.lat, lon: data.lon, currentWeather: data.currentWeather });
		    });

		    Dashboard.weather.start(plugin);
		  }

		});
	}

	function exit() {
		socketlist.forEach(function(socket) {
		  socket.close();
		});
	}

	connectSocket();

  console.log('Module ' + 'Weather-current'.yellow.bold + ' started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new WeatherCurrent(Dashboard, app, io);
	}
};
