Module.register("map",{

	defaults: {
		plugin: "owntracks",
		styles: [{"featureType":"all","elementType":"all","stylers":[{"invert_lightness":true},{"saturation":10},{"lightness":30},{"gamma":0.5},{"hue":"#435158"}]}]
	},

	getScripts: function() {
		return ['google-maps.js'];
	},

	getStyles: function() {
		return ['map.css'];
	},

	start: function() {
		var self = this;

		console.log('Starting map ' + this.config.title);

		$.getScript('https://maps.google.com/maps/api/js?key=' + this.config.apiKey, function() {
			self.sendSocketNotification('MAP_CONNECT', { plugin: self.config.plugin });
		});
	},

	getDom: function() {
		var self = this;

		this.$el = $('<div class="box box-4 map"><div class="js-map-container map-container"></div></div>');

		this.$el.css({
     'opacity' : 0.4
    });

		return this.$el;
	},

	socketNotificationReceived: function(command, data) {
		if (command === 'MAP_CONNECTED') {
			// Connected to plugin, get status
			this.map = this.initMap();
		} else if (command === 'MAP_STATUS') {
			this.$el.css({
				'opacity' : 1
			});

			this.updateDom(data);
		}
	},

	updateDom: function(data) {
		this.markers = this.markers || {};

		if (this.markers.hasOwnProperty(data.id)) {
			this.markers[data.id].setMap(null);
		}

		this.markers[data.id] = this.createMarker(data.id, data.lat, data.lon);

		this.setCenterPoint();
	},

	setCenterPoint: function() {
		var bound = new google.maps.LatLngBounds(),
				marker;

		for (markerId in this.markers) {
			if (this.markers.hasOwnProperty(markerId)) {
				marker = this.markers[markerId];
		  	bound.extend( new google.maps.LatLng(marker.position.lat(), marker.position.lng()) );
			}
		}

		this.map.setCenter(bound.getCenter());
	},

	initMap: function() {
		var map = new google.maps.Map(this.$el.find('.js-map-container')[0], {
        zoom: 11,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: this.config.styles
    });

		google.maps.event.addDomListener(window, "resize", function() {
		   var center = map.getCenter();
		   google.maps.event.trigger(map, "resize");
		   map.setCenter(center); // TODO Center map based on markers
		});

		return map;
	},

	createMarker: function(markerId, lat, lon) {
		if (!this.config.markers[markerId]) {
			return;
		}

		var marker = this.config.markers[markerId],
				title = marker.title,
				color = marker.color,
				map = this.map;

		function RippleMarker(opts) {
        this.setValues(opts);
    }

    RippleMarker.prototype = new google.maps.OverlayView();

		RippleMarker.prototype.onRemove = function() {
			if (this.div) {
				this.div.parentNode.removeChild(this.div);
			}
		};

    RippleMarker.prototype.draw = function() {
        var self = this;
        var div = this.div;
        if (!div) {
            div = this.div = $('' +
                '<div class="ripple-image" style="background: rgba(' + color + ', .8);">' +
                '<div class="ripple ripple-1" style="border-color: rgba(' + color +', 1);"></div>' +
                '<div class="ripple ripple-2" style="border-color: rgba(' + color +', 1);"></div>' +
                '<div class="ripple ripple-3" style="border-color: rgba(' + color +', 1);"></div>' +
								'<div class="ripple-title">' + title + '</div>' +
                '</div>' +
                '')[0];
            div.style.position = 'absolute';
            div.style.cursor = 'pointer';
            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);
            google.maps.event.addDomListener(div, "click", function(event) {
                google.maps.event.trigger(self, "click", event);
            });
        }
        var point = this.getProjection().fromLatLngToDivPixel(this.position);
        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };

    return new RippleMarker({
        position: new google.maps.LatLng(lat, lon),
        map: map,
    });
	}
});
