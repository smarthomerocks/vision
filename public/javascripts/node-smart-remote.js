var NSR = (function() {
  var modules = [];
  var sectionGridsters = {};

  var renderSections = function() {
    var navList = $('.js-nav-left-list'),
        main = $('.js-main'),
        menuWidth = $('.js-nav-left').outerWidth(),
        contentWidth = $(window).width() - menuWidth,
        isMobile = $(window).width() < 480;

    for (var i = 0, sectionLength = config.sections.length; i < sectionLength; i++) {
      var section = config.sections[i];

      var navSectionEl = $('<li class="nav-left-item js-nav-left-item" data-section="' + section.section + '"><i class="material-icons md-36">' + section.icon + '</i>' + section.title + '</li>');

      navList.append(navSectionEl);

      var sectionEl = $('<section class="section section-' + section.section +'" />');

      main.append(sectionEl);

      var baseDimensions = section.base_dimensions,
          margins = section.margins,
          maxCols;

      if (isMobile) {
        margins = [5, 5];

        var baseWidth = baseDimensions[0],
            marginHorizontal = margins[0];

        // One or two columns. Could be done better..
        if (baseWidth > contentWidth) {
          baseDimensions = [contentWidth - marginHorizontal * 2, baseDimensions[1]];
          maxCols = 1;
        } else {
          baseDimensions = [(contentWidth - marginHorizontal * 3) / 2, baseDimensions[1]];
          maxCols = 2;
        }
      }

      sectionGridsters[section.section] = sectionEl.gridster({
        namespace: '.section-' + section.section,
        widget_selector: '.box',
        max_cols: maxCols,
        widget_margins: margins,
        widget_base_dimensions: baseDimensions,
        show_element: function($el, callback) { $el.show(); if (callback) { callback(); } },
        hide_element: function($el, callback) { $el.hide(); if (callback) { callback(); } },
        shift_widgets_up: false,
        shift_larger_widgets_down: false,
      }).data('gridster').disable(); // Disable drag-and-drop
    }
  }

  var modulesStarted = function(moduleObjects) {
		modules = [];
		for (var m in moduleObjects) {
			var module = moduleObjects[m];
			modules[module.data.index] = module;
		}

		renderModules();
	}

  var renderModules = function() {
    for (var i = 0, length = modules.length; i < length; i++) {
      var module = modules[i],
          moduleEl = module.getDom();

      sectionGridsters[module.config.section].add_widget(moduleEl, module.config.size_x || 1, module.config.size_y || 1, module.config.column || 1, module.config.row || 1);
    }
  }

  var initNavigation = function() {
    var sections = $('.section'),
        navItems = $('.js-nav-left-item');

    sections.hide().first().show();
    navItems.first().addClass('active');

    $('.js-nav-left').on('click', '.js-nav-left-item', function() {
      var section = $(this).data('section'),
          sectionEl = $('.section-' + section);

      // TODO: Add some FANCY animation
      sections.hide(200);
      sectionEl.show(300);

      navItems.removeClass('active');
      $(this).addClass('active');
    });
  }

  var setTheme = function() {
    $('html').addClass(config.theme ? 'theme-' + config.theme : 'theme-default');
  }

  return {
    renderSections: renderSections,
    modulesStarted: modulesStarted,
    initNavigation: initNavigation,
    setTheme: setTheme
  }
})();
