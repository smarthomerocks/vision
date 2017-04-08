Sample config
```
{
  module: "apple-tv-remote",
  config: {
    title: "Apple TV",
    plugin: "itach",
    section: "remotecontrol",
    column: 1,
    row: 1,
    size_x: 1,
    size_y: 2,
    buttons: {
      up: [{
        hardware: "appleTv",
        command: "CURSOR UP"
      }],
      down: [{
        hardware: "appleTv",
        command: "CURSOR DOWN"
      }],
      left: [{
        hardware: "appleTv",
        command: "CURSOR LEFT"
      }],
      right: [{
        hardware: "appleTv",
        command: "CURSOR RIGHT"
      }],
      enter: [{
        hardware: "appleTv",
        command: "CURSOR ENTER"
      }],
      menu: [{
        hardware: "appleTv",
        command: "MENU MAIN"
      }],
      play: [{
        hardware: "appleTv",
        command: "PLAY PAUSE TOGGLE"
      }]
    }
  }
}
```
