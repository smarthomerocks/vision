/*global Module winston*/
Module.register('liam-mower', {

  defaults: {
    title: 'Liam',
    plugin: 'mqtt',
    size_x: 4,
    size_y: 4
  },

  getStyles: function() {
    return ['liam-mower.css'];
  },

  start: function() {
    winston.info('Starting liam-mower ' + this.config.title);

    this.sendSocketNotification('LIAM_CONNECT', {id: this.config.id, plugin: this.config.plugin});
  },

  getDom: function() {

    this.$el = $(`
      <div class="box liam-esp">
        <div class="box-content">
          <div class="heading">${this.config.title}</div>

          <section class="section js-section js-section-start">
            <div class="state-control">
                <div class="state pulsate js-state font-heavy">...</div>
                <div class="buttons center">
                  <span class="js-launching button" disabled>Start mowing</span>
                  <span class="js-docking button" disabled>Go to dock</span>
                  <span class="js-mowing button" disabled>Continue mowing</span>
                  <span class="js-stop button" disabled>Emergency stop</span>
                </div>
            </div>
            <div>
              <canvas class="center model3D js-model3D"></canvas>
            </div>
            <div>
              <div style="display: -webkit-flex;display: flex" class="battery center">
                <i class="fas fa-plug fa-2x charging js-charging" style="visibility: hidden"></i>
                <svg class="js-battery" viewBox="0 0 1200 500" preserveAspectRatio="xMaxYMax meet">
                    <g transform="translate(200)">
                      <path class="outline" d="m -136.9163,50.635005 c -42.68166,1.67 -58.75641,8.8 -71.91854,32.11 -4.96498,9.04 -5.55488,19.029995 -5.55488,167.689995 0,148.43 0.5899,158.66 5.55488,167.7 6.42745,11.65 18.42206,21.64 33.03435,27.59 10.51987,4.28 25.42712,4.52 511.86041,4.52 h 500.75064 l 15.79209,-7.85 c 18.40978,-9.04 32.1618,-26.88 32.1618,-42.34 v -9.28 h 24.2596 c 38.88419,-0.24 61.38638,-9.99 73.95861,-31.87 L 990,346.775 v -96.34 c 0,-91.82 -0.29495,-96.81 -6.13249,-107.04 -13.14984,-23.55 -30.10944,-31.4 -70.45608,-32.83 l -28.64698,-0.95 v -8.8 c 0,-19.979995 -25.14445,-45.669995 -48.23654,-49.239995 -11.40472,-1.65 -928.710191,-2.61 -973.44421,-0.94 z m 970.51929,41.62 c 6.72239,5.23 7.31229,7.37 7.31229,29.499995 v 23.79 l 45.60658,0.71 45.60657,0.71 7.01734,6.66 7.01735,6.66 v 90.15 90.15 l -7.01735,6.66 c -7.01734,6.66 -7.59494,6.66 -41.7968,7.14 -18.99967,0.24 -39.4618,0.47 -45.31163,0.47 l -11.10977,0.24 v 23.79 c 0,22.36 -0.5899,24.5 -7.31229,29.73 l -7.01735,5.95 H 335.77726 c -479.121,0 -491.10332,0 -497.82572,-4.52 l -7.01734,-4.52 V 250.435 95.345005 l 7.01734,-4.52 c 6.7224,-4.52 18.70472,-4.52 497.82572,-4.52 h 490.80838 z" style="fill: #b3b3b3;" />
                      <path d="m 868.45,176.03407 -5.71,4.52 v 69.45 69.46 l 5.71,4.52 c 3.09,2.38 8.56,4.52 12.13,4.52 3.57,0 9.04,-2.14 12.13,-4.52 l 5.71,-4.52 v -69.46 -69.46 l -5.71,-4.52 c -3.09,-2.38 -8.56,-4.52 -12.13,-4.52 -3.57,0.01 -9.04,2.15 -12.13,4.53 z" />
                      <path class="js-tick" d="m 726.82058,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 630.59044,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 534.36029,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 438.13012,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 341.89997,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 245.66981,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 149.43966,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m 53.209498,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m -43.020654,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                      <path class="js-tick" d="m -139.25081,250.00407 v 130 h 40 40 v -130 -130 h -40 -40 z" style="fill: #b3b3b3;" />
                    </g>
                </svg>
                <span class="battery-value js-battery-value">100%</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    `);

    this.$el.css({
      'opacity' : 0.4
    });

    return this.$el;
  },

  /*onPress: function() {
    if (this.config.type === 'button momentary') {
      this.sendSocketNotification('SWITCH_TOGGLE', {id: this.config.id, plugin: this.config.plugin, stateOn: true});
    }
  },*/

  socketNotificationReceived: function(command, data) {
    if (command === 'LIAM_CONNECTED') {
      // Connected to plugin, get status
      this.sendSocketNotification('LIAM_STATUS', {id: this.config.id, plugin: this.config.plugin});

    } else if (command === 'LIAM_STATUS' && data.id === this.config.id) {
 
      this.$el.css({
        'opacity' : 1
      });

      this.updateDom();
    }
  },

  updateDom: function() {

  }
});
