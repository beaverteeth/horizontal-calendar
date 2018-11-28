import React, { Component } from 'react'

import ClassNames from './classnames'

import Scrollomatic from 'scrollomatic'

import './component.css'


const dayFactor = 86400000

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

const monthShortNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]

function stndth(number) {

    var test = number % 100;

    if (test == 11 || test == 12 || test == 13) {
        number += 'th';
    } else {

        test = number % 10;

        if (test == 1)
            number += 'st';
        else if (test == 2)
            number += 'nd';
        else if (test == 3)
            number += 'rd';
        else
            number += 'th';
    }
    return number;
}

export default class HorizontalCalendar extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            calculated: false,
            startDay: 0,
            originalStartIndex: 0,
            endDay: 1,
            span: 1,
            unitWidth: 22,
            unitHeight: 22,
            spacing: 1,
            selectedMode: 'none',
            selectedIndex: 0,
            selectedEndIndex: -1,
            noSelect: {}
        }

        this.days = []
        this.weeks = []
        this.months = []
        this.quarters = []
        this.years = []

        let startDay = this.parseDate(this.props.startDate)
        let endDay = this.parseDate(this.props.endDate)

        if (endDay < startDay)
            [endDay, startDay] = [startDay, endDay]

        this.state.startDay = startDay
        this.state.endDay = endDay

        if (this.props.selectedMode && this.props.selectedDate) {
            this.loadStartDate = this.parseDate(this.props.selectedDate)
            this.loadStartMode = this.props.selectedMode
        }

        this.scrollRef = React.createRef()
    }

    parseDate = (date) => {

        if (!date || date === 'now')
            return Math.floor(new Date().getTime() / dayFactor)

        if (typeof date === 'string') {
            const [year, month, day] = date.split('-').map(Number)
            return Math.floor(new Date(year, month - 1, day) / dayFactor)
        }

        return Math.floor(new Date(date).getTime() / dayFactor)       
    }

    static getDerivedStateFromProps(props, state) {
        return ({
            noSelect: props.noSelect || state.noSelect
        })
    }

    makeDates = () => {

        const isLeapYear = (year) => {
            return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)
        }

        const daysInYear = (year) => {   
            return isLeapYear(year) ? 366 : 365
        }

        // last being last pushed
        let lastYear = -1
        let lastMonth = -1
        let lastQuarter = -1

        // ud = unixDay which is unixtime / 86400 milliseconds (86,400,000)
        const endDay = this.state.endDay//Math.floor(new Date().getTime() / dayFactor)
        //let startDay = endDay - (365 * 5)      
        //const endDay = Math.floor(new Date().getTime() / dayFactor) + 60              
        let adjustedEndDay = endDay
        let startDay = this.state.startDay
        let originalStartIndex = startDay
        let weekStartIndex = startDay

        let fixDate = new Date(startDay * dayFactor)

        if (fixDate.getUTCDate() != 1) {

            startDay -= fixDate.getUTCDate() - 1
            // we moved the calendar over, so... are we in a month that doesn't exist?
            let testMonth = fixDate.getUTCMonth()
            fixDate = new Date(startDay * dayFactor)

            if (fixDate.getUTCMonth() != testMonth)
                lastMonth = testMonth 

        }

        fixDate = new Date(weekStartIndex * dayFactor)

        if (fixDate.getUTCDay() != 0) 
            weekStartIndex = weekStartIndex - fixDate.getUTCDay()
              

        // Note: rather than checking for day == 1 to switch months
        //       we check for change, this allows us to capture a
        //       first partial month

        for (let idx = startDay; idx <= endDay; ++idx) {

            const date = new Date(idx * dayFactor)

            const year = date.getUTCFullYear() // four digit year
            const month = date.getUTCMonth() + 1 // month 0-11 adjusted
            const quarter = Math.floor((month - 1) / 3) + 1 // quarters 1-4
            const day = date.getUTCDate(); // day 1-31
            const doW = date.getUTCDay(); // day of week, 0-6

            if (year != lastYear) {

                let units = daysInYear(year)

                // check is start is before startDay
                if (!(month == 1 && day == 1)) {
                    const endOfYear = Math.floor(new Date(year + 1, 0, 0) / dayFactor)
                    units = endOfYear - idx + 1
                }

                if (idx + units > endDay) {
                    units = endDay - idx + 1
                    if (units < 31) {
                        units = 31
                        adjustedEndDay = idx + 31
                    }
                }

                this.years.push({
                    year,
                    units,
                    idx
                })
                lastYear = year
            }

            if (quarter != lastQuarter) {

                const startOfQuarterMonth = Math.floor((month - 1) / 3)
                const quarterStartIdx = Math.floor(new Date(year, startOfQuarterMonth * 3, 0).getTime() / dayFactor)
                const quarterEndIdx = Math.floor(new Date(year, (startOfQuarterMonth * 3)+3, 0).getTime() / dayFactor)

                let units = quarterEndIdx - quarterStartIdx
                
                if (quarterStartIdx < startDay)
                    units = quarterEndIdx - idx + 1

                if (quarterEndIdx > endDay) {
                    units = endDay - idx + 1
                    if (units < 31) {
                        units = 31
                        adjustedEndDay = idx + 31
                    }
                }

                
                this.quarters.push({
                    quarter,
                    year,
                    idx,
                    units
                })
                lastQuarter = quarter
            }

            if (month != lastMonth) {

                // days in month - month has been adjusted to a 1 index, which is why this works
                let units = new Date(year, month, 0).getDate();

                if (day != 1)
                    units = units - day + 1

                this.months.push({
                    month,
                    year,
                    idx,
                    units
                })

                if (idx + units > endDay)
                    adjustedEndDay = idx + units


                lastMonth =  month
            }
           
            if (doW == 1 && idx >= weekStartIndex) 
                this.weeks.push({
                    day,
                    month,
                    year,
                    units: 7,
                    idx
                })

            if (idx >= originalStartIndex)
                this.days.push({
                    day,
                    month,
                    year,
                    idx,
                    units: 1
                })
        }               

        const span = (adjustedEndDay - startDay) + 1


        let newState = {
            startDay,
            originalStartIndex,
            endDay,
            adjustedEndDay,
            span,
            width: (span - 1) * (this.state.unitWidth + this.state.spacing),
            leftMargin: 0
        } 

        if (this.loadStartDate && this.loadStartMode) {
            newState.selectedMode = this.loadStartMode
            newState.selectedIndex = this.loadStartDate - originalStartIndex

            setTimeout(() => {
                this.scrollRef.current.pan(newState.selectedIndex * (this.state.unitWidth + this.state.spacing) - 200)
            },100)
        }

        this.setState(newState)

    }

    componentDidMount() {
        setImmediate(this.makeDates)
    }

    makeDays = (y) => {

        let result = []

        this.days.forEach((item, index) => {
            const idx = item.idx - this.state.startDay
            const x = idx * (this.state.unitWidth + this.state.spacing)

            const endIdx = this.props.ranges && this.state.selectedEndIndex != -1 ? 
                this.state.selectedEndIndex : this.state.selectedIndex

            const classes = ClassNames({
                'vc-cell': true,
                'click': !this.state.noSelect.days && !(this.state.selectedMode == 'day' && index >= this.state.selectedIndex && index <= endIdx),
                'lit': (this.state.selectedMode == 'day' && index >= this.state.selectedIndex && index <= endIdx),
                'dim': this.state.noSelect.days
            })
            

            //onClick={()=>{if (!this.state.noSelect.days) this.onDayClick(index)}}

            result.push(
                <div 
                    key={`d_${index}`}
                    className={classes} 
                    onClick={()=>{if (!this.state.noSelect.days) this.onDayClick(index)}}
                    style={{
                        top: y,
                        left: x,
                    }}>
                    <div style={{
                        zIndex: 10
                    }}>
                    {item.day}
                    </div>
                </div>
            )

        })

        return result
    }

    makeMonths = (y) => {

        let result = []

        this.months.forEach((item, index) => {
            const idx = item.idx - this.state.startDay
            const x = idx * (this.state.unitWidth + this.state.spacing)

            const classes = ClassNames({
                'vc-cell': true,
                'click': !this.state.noSelect.months && !(this.state.selectedMode == 'month' && this.state.selectedIndex == index),
                'lit': (this.state.selectedMode == 'month' && this.state.selectedIndex == index),
                'dim': this.state.noSelect.months
            })
            
            result.push(
                <div 
                    key={`m_${index}`}
                    className={classes} 
                    onClick={()=>{if (!this.state.noSelect.months) this.onMonthClick(index)}}
                    style={{
                        top: y,
                        left: x,
                        width: (item.units * (this.state.unitWidth + this.state.spacing)) - 1
                    }}>
                    <div className="vc-cell-stay-in-view">
                    {this.props.showing && !this.props.showing.years ?
                        `${monthNames[item.month - 1]} ${item.year}` :
                        `${monthNames[item.month - 1]}`
                    }
                    </div>
                </div>
            )

        })

        return result
    }

    makeYears = (y) => {

        let result = []

        this.years.forEach((item, index) => {
            const idx = item.idx - this.state.startDay
            const x = idx * (this.state.unitWidth + this.state.spacing)

            const classes = ClassNames({
                'vc-cell': true,
                'click': !this.state.noSelect.years && !(this.state.selectedMode == 'year' && this.state.selectedIndex == index),
                'lit': (this.state.selectedMode == 'year' && this.state.selectedIndex == index),
                'dim': this.state.noSelect.years
            })
            
            result.push(
                <div 
                    key={`y_${index}`}
                    onClick={()=>{if (!this.state.noSelect.years) this.onYearClick(index)}}
                    className={classes}
                    style={{
                        top: y,
                        left: x,
                        width: (item.units * (this.state.unitWidth + this.state.spacing)) - 1
                    }}>
                    <div className="vc-cell-stay-in-view">
                    {item.year}
                    </div>
                </div>
            )

        })

        return result
    }

    makeQuarters = (y) => {

        let result = []

        this.quarters.forEach((item, index) => {
            const idx = item.idx - this.state.startDay
            const x = idx * (this.state.unitWidth + this.state.spacing)

            const classes = ClassNames({
                'vc-cell': true,
                'click': !this.state.noSelect.quarters && !(this.state.selectedMode == 'quarter' && this.state.selectedIndex == index),
                'lit': (this.state.selectedMode == 'quarter' && this.state.selectedIndex == index),
                'dim': this.state.noSelect.quarters
            })
            
            result.push(
                <div 
                    key={`q_${index}`}
                    onClick={()=>{if (!this.state.noSelect.quarters) this.onQuarterClick(index)}}
                    className={classes} 
                    style={{
                        top: y,
                        left: x,
                        width: (item.units * (this.state.unitWidth + this.state.spacing)) - 1
                    }}>
                    <div className="vc-cell-stay-in-view">                    
                    Q{item.quarter}
                    </div>
                </div>
            )

        })

        return result
    }

    makeWeeks = (y) => {

        let result = []

        this.weeks.forEach((item, index) => {
            const idx = item.idx - this.state.startDay
            const x = idx * (this.state.unitWidth + this.state.spacing)
            const width = (7 * (this.state.unitWidth + this.state.spacing)) - 1

            const classes = ClassNames({
                'vc-cell': true,
                'click': !this.state.noSelect.weeks && !(this.state.selectedMode == 'week' && this.state.selectedIndex == index),
                'lit week': (this.state.selectedMode == 'week' && this.state.selectedIndex == index),
                'dim': this.state.noSelect.weeks
            })
            
            result.push(
                <div 
                    key={`w_${index}`}
                    onClick={()=>{if (!this.state.noSelect.weeks) this.onWeekClick(index)}}
                    className={classes}
                    style={{
                        top: y,
                        left: x,
                        width,
                        height: 10,
                        borderBottomLeftRadius: 3,
                        borderBottomRightRadius: 3,
                    }}>
                </div>
            )

        })

        /*
                    <div className="vc-cell-stay-in-view">
                    Week of {monthShortNames[item.month-1]} {stndth(item.day)}
                    </div>
        */

        return result
    }

    setEndIndex = (mode, index) => {

        if (!this.props.ranges || this.state.selectedMode != mode) {
            this.setState({
                selectedMode: mode,
                selectedIndex: index,
                selectedEndIndex: -1
            })
            return
        }

        if (mode == 'day' && this.props.unselect && (this.state.selectedEndIndex == index || this.state.selectedEndIndex == -1) && this.state.selectedIndex == index) {
            this.setState({
                selectedMode: 'none'
            })
            return
        } else if (mode != 'day' && this.props.unselect && this.state.selectedIndex == index) {
            this.setState({
                selectedMode: 'none'
            })
            return
        }

        if (this.state.selectedEndIndex == -1) {
            let startIndex = this.state.selectedIndex
            let endIndex = index
    
            if (endIndex < startIndex)
                [endIndex, startIndex] = [startIndex, endIndex]
    
            this.setState({
                selectedMode: mode,
                selectedIndex: startIndex,
                selectedEndIndex: endIndex
            })    
            return
        }

        const mid = (this.state.selectedEndIndex + this.state.selectedIndex) / 2

        if (index == this.state.selectedEndIndex) 
        this.setState({
            selectedIndex: index
        })    
        else if (index == this.state.selectedIndex) 
        this.setState({
            selectedEndIndex: index
        })    
        else if (index < mid)
            this.setState({
                selectedIndex: index
            })    
        else
            this.setState({
                selectedEndIndex: index
            })    

    }

    onDayClick = (index) => {
        this.setEndIndex('day', index)
    }

    onWeekClick = (index) => {
        this.setEndIndex('week', index)
    }

    onMonthClick = (index) => {
        this.setEndIndex('month', index)
    }

    onQuarterClick = (index) => {
        this.setEndIndex('quarter', index)
    }

    onYearClick = (index) => {
        this.setEndIndex('year', index)
    }

    showCurrent = () => {

        return

        let result = []

        let selected = null

        switch (this.state.selectedMode) {
            case 'day' :
                selected = this.days[this.state.selectedIndex]
                break
            case 'week' :
                selected = this.weeks[this.state.selectedIndex]
                break
            case 'month' :
                selected = this.months[this.state.selectedIndex]
                break
            case 'quarter' :
                selected = this.quarters[this.state.selectedIndex]
                break
            case 'year' :
                selected = this.years[this.state.selectedIndex]
                break
        }

        if (selected) {

            let idx = selected.idx - this.state.startDay
            let units = selected.units

            if (this.props.ranges && this.state.selectedMode == 'day')
                units = (this.state.selectedEndIndex - this.state.selectedIndex) + 1

            let left =  (idx) * (this.state.unitWidth + this.state.spacing)
            let width = (units) * (this.state.unitWidth + this.state.spacing)
   
            result.push( 
                <div 
                    key='mask_selected'
                    className="vc-select"
                    style={{
                        top: 7,
                        left,
                        width: width - 3,
                        height: this.maskingHeight,
                    }}>
                </div>
            )
        }

        return result
    }

    masking = () => {

        let result = []

        let left = 0
        let units = this.state.originalStartIndex - this.state.startDay
        let width = units * (this.state.unitWidth + this.state.spacing)
        let height = this.maskingHeight

        if (units) 
            result.push( 
                <div 
                    key='mask_right'
                    className="vc-void right"
                    style={{
                        top: 0,
                        left,
                        width: width - 2,
                        height,
                    }}>
                </div>
            )
           
        
        units = this.state.adjustedEndDay - this.state.endDay
        left =  (this.state.endDay - this.state.startDay + 1) * (this.state.unitWidth + this.state.spacing)
        width = (this.state.adjustedEndDay - this.state.endDay - 1) * (this.state.unitWidth + this.state.spacing)

        if (units) 
            result.push( 
                <div 
                    key='mask_left'
                    className="vc-void left"
                    style={{
                        top: 0,
                        left,
                        width,
                        height,
                    }}>
                </div>
            )
    
        return result
    }

    getSelectedDateString = () => {

        let selected = null

        switch (this.state.selectedMode) {
            case 'day' :
                selected = this.days[this.state.selectedIndex]
                return `${monthNames[selected.month - 1]} ${stndth(selected.day)}, ${selected.year}`

            case 'week' :
                selected = this.weeks[this.state.selectedIndex]
                return `Week of ${monthNames[selected.month - 1]} ${stndth(selected.day)}, ${selected.year}`

            case 'month' :
                selected = this.months[this.state.selectedIndex]
                return `${monthNames[selected.month - 1]} ${selected.year}`
            case 'quarter' :
                selected = this.quarters[this.state.selectedIndex]
                return `${stndth(selected.quarter)} Quarter ${selected.year}`

            case 'year' :
                selected = this.years[this.state.selectedIndex]
                return `All of ${selected.year}`

            default:
                return 'Select a date'
        }

    }

    onCustomRangeClick = (ev) => {

        this.setState({
            noSelect: {
                weeks: true,
                months: true,
                quarters: true,
                years: true
            },
            inRange: true
        })

        ev.preventDefault()
        return false        
    }

    onCustomRangeCancel = (ev) => {
        this.setState({
            noSelect: {},
            inRange: false
        })

        ev.preventDefault()
        return false
    }

    status = () => {

        return

        if (this.scrollRef.current && 
            this.scrollRef.current.outerRef) {

            const bounds = this.scrollRef.current.outerRef.current.getBoundingClientRect()          
            
            const style = {
                left: bounds.left,
                top: bounds.top + 2,
                width: bounds.width,
            }

            if (this.state.selectedMode == 'day' && this.props.ranges == true) {
                //                         Select a second {this.state.selectedMode}

                return (
                    <div 
                        key="vc-status-box"
                        className="vc-status-box"
                        style={style}>
                        Select a Second Day&nbsp;&nbsp;&nbsp;&nbsp;
                        <div
                            onClick={this.onCustomRangeCancel}
                            className="vc-range-button">
                            Cancel
                        </div>

                    </div>
                )
            }

            return (
                //                     {this.getSelectedDateString()}

                <div 
                    key="vc-status-box"
                    className="vc-status-box"
                    style={style}>
                    {this.state.selectedMode == 'day' &&
                        <div
                            onClick={this.onCustomRangeClick}
                            className="vc-range-button">
                            Select Range
                        </div>
                    }
                </div>
            )
        }
    }           

    render() {

        const top = 1
        const bottom = 20
        const spacing = this.state.unitHeight + this.state.spacing

        let yPos = top

        const showing = 
            this.props.showing || {
                years: true,
                quarters: true,
                months: true,
                days: true,
                weeks: true
            }

        const yearsY = yPos
        if (showing.years)
            yPos += spacing
        const quartersY = yPos
        if (showing.quarters)
            yPos += spacing
        const monthsY = yPos
        if (showing.months)
            yPos += spacing
        const daysY = yPos
        if (showing.days)
            yPos += spacing
        const weeksY = yPos
        if (showing.weeks)
            yPos += 8

        this.maskingHeight = yPos - top - (showing.weeks ? 0 : 3)
            
        return (
            <Scrollomatic ref={this.scrollRef} style={{height:this.maskingHeight + 18}}>
                <div 
                    key="vc-inner"                    
                    className="vc-container-inner" 
                    style={{
                        width: this.state.width,
                        height: this.maskingHeight + 18,
                    }}>
                    {showing.years && this.makeYears(yearsY)}
                    {showing.quarters && this.makeQuarters(quartersY)}                           
                    {showing.months && this.makeMonths(monthsY)}
                    {showing.days && this.makeDays(daysY)}
                    {showing.weeks && this.makeWeeks(weeksY)}
                    {this.masking()}                         
                    {this.showCurrent()}
                    {this.status()}                    
                </div>
            </Scrollomatic>
        )
    }
}