var config = {
    paths: {
        modules : ""
    },
	modules: [
		{
			module: 'light-switch',
            config: {
                parameter: "value"
            }
		}
    ]
};

if (typeof module !== 'undefined') {module.exports = config;}