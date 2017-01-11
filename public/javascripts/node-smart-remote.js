var NSR = (function() {
  var modules = [];

  var renderSections = function() {
    var navList = $('.js-nav-left-list'),
        main = $('.js-main');

    for (var i = 0, sectionLength = config.sections.length; i < sectionLength; i++) {
      var section = config.sections[i];

      var navSectionEl = $('<li class="nav-left-item js-nav-left-item" data-section="' + section.section + '">' + section.icon + section.title + '</li>');

      navList.append(navSectionEl);

      var sectionEl = $('<section class="section section-' + section.section + ' section-columns-' + section.columns + '" />');

      for (var j = 0, columnLength = section.columns; j < columnLength; j++) {
        var columnId = j + 1,
            columnEl = $('<div />').addClass('section-column section-column-' + columnId + '');

        sectionEl.append(columnEl);
      }

      main.append(sectionEl);
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
          moduleEl = module.getDom(),
          columnEl = $('.section-' + module.config.section + ' .section-column-' + module.config.column);

      columnEl.append(moduleEl);
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

      // TODO: Add some fancy animation
      sections.hide();
      sectionEl.show();

      navItems.removeClass('active');
      $(this).addClass('active');
    });
  }

  return {
    renderSections: renderSections,
    modulesStarted: modulesStarted,
    initNavigation: initNavigation
  }
})();
