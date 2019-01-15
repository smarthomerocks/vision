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
      icon: 'home',
      modules: [
        {
          module: 'clock',
          config: {
            column: 1,
            row: 1
          }
        }
      ]
    }
  ],
  plugins: {

  }  
};

if (typeof module !== 'undefined') {module.exports = config;}
