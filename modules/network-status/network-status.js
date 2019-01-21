/*global Module winston*/
Module.register('network-status', {

  defaults: {
    id: 'internet',
    title: 'internet',
    type: 'http',
    target: 'https://www.google.se/',
    interval: 5000,
    timeout: 2000,
    okText: 'OK',
    errorText: 'Not available',
    size_x: 1,
    size_y: 1
  },

  getStyles: function() {
    return ['network-status.css'];
  },

  start: function() {
    winston.info('Starting network-status ' + this.config.title);

    this.sendSocketNotification('NETWORK-STATUS_CONNECT', this.config);
  },

  getDom: function() {

    this.$el = $(`<div class="box network-status ${this.available ? 'available' : 'not-available'}">
                    <div class="box-content">
                      <div class="heading">${this.config.title}</div>
                      <p class="statusText">${this.available ? this.config.okText : this.config.errorText}</p>
                      <p class="statusSince">${this.available ? '' : new Date(this.since).toLocaleTimeString()}</p>
                    </div>
                  </div>`);

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  socketNotificationReceived: function(command, data) {
    if (command === 'NETWORK-STATUS_CONNECTED') {
      this.$el.css({
        'opacity' : 1
      });
    } else if (command === 'NETWORK-STATUS_STATUS' && data.id === this.config.id) {

      this.since = data.since;
      this.available = data.available;

      this.updateDom();
    }
  },

  updateDom: function() {
    if (this.$el) {
      this.$el.removeClass('available not-available');

      this.available ? this.$el.addClass('available') : this.$el.addClass('not-available');
      this.$el.find('.statusText').text(this.available ? this.config.okText : this.config.errorText);
      this.$el.find('.statusSince').text(this.available ? '' : new Date(this.since).toLocaleTimeString());
    }
  }
});
