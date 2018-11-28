# horizontal-calendar

> Fancy horizontal scrolling calendar for react

[![NPM](https://img.shields.io/npm/v/horizontal-calendar.svg)](https://www.npmjs.com/package/horizontal-calendar) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save horizontal-calendar
```

## Usage

`HorizontalCalendar` will size itself (width-wise) according the width of it's parent container.

## Parameters

- `showing` - object with keys named `years`, `quarters`, `months`, `days`, `weeks` or `days`. This parameter is optional, and will default to all showing. Additionaly, you only have to include the keys you want to toggle.
- `noSelect` - object with same keys as `showing`. This parameter is optional, and only the keys you want to toggle need to be included. If you would like to make something visible, but not selectable (i.e. show years and months, but only select days), you would uses `showing={{quarters: false, weeks: false}}` and `noSelect={{years: false, months:false}}`.
- `startDate` - start of date range to display. Can be Unix seconds or date in string format `YYYY-MM-DD` - note the calendar runs in UTC internally (without a timezone).
- `endDate` - end of date range to display. Can be Unix seconds or date in string format `YYYY-MM-DD` - note the calendar runs in UTC internally (without a timezone).
- `selectedMode` - used to render with a selected period in conjunction with `selectedDate`. Options are `day`, `week`, `month`, `quarter` and `year`.
- `selectedDate` - used to render with a selected period in conjunction with `selectedMode`. Can be Unix seconds or date in string format `YYYY-MM-DD` - note the calendar runs in UTC internally (without a timezone).

> **Note**  this componenet uses [Scrollomatic](https://github.com/beaverteeth/scrollomatic) for horizontal scrolling with scrollbars that look the same on all platforms.

## Example


```jsx
import React, { Component } from 'react'

import HorizontalCalendar from 'horizontal-calendar'

export default class App extends Component {
  render () {
    return (
      <div>
        <HorizontalCalendar
          showing={{
            years: true,
            quarters: true,
            months: true,
            days: true,
            weeks: true
          }}
          noSelect={{
            years: false,
            quarters: false,
            months: false,
            days: false,
            weeks: false
          }}
          startDate='2015-08-05'
          endDate='2017-08-05'
          selectedMode='day'
          selectedDate='2017-06-07'/>
      </div>
    )
  }
}
```

## License

MIT 

Author [Seth Hamilton](https://github.com/SethHamilton)

Copyright 2018, Perple Corp and B4T Solutions

