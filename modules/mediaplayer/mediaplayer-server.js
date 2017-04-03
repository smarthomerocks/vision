function Mediaplayer(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/mediaplayer');
		var colors = require('colors');

		nsp.on('connection', function(socket) {
			socketList.push(socket);

			console.log('Module ' + 'mediaplayer '.yellow.bold + 'connected');

			var colors = require('colors');

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
				if (command === 'MEDIAPLAYER_CONNECT') {
					connectPlugin(data.plugin);
				} else if (command === 'MEDIAPLAYER_STATUS') {
		      Dashboard.mediaplayer.getStatus(data.plugin, data.device);
				} else if (command === 'MEDIAPLAYER_PLAYSTATE_CHANGE') {
		      Dashboard.mediaplayer.changePlayState(data.plugin, data.device, data.playbackState);
				} else if (command === 'MEDIAPLAYER_VOLUME_CHANGE') {
		      Dashboard.mediaplayer.changeVolume(data.plugin, data.device, data.volume);
				}else if (command === 'MEDIAPLAYER_PLAYSTATE_PREV') {
		      Dashboard.mediaplayer.prev(data.plugin, data.device);
				}else if (command === 'MEDIAPLAYER_PLAYSTATE_NEXT') {
		      Dashboard.mediaplayer.next(data.plugin, data.device);
				} else if (command == 'MEDIAPLAYER_TRACK_SEEK'){
  				Dashboard.mediaplayer.trackSeek(data.plugin, data.device, data.duration);
				}
			}

			function sendStatus(device, data) {
		    socket.emit('MEDIAPLAYER_STATUS', { device: device, data:data });
		  }

		  function connectPlugin(plugin) {
		    Dashboard.mediaplayer.on(plugin, 'connect', function(data) {
					socket.emit('MEDIAPLAYER_CONNECTED');
		    });
		   
		    Dashboard.mediaplayer.on(plugin, 'change', function(data) {
					sendStatus(data.device, data);
				});

		    Dashboard.mediaplayer.start(plugin);
		  }

		});
	}

	function exit() {
		console.log('Exit sonos');
		socketlist.forEach(function(socket) {
			console.log('Closing mediaplayer socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('Module ' + 'mediaplayer '.yellow.bold + 'started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new Mediaplayer(Dashboard, app, io);
	}
};
