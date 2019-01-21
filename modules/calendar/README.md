# Calendar

Modulename: calendar


## Description

Calendar module


## Config

    {
        module: "calendar",
        config: {
          title:    <string>,  // title of the module that should be shown on the dashboard
          plugin:   <string>,  // plugin used for interfacing with calendar
          url:      <string>,  // url to calendar
          fetchInterval         <number>,  // how often the calendar should be updated in milliseconds <optional>
          maximumEntries        <number>,  // number of entries to display <optional>
          maximumNumberOfDays   <number>,  // maximum number of days we should fetch calendar entries for <optional>
          user      <string>,  // username for fetching calendar entries <optional>
          pass      <string>,  // password for fetching calendar entries <optional>
          column:   <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:      <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>  // width of module, in number of columns <optional>
          size_y: 2  <number>  // height of module, in number of rows <optional>
        }
    }


### Config example

    {
        module: "calendar",
        config: {
          title: "My kalendar",
          plugin: "ical",
          url: 'https://calendar.google.com/calendar/ical/12345678/basic.ics',
          column: 5,
          row: 1,
          size_x: 1,
          size_y: 2
        }
    }


## Screenshots

![calendar with dark theme](doc/calendar-dark.png "Calendar - dark theme") &nbsp; ![calendar with lighy theme](doc/calendar-light.png "Calendar - light theme")


## Author

Emil Öhman
