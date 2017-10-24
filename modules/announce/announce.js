Module.register("announce",{

	defaults: {
		title: "Utrop"
	},

  getStyles: function() {
		return ['announce.css'];
	},

  getScripts: function() {
		return ['recorder.js', 'siriwave.js'];
	},

	start: function() {
    var self = this;

		console.log('Starting announce ' + this.config.title);

    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (!navigator.getUserMedia)
        return;

		window.AudioContext = window.AudioContext || window.webkitAudioContext;

    navigator.getUserMedia({"audio": true}, $.proxy(this.gotStream, this), function(e) {});

		this.sendSocketNotification('ANNOUNCE_CONNECT');
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box announce"><div class="box-content"><div class="heading">'+ this.config.title +'</div><div class="announce-content"><i class="material-icons md-64">mic</i><div class="announce-animation"></div></div></div></div>');

    this.$el.on('mousedown touchstart', $.proxy(this.startRecording, this));
    this.$el.on('mouseup touchend', $.proxy(this.stopRecording, this));

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		if (command === 'ANNOUNCE_CONNECTED') {
			// Connected to plugin, get status
			this.initAnimation();

      this.$el.css({
				'opacity' : 1
			});
		} else if (command === 'ANNOUNCE_STATUS' && data.id === this.config.id) {

		}
	},

  saveAudio: function() {
    this.audioRecorder.exportWAV( $.proxy(this.uploadAudio, this) );
  },

  uploadAudio: function(blob) {
    console.log('Uploading audio');
		this.sendSocketNotification('ANNOUNCE_SEND', {path: this.config.path, url: this.config.url, room: this.config.room, volume: this.config.volume, audio: blob});
  },

  startRecording: function() {
    if (!this.audioRecorder)
        return;
    console.log('Recording audio');
		if (this.animation) {
			clearTimeout(this.animationIndex);
			if (!this.animation.run) {
				this.animation.start();
			}
    	this.$el.addClass("recording");
		}
    this.audioRecorder.clear();
    this.audioRecorder.record();
  },

  stopRecording: function() {
		var self = this;
    this.audioRecorder.stop();
    console.log('Recording audio: done!');
		if (this.animation) {
    	this.$el.removeClass("recording");
			this.animationIndex = setTimeout(function() {
				self.animation.stop();
			}, 500);
		}
    this.saveAudio();
  },

  gotStream: function(stream) {
		var self = this,
				audioContext = new AudioContext();
				inputPoint = audioContext.createGain(),
				audioInput = audioContext.createMediaStreamSource(stream),
				analyser = audioContext.createAnalyser(),
				processor = audioContext.createScriptProcessor(2048, 1, 1);

		analyser.fftSize = 2048;

		function getAverageVolume(data) {
			var values = 0;
			var length = data.length;
			for (var i = 0; i < data.length; i++) {
				values += data[i];
			}
			return values / data.length;
		};

		audioInput.connect(analyser);
		analyser.connect(inputPoint);
		processor.connect(audioContext.destination);

		this.audioRecorder = new Recorder(inputPoint);

		processor.onaudioprocess = function() {
			var array =  new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var average = getAverageVolume(array);

			if (self.animation && self.animation.run) {
				self.animation.setAmplitude(average / 8);
			}
		};
  },

	initAnimation: function() {
		if (this.$el.find('.announce-animation').is(':empty')) {
			this.animation = new SiriWave({
		    container: this.$el.find('.announce-animation')[0],
		    width: 160,
		    height: 120,
				style: 'ios9',
				speed: 0.1,
				amplitude: 0,
				speedInterpolationSpeed: 0
			});
		}
	}

});
