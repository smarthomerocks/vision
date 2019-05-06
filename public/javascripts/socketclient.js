var NSRSocket = function(moduleName) {

	var self = this;

	if (typeof moduleName !== "string") {
		throw new Error("Please set the module name for the MMSocket.");
	}

	self.moduleName = moduleName;

	// Private Methods
	self.socket = io("/" + self.moduleName, {});
	var notificationCallback = function() {};

	var onevent = self.socket.onevent;
	self.socket.onevent = function(packet) {
		var args = packet.data || [];
		onevent.call(this, packet);    // original call
		packet.data = ["*"].concat(args);
		onevent.call(this, packet);      // additional call to catch-all
	};

	self.socket.on('error', function (err) {
		winston.error("SOCKET ERROR", err);
		setTimeout(function() {
			window.location.reload();
		}, 1000);		
	});

	self.socket.on('connect_error', function(err){
		winston.error('Connection Failed', err);
		setTimeout(function() {
			window.location.reload();
		}, 1000);
	});

	// register catch all.
	self.socket.on("*", function(notification, payload) {
		if (notification !== "*") {
			notificationCallback(notification, payload);
		}
	});

	// Public Methods
	this.setNotificationCallback = function(callback) {
		notificationCallback = callback;
	};

	this.sendNotification = function(notification, payload) {
		if (typeof payload === "undefined") {
			payload = {};
		}
		self.socket.emit(notification, payload);
	};
};
