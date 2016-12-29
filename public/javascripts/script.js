$(function() {
  var h = $("#h");
  var m = $("#m");
  var s = $("#s");
  function update_clock(){
  var date = new Date();
  var ho = date.getHours();
  if( ho > 12 ) ho=ho-12;
  h.css("transform","rotate("+(360/12)*ho+"deg)");
  m.css("transform","rotate("+(360/60)*date.getMinutes()+"deg)");
  s.css("transform","rotate("+(360/60)*date.getSeconds()+"deg)");
  }
  window.setInterval( update_clock, 1000);
  update_clock();
});

function initMap() {
    var myLatLng = new google.maps.LatLng(57.635146, 18.291594);
    var map = new google.maps.Map(document.getElementById("map"),
    {
        zoom: 11,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"all","stylers":[{"invert_lightness":true},{"saturation":10},{"lightness":30},{"gamma":0.5},{"hue":"#435158"}]}],
        styles2: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
    });

    CustomMarker.prototype = new google.maps.OverlayView();

    function CustomMarker(opts) {
        this.setValues(opts);
    }

    CustomMarker.prototype.draw = function() {
        var self = this;
        var div = this.div;
        if (!div) {
            div = this.div = $('' +
                '<div class="ripple-image">' +
                '<div class="pin-wrap"></div>' +
                '<div class="shadow"></div>' +
                '<div class="pin"></div>' +
                '<div class="ripple ripple-1"></div>' +
                '<div class="ripple ripple-2"></div>' +
                '<div class="ripple ripple-3"></div>' +
                '</div>' +
                '')[0];
            this.pinWrap = this.div.getElementsByClassName('pin-wrap');
            this.pin = this.div.getElementsByClassName('pin');
            this.pinShadow = this.div.getElementsByClassName('shadow');
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

    var marker = new CustomMarker({
        position: myLatLng,
        map: map,
    });
}
