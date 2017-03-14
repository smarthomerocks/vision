$(function() {
  NSR.renderSections();
  NSR.initNavigation();
  Loader.loadModules();

  FastClick.attach(document.body);

  // Disable scroll on the page, add more exceptions here that should be scrollable
  $(document).on('touchmove', function(e) {
    if (e.target.nodeName !== 'INPUT') {
      e.preventDefault();
    }
  });

  // Add click effect on modules that are clickable
  $(document).on('click', '.box-clickable', function(e) {
    var target = $(this);

    target.addClass('box-clickable-active');

    setTimeout(function() {
      target.removeClass('box-clickable-active');
    }, 20);
  });
});

// TODO: Move to a clock module
function initClock() {
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
}
