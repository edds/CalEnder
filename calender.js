/**
  * CalEnder: A Datepicker for Ender
  * copyright Dustin Diaz @ded 2011 | License MIT
  * https://github.com/ded/calEnder
  */
!function ($) {

  var template = "" +
    "<div class='date'>" +
    "  <table>" +
    "    <thead>" +
    "      <tr class='date-header'>" +
    "        <th class='date-nav date-month-previous'>&#8227;</th>" +
    "        <th colspan='5' class='date-month-year'>" +
    "          <span class='date-current-month'></span>" +
    "          <span class='date-current-year'></span></th>" +
    "        <th class='date-nav date-month-next'>&#8227;</th>" +
    "      </tr>" +
    "      <tr class='date-daysofweek'>" +
    "        <th>S</th>" +
    "        <th>M</th>" +
    "        <th>T</th>" +
    "        <th>W</th>" +
    "        <th>T</th>" +
    "        <th>F</th>" +
    "        <th>S</th>" +
    "      </tr>" +
    "    </thead>" +
    "    <tbody class='date-days'></tbody>" +
    "  </table>" +
    "</div>"


  var months = [
      'January', 'February', 'March', 'April'
    , 'May', 'June', 'July', 'August'
    , 'September', 'October', 'November', 'December'
  ]

  function isLeapYear(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
  }
  function getDaysInMonth(year, month) {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  }

  function getMonthNumberFromName(name) {
    return months.indexOf(name) + 1
  }

  function Calendar (el, options) {
    var self = this
      , optionAttr = null
    this.options = {
        format: ['year', 'month', 'day']
      , date: false
      , startDate: false
      , endDate: false
    }
    for (optionAttr in options) {
      this.options[optionAttr] = options[optionAttr]
    }
    this.$input = $(el).first()
    this.$calendar = $(template).appendTo('body')
    this.$calendar.delegate('tbody td', 'mouseover', function () {
      $(this).closest('tbody').find('td:nth-child(' + (this.cellIndex + 1) + ')').addClass('hover')
    })

    $(document).bind('click', function (e) {
      self.$calendar.removeClass('active')
    })

    this.$calendar.bind('mousedown click', function (e) {
      e.stopPropagation()
      e.preventDefault()
    })

    this.$calendar.delegate('tbody td', 'mouseout', function () {
      $(this).closest('tbody').find('td:nth-child(' + (this.cellIndex + 1) + ')').removeClass('hover')
    })
    this.$calendar.delegate('tbody td:not(.inactive):not(.invalid)', 'click.day', function (e) {
      var day = $(this).html()
        , newDate = {
              'year': self.$calendar.find('.date-current-year').html()
            , 'month': self.zeroPad(getMonthNumberFromName(self.$calendar.find('.date-current-month').html()))
            , 'day': self.zeroPad(day)
          }
        , newVal = []
        , i = 0
      for (; i < 3; i++) {
        newVal.push(newDate[self.options.format[i]])
      }
      self.$input.val(newVal.join('-'))
      self.$input.emit('change')
      self.$calendar.removeClass('active')
    })

    this.$calendar.delegate('.date-month-previous', 'click', function (e) {
      var y = parseFloat(self.$calendar.find('.date-current-year').html())
        , m = getMonthNumberFromName(self.$calendar.find('.date-current-month').html()) - 1
      if (--m == -1) --y && (m = 11)
      self.setDate(months[m] + ' 1,' + y)
    })

    this.$calendar.delegate('.date-month-next', 'click', function (e) {
      var y = parseFloat(self.$calendar.find('.date-current-year').html())
        , m = getMonthNumberFromName(self.$calendar.find('.date-current-month').html())
      if ((m == 12)) ++y && (m = 0)
      self.setDate(months[m] + ' 1,' + y)
    })

    this.setDate((this.options.date || new Date()).toDateString())
  }
  Calendar.prototype.zeroPad = function (date) {
    return parseInt(date,10) < 10 ? '0' + date : date
  }
  Calendar.prototype.setDate = function (date) {
    var d = new Date(date)
      , monthStartDate = new Date(d.getFullYear(), d.getMonth(), 1)
      , monthStart = (monthStartDate.getDay())
      , daysInPreviousMonth = getDaysInMonth(
            d.getMonth() ? d.getFullYear() : d.getFullYear() - 1
          , d.getMonth() ? d.getMonth() - 1 : d.getMonth()
        )
      , html = []
      , firstWeek = 1
      , theDay = 0
      , dateBegin = daysInPreviousMonth - monthStart
      , daysInMonth = getDaysInMonth(d.getYear(), d.getMonth())
      , remainingWeeks = Math.floor((daysInMonth + monthStart - 7) / 7)
      , i = 0
      , monthEndDate = new Date(d.getFullYear(), d.getMonth(), daysInMonth)
      , inValidMonth = (this.options.startDate > monthStartDate && this.options.startDate < monthEndDate)
                       || (this.options.endDate > monthStartDate && this.options.endDate < monthEndDate)
      , validDays = {}
      , validStartDate = this.options.startDate > monthStartDate ? this.options.startDate.getDate() : 1
      , validEndDate = this.options.endDate < monthEndDate ? this.options.endDate.getDate() : daysInMonth
      , validClass = ''

    if (this.options.startDate && this.options.endDate && inValidMonth ) {
      while (validStartDate < daysInMonth) {
        if (validStartDate <= validEndDate) {
          validDays[validStartDate++] = true
        } else {
          validStartDate++
        }
      }
    } else if (!this.options.startDate || !this.options.endDate) {
      while (validStartDate < daysInMonth) {
        validDays[validStartDate++] = true
      }
    }


    this.$calendar.find('.date-current-year,.date-current-month,tbody.date-days').empty()
    this.$calendar.find('.date-current-year').html(d.getFullYear())
    this.$calendar.find('.date-current-month').html(months[d.getMonth()])

    html.push('<tr>')
    while (dateBegin < daysInPreviousMonth) {
      html.push('<td class="inactive">' + (++dateBegin) + '</td>')
    }
    while (monthStart < 7) {
      validClass = validDays[++theDay] ? '' : ' class="invalid"'
      html.push('<td' + validClass + '>' + (theDay) + '</td>')
      monthStart++
    }
    html.push('</tr>')
    for (; i < remainingWeeks; i++) {
      html.push('<tr>')
      var j = 0
      while (j < 7) {
        validClass = validDays[++theDay] ? '' : ' class="invalid"'
        html.push('<td' + validClass + '>' + theDay + '</td>')
        j++
      }
      html.push('</tr>')
    }
    if (theDay < daysInMonth) {
      html.push('<tr>')
      i = 0
      var finalDays = theDay + 7
        , newDays = 0
      while (i < 7) {
        if (theDay < daysInMonth) {
          validClass = validDays[++theDay] ? '' : ' class="invalid"'
          html.push('<td' + validClass + '>' + theDay + '</td>')
        } else {
          html.push('<td class="inactive">' + (++newDays) + '</td>')
        }
        i++
      }
      html.push('</tr>')
    }
    this.$calendar.find('tbody.date-days').append(html.join(''))

    var now = new Date()
    if (d.getMonth() == now.getMonth() && d.getFullYear() == now.getFullYear()) {
      this.$calendar.find('.date tbody.date-days td').each(function (el) {
        if (el.innerHTML == now.getDate() && !$(el).hasClass('inactive')) $(el).addClass('today')
      })
    }
  }

  $.ender({
    calender: function (options) {
      var $document = $(document)

      $(this).forEach(function (el) {
        var $el = $(el)
          , offset = $el.offset()
          , calendar = new Calendar(el, options)
        $el
          .bind('focus click', function (e) {
            e.stopPropagation()
            calendar.$calendar.css({ left: offset.left, top: offset.top + offset.height}).addClass('active')
          })
          .bind('keydown', function (e) {
            if (e.keyCode == 9) {
              calendar.$calendar.removeClass('active')
            }
          })
        $document.bind('click', function (e) {
          calendar.$calendar.removeClass('active')
        })
      })
      return this;
    }
  }, true)
}(ender);
