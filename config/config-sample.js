var config = {
  ssl: false,
  theme: 'default',
  paths: {
    modules: '/modules'
  },
  sections: [
    {
      section: 'start',
      title: 'Start',
      margins: [10, 10],
      base_dimensions: [180, 140],
      icon: 'home'
    }
  ],
  plugins: {

  },
  modules: [
    {
      module: 'clock',
      config: {
        section: 'start',
        column: 1,
        row: 1
      }
    }
  ]
};

if (typeof module !== 'undefined') {module.exports = config;}
