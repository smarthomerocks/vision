var NSR = (function() {
  var modules = [];
  var sectionGridsters = {};
  var isTouchSupported = "ontouchend" in document;
  var clickEvent = isTouchSupported ? 'touchend' : 'mouseup';

  var renderSections = function() {
    let navList = $('.js-nav-left-list'),
        main = $('.js-main'),
        menuWidth = $('.js-nav-left').outerWidth(),
        contentWidth = $(window).width() - menuWidth,
        isMobile = $(window).width() < 480;

    for (let section of config.sections) {

      let navSectionEl = $('<li class="nav-left-item js-nav-left-item" data-section="' + section.section + '"><i class="material-icons md-36">' + section.icon + '</i>' + section.title + '</li>');

      navList.append(navSectionEl);

      let sectionEl = $('<section class="section section-' + section.section +'" />');

      main.append(sectionEl);

      let baseDimensions = section.base_dimensions,
          margins = section.margins,
          maxCols;

      if (isMobile) {
        margins = [5, 5];

        let baseWidth = baseDimensions[0],
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
		for (let m in moduleObjects) {
			let module = moduleObjects[m];
			modules[module.data.index] = module;
    }
    
    renderModules();
    }

  var renderModules = function() {
    for (let module of modules) {
      sectionGridsters[module.config.section].add_widget(module.getDom(), module.config.size_x || 1, module.config.size_y || 1, module.config.column || 1, module.config.row || 1);
    }
  }

  var initNavigation = function() {
    let sections = $('.section'),
    navList = $('.js-nav-left-list'),
    navName = location.hash ? location.hash.replace('#', '') : navList.children().first().data('section'); // show the section that are used in the URL, if no section specified then take the first one in the list.

    sections.hide();
    selectSection(navName);

    $('.js-nav-left').on(clickEvent, '.js-nav-left-item', function() {
      selectSection($(this).data('section'));
    });
  }

  function selectSection(name) {
    let sections = $('.section'),
    navItems = $('.js-nav-left-item'),
    sectionEl = $('.section-' + name);

    location.hash = name;

    sections.fadeOut(300);
    sectionEl.fadeIn(200);

    navItems.removeClass('active');
    navItems.filter("[data-section='" + name + "']").addClass('active');
  }

  var setTheme = function() {
    $('html').addClass(config.theme ? 'theme-' + config.theme : 'theme-default');
  }

  return {
    renderSections: renderSections,
    modulesStarted: modulesStarted,
    initNavigation: initNavigation,
    setTheme: setTheme,
    isTouchSupported: isTouchSupported,
    clickEvent: clickEvent
  }
})();
