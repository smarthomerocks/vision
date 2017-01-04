(function() {

  function LightSwitch() {



    return {
      getStyle: function() {},
      getScripts: function() {},
      start: function() {
        this.name = "light-switch"; // TODO: Set with module loader
        this.getDom();
        this.setupSocket();
      },
      setupSocket: function() {
        var self = this;

        if (typeof this._socket === "undefined") {
          this._socket = this._socket = new NSRSocket(this.name);
        }

        this._socket.setNotificationCallback(function (notification, payload) {
          self.socketNotificationReceived(notification, payload);
        });
      },
      socketNotificationReceived: function (notification, payload) {
        var self = this;
		    console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
        self.onSocketUpdate.call(self, notification, payload);
	    },
      getDom: function() {
        var self = this;

        this.$el = $('<div class="box box-4 lights light-switch-off"><div class="heading">Fönster</div><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M0 0h24v24H0V0z" id="a"></path></defs><clipPath id="b"><use overflow="visible" xlink:href="#a"></use></clipPath><path clip-path="url(#b)" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path></svg></div>').css('cursor', 'pointer');

        this.$el.on('click', function() {
          self._socket.sendNotification('LIGHT_SWITCH_TOGGLE');
        });

        $('body').append(this.$el);

        return this.$el;
      },
      onSocketUpdate: function(command, data) {
        var self = this;
        if (command === 'connected') {
          this._socket.sendNotification('LIGHT_SWITCH_STATUS');
        } else if (command === 'LIGHT_SWITCH_STATUS') {
          this.$el.removeClass('light-switch-on light-switch-off');

          if (data.isStateOn) {
            this.$el.addClass('light-switch-on');
          } else {
            this.$el.addClass('light-switch-off');
          }
        }
      }
    };
  }

  new LightSwitch().start();
})();
