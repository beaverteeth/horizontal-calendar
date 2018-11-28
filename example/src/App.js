import React, { Component } from 'react'

import HorizontalCalendar from 'horizontal-calendar'

export default class App extends Component {
  render () {
    return (
      <div style={{margin:50}}>
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
