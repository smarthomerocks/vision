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

    navigator.getUserMedia(
    {
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        }
    }, $.proxy(this.gotStream, this), function(e) {});

		this.sendSocketNotification('ANNOUNCE_CONNECT');
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box announce"><div class="box-content"><div class="heading">'+ this.config.title +'</div><div class="announce-content"><svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/><path d="M0 0h24v24H0z" fill="none"/></svg><div class="announce-animation"></div></div></div></div>');

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
		var self = this;

		window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var audioContext = new AudioContext(),
				inputPoint = audioContext.createGain(),
				audioInput = audioContext.createMediaStreamSource(stream);

		audioInput.connect(inputPoint);

		this.audioRecorder = new Recorder(inputPoint);

		// Create analyzer for the animation

		var analyser = audioContext.createAnalyser();
		analyser.connect(audioContext.destination);
		analyser.fftSize = 2048;

		var bufferLength = analyser.frequencyBinCount;

		function getAverageVolume(data) {
			var values = 0;
			var length = data.length;
			for (var i = 0; i < data.length; i++) {
				values += data[i];
			}
			return values / data.length;
		}

		audioInput.connect(analyser);

		var processor = audioContext.createScriptProcessor(2048, 1, 1);
		processor.connect(audioContext.destination);

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

});
