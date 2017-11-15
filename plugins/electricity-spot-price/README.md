# Nordpool electricity spot price plugin

Modulename: electricity-spot-price


## Description

This plugin fetches the current "spot prices" from the European power market, Nordpool.
With this information you can see how the electricity pricing changes during a day for your selected area.


## Config

    "electricity-spot-price": {
        currency: <string>, // 'DKK', 'NOK', 'SEK', 'EUR'
        // http://www.nordpoolspot.com/globalassets/download-center/day-ahead/elspot-area-change-log.pdf
        // Sweden: http://www.natomraden.se/
        area: <string>,
        timezone: <string>
    }


### Config example

    "electricity-spot-price": {
        currency: 'SEK',
        area: 'SE3',
        timezone: 'Europe/Stockholm'
    }


## Author

    Henrik Östman
