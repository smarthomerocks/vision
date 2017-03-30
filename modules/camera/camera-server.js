function Camera(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/camera');
		var colors = require('colors');

		nsp.on('connection', function(socket) {
			socketList.push(socket);

			console.log('Module ' + 'camera '.yellow.bold + 'connected');

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
				if (command === 'CAMERA_CONNECT') {
					connectPlugin(data.plugin);
				} else if (command === 'CAMERA_STATUS') {
		      Dashboard.camera.getStatus(data.plugin, data.id);
				} else if (command === 'CAMERA_SNAPSHOT'){
				  Dashboard.camera.getSnapshot(data.plugin, data.id);
				}else if (command === 'CAMERA_LIVEVIDEO'){
				  Dashboard.camera.getLiveliew(data.plugin, data.id);
				}
			}

		  function sendStatus(id, thumbnail, videothumbnail, lastUpdate, liveview, clip) {
		    socket.emit('CAMERA_STATUS', { id: id,clip: clip ,thumbnail: thumbnail, videothumbnail:videothumbnail, lastUpdate: lastUpdate, liveview: liveview});
		  }

		  function connectPlugin(plugin) {
		    Dashboard.camera.on(plugin, 'connect', function(data) {
					socket.emit('CAMERA_CONNECTED');
		    });

		    Dashboard.camera.on(plugin, 'change', function(data) {
		      sendStatus(data.id, data.thumbnail, data.videothumbnail, data.lastUpdate, data.liveview, data.clip);
		    });

		    Dashboard.camera.start(plugin);
		  }
		});
	}

	function exit() {
		console.log('Exit camera');
		socketlist.forEach(function(socket) {
			console.log('Closing camera socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('Module ' + 'camera '.yellow.bold + 'started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new Camera(Dashboard, app, io);
	}
};
