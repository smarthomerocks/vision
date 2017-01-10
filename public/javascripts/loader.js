var Loader = (function() {

	/* Create helper valiables */

	var loadedModuleFiles = [];
	var loadedFiles = [];
	var moduleObjects = [];

	/* Private Methods */

	/* loadModules()
	 * Loops thru all modules and requests load for every module.
	 */
	var loadModules = function() {

		var moduleData = getModuleData();

		var loadNextModule = function() {
			if (moduleData.length > 0) {
				var nextModule = moduleData[0];
				loadModule(nextModule, function() {
					moduleData = moduleData.slice(1);
					loadNextModule();
				});
			} else {
        startModules();
			}
		};

		loadNextModule();
	};

	/* startModules()
	 * Loops thru all modules and requests start for every module.
	 */
	var startModules = function() {
		for (var m in moduleObjects) {
			var module = moduleObjects[m];
			module.start();
		}

		// Notifiy core of loded modules.
		NSR.modulesStarted(moduleObjects);
	};

	/* getAllModules()
	 * Retrieve list of all modules.
	 *
	 * return array - module data as configured in config
	 */
	var getAllModules = function() {
		return config.modules;
	};

	/* getModuleData()
	 * Generate array with module information including module paths.
	 *
	 * return array - Module information.
	 */
	var getModuleData = function() {
		var modules = getAllModules();
		var moduleFiles = [];

		for (var m in modules) {
			var moduleData = modules[m];
			var module = moduleData.module;

			var elements = module.split("/");
			var moduleName = elements[elements.length - 1];
			var moduleFolder =  config.paths.modules + "/" + module;

			if (moduleData.disabled === true) {
				continue;
			}

			moduleFiles.push({
				index: m,
				identifier: "module_" + m + "_" + module,
				name: moduleName,
				path: moduleFolder ,
				file: moduleName + ".js",
				config: moduleData.config,
				classes: (typeof moduleData.classes !== "undefined") ? moduleData.classes + " " + module : module
			});

		}

		return moduleFiles;
	};

	/* loadModule(module)
	 * Load modules via ajax request and create module objects.
	 *
	 * argument callback function - Function called when done.
	 * argument module object - Information about the module we want to load.
	 */
	var loadModule = function(module, callback) {
		var url = module.path + "/" + module.file;

		var afterLoad = function() {
			var moduleObject = Module.create(module.name);
			if (moduleObject) {
				bootstrapModule(module, moduleObject, function() {
					callback();
				});
			} else {
				callback();
			}
		};

		if (loadedModuleFiles.indexOf(url) !== -1) {
			afterLoad();
		} else {
			loadFile(url, function() {
				loadedModuleFiles.push(url);
				afterLoad();
			});
		}

	};

	/* bootstrapModule(module, mObj)
	 * Bootstrap modules by setting the module data and loading the scripts & styles.
	 *
	 * argument module object - Information about the module we want to load.
	 * argument mObj object - Modules instance.
	 * argument callback function - Function called when done.
	 */
	var bootstrapModule = function(module, mObj, callback) {
		console.log("Bootstrapping module: " + module.name);

		mObj.setData(module);

		mObj.loadScripts(function() {
			console.log("Scripts loaded for: " + module.name);
			mObj.loadStyles(function() {
				console.log("Styles loaded for: " + module.name);
				moduleObjects.push(mObj);
				callback();
			});
		});

	};

	/* loadFile(fileName)
	 * Load a script or stylesheet by adding it to the dom.
	 *
	 * argument fileName string - Path of the file we want to load.
	 * argument callback function - Function called when done.
	 */
	var loadFile = function(fileName, callback) {
		console.log(fileName);
		var extension =  fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);

		switch (extension.toLowerCase()) {
		case "js":
			console.log("Load script: " + fileName);
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = fileName;
			script.onload = function() {
				if (typeof callback === "function") {callback();}
			};
			document.getElementsByTagName("body")[0].appendChild(script);
			break;
		case "css":
			console.log("Load stylesheet: " + fileName);
			var stylesheet = document.createElement("link");
			stylesheet.rel = "stylesheet";
			stylesheet.type = "text/css";
			stylesheet.href = fileName;
			stylesheet.onload = function() {
				if (typeof callback === "function") {callback();}
			};
			document.getElementsByTagName("head")[0].appendChild(stylesheet);
			break;
		}

	};

	/* Public Methods */
	return {

		/* loadModules()
		 * Load all modules as defined in the config.
		 */
		loadModules: function() {
			loadModules();
		},

		/* loadFile()
		 * Load a file (script or stylesheet).
		 * Prevent double loading and search for files in the vendor folder.
		 *
		 * argument fileName string - Path of the file we want to load.
		 * argument module Module Object - the module that calls the loadFile function.
		 * argument callback function - Function called when done.
		 */
		loadFile: function(fileName, module, callback) {

			if (loadedFiles.indexOf(fileName.toLowerCase()) !== -1) {
				console.log("File already loaded: " + fileName);
				callback();
				return;
			}

			if (fileName.indexOf("http://") === 0 || fileName.indexOf("https://") === 0 || fileName.indexOf("/") !== -1) {
				// This is an absolute or relative path.
				// Load it and then return.
				loadedFiles.push(fileName.toLowerCase());
				loadFile(fileName, callback);
				return;
			}

			if (vendor[fileName] !== undefined) {
				// This file is available in the vendor folder.
				// Load it from this vendor folder.
				loadedFiles.push(fileName.toLowerCase());
				loadFile(config.paths.vendor + "/" + vendor[fileName], callback);
				return;
			}

			// File not loaded yet.
			// Load it based on the module path.
			loadedFiles.push(fileName.toLowerCase());
			loadFile(module.file(fileName), callback);
		}
	};

})();
