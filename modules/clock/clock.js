/*global Module*/
Module.register('clock', {

  getStyles: function() {
    return ['clock.css'];
  },

  start: function() {
    var self = this;

    function update_clock() {
      if (!self.$el) {
        return;
      }

      var date = new Date();

      self.$el.find('.heading').text(date.toLocaleDateString());
      self.$el.find('.time').text(date.toLocaleTimeString());
    }

    window.setInterval(update_clock, 1000);
    update_clock();
  },

  getDom: function() {
    var date = new Date();

    this.$el = $('<div class="box clock"><div class="box-content"><div class="heading">'+date.toLocaleDateString()+'</div><div class="time">'+date.toLocaleTimeString()+'</div></div></div>');

    return this.$el;
  }

});
