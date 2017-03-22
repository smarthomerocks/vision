$(function() {

  NSR.renderSections();
  NSR.initNavigation();
  Loader.loadModules();

  moment.lang("se")

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
