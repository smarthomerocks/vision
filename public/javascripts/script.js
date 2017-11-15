NSR.setTheme();
NSR.renderSections();
NSR.initNavigation();
Loader.loadModules();

moment.locale("sv")

FastClick.attach(document.body);

if ($(window).width() > 480) {
  // Disable scroll on the page, add more exceptions here that should be scrollable
  $(document).on('touchmove', function(e) {
    if (e.target.nodeName !== 'INPUT') {
      e.preventDefault();
    }
  });
}

// Add click effect on modules that are clickable
$(document).on(NSR.clickEvent, '.box-clickable', function(e) {
  var target = $(this);

  target.addClass('box-clickable-active');

  setTimeout(function() {
    target.removeClass('box-clickable-active');
  }, 20);
});
