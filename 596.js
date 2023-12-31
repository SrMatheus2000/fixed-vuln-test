function unique_name_321(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./dist/esm/helpers.js
var helpers = __webpack_require__(0);

// CONCATENATED MODULE: ./dist/esm/dateutil.js
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

/**
 * General date-related utilities.
 * Also handles several incompatibilities between JavaScript and Python
 *
 */
var dateutil_dateutil;
(function (dateutil) {
    dateutil.MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    /**
     * Number of milliseconds of one day
     */
    dateutil.ONE_DAY = 1000 * 60 * 60 * 24;
    /**
     * @see: <http://docs.python.org/library/datetime.html#datetime.MAXYEAR>
     */
    dateutil.MAXYEAR = 9999;
    /**
     * Python uses 1-Jan-1 as the base for calculating ordinals but we don't
     * want to confuse the JS engine with milliseconds > Number.MAX_NUMBER,
     * therefore we use 1-Jan-1970 instead
     */
    dateutil.ORDINAL_BASE = new Date(Date.UTC(1970, 0, 1));
    /**
     * Python: MO-SU: 0 - 6
     * JS: SU-SAT 0 - 6
     */
    dateutil.PY_WEEKDAYS = [6, 0, 1, 2, 3, 4, 5];
    /**
     * py_date.timetuple()[7]
     */
    dateutil.getYearDay = function (date) {
        var dateNoTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return (Math.ceil((dateNoTime.valueOf() -
            new Date(date.getUTCFullYear(), 0, 1).valueOf()) /
            dateutil.ONE_DAY) + 1);
    };
    dateutil.isLeapYear = function (year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };
    dateutil.isDate = function (value) {
        return value instanceof Date;
    };
    dateutil.isValidDate = function (value) {
        return dateutil.isDate(value) && !isNaN(value.getTime());
    };
    /**
     * @return {Number} the date's timezone offset in ms
     */
    dateutil.tzOffset = function (date) {
        return date.getTimezoneOffset() * 60 * 1000;
    };
    /**
     * @see: <http://www.mcfedries.com/JavaScript/DaysBetween.asp>
     */
    dateutil.daysBetween = function (date1, date2) {
        // The number of milliseconds in one day
        // Convert both dates to milliseconds
        var date1ms = date1.getTime() - dateutil.tzOffset(date1);
        var date2ms = date2.getTime() - dateutil.tzOffset(date2);
        // Calculate the difference in milliseconds
        var differencems = date1ms - date2ms;
        // Convert back to days and return
        return Math.round(differencems / dateutil.ONE_DAY);
    };
    /**
     * @see: <http://docs.python.org/library/datetime.html#datetime.date.toordinal>
     */
    dateutil.toOrdinal = function (date) {
        return dateutil.daysBetween(date, dateutil.ORDINAL_BASE);
    };
    /**
     * @see - <http://docs.python.org/library/datetime.html#datetime.date.fromordinal>
     */
    dateutil.fromOrdinal = function (ordinal) {
        return new Date(dateutil.ORDINAL_BASE.getTime() + ordinal * dateutil.ONE_DAY);
    };
    dateutil.getMonthDays = function (date) {
        var month = date.getUTCMonth();
        return month === 1 && dateutil.isLeapYear(date.getUTCFullYear())
            ? 29
            : dateutil.MONTH_DAYS[month];
    };
    /**
     * @return {Number} python-like weekday
     */
    dateutil.getWeekday = function (date) {
        return dateutil.PY_WEEKDAYS[date.getUTCDay()];
    };
    /**
     * @see: <http://docs.python.org/library/calendar.html#calendar.monthrange>
     */
    dateutil.monthRange = function (year, month) {
        var date = new Date(Date.UTC(year, month, 1));
        return [dateutil.getWeekday(date), dateutil.getMonthDays(date)];
    };
    /**
     * @see: <http://docs.python.org/library/datetime.html#datetime.datetime.combine>
     */
    dateutil.combine = function (date, time) {
        time = time || date;
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()));
    };
    dateutil.clone = function (date) {
        var dolly = new Date(date.getTime());
        return dolly;
    };
    dateutil.cloneDates = function (dates) {
        var clones = [];
        for (var i = 0; i < dates.length; i++) {
            clones.push(dateutil.clone(dates[i]));
        }
        return clones;
    };
    /**
     * Sorts an array of Date or dateutil.Time objects
     */
    dateutil.sort = function (dates) {
        dates.sort(function (a, b) {
            return a.getTime() - b.getTime();
        });
    };
    dateutil.timeToUntilString = function (time, utc) {
        if (utc === void 0) { utc = true; }
        var date = new Date(time);
        return [
            Object(helpers["h" /* padStart */])(date.getUTCFullYear().toString(), 4, '0'),
            Object(helpers["h" /* padStart */])(date.getUTCMonth() + 1, 2, '0'),
            Object(helpers["h" /* padStart */])(date.getUTCDate(), 2, '0'),
            'T',
            Object(helpers["h" /* padStart */])(date.getUTCHours(), 2, '0'),
            Object(helpers["h" /* padStart */])(date.getUTCMinutes(), 2, '0'),
            Object(helpers["h" /* padStart */])(date.getUTCSeconds(), 2, '0'),
            utc ? 'Z' : ''
        ].join('');
    };
    dateutil.untilStringToDate = function (until) {
        var re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/;
        var bits = re.exec(until);
        if (!bits)
            throw new Error("Invalid UNTIL value: " + until);
        return new Date(Date.UTC(parseInt(bits[1], 10), parseInt(bits[2], 10) - 1, parseInt(bits[3], 10), parseInt(bits[5], 10) || 0, parseInt(bits[6], 10) || 0, parseInt(bits[7], 10) || 0));
    };
    var Time = /** @class */ (function () {
        function Time(hour, minute, second, millisecond) {
            this.hour = hour;
            this.minute = minute;
            this.second = second;
            this.millisecond = millisecond || 0;
        }
        Time.prototype.getHours = function () {
            return this.hour;
        };
        Time.prototype.getMinutes = function () {
            return this.minute;
        };
        Time.prototype.getSeconds = function () {
            return this.second;
        };
        Time.prototype.getMilliseconds = function () {
            return this.millisecond;
        };
        Time.prototype.getTime = function () {
            return ((this.hour * 60 * 60 + this.minute * 60 + this.second) * 1000 +
                this.millisecond);
        };
        return Time;
    }());
    dateutil.Time = Time;
    var DateTime = /** @class */ (function (_super) {
        __extends(DateTime, _super);
        function DateTime(year, month, day, hour, minute, second, millisecond) {
            var _this = _super.call(this, hour, minute, second, millisecond) || this;
            _this.year = year;
            _this.month = month;
            _this.day = day;
            return _this;
        }
        DateTime.prototype.getWeekday = function () {
            return dateutil.getWeekday(new Date(this.getTime()));
        };
        DateTime.prototype.getTime = function () {
            return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond)).getTime();
        };
        DateTime.prototype.getDay = function () {
            return this.day;
        };
        DateTime.prototype.getMonth = function () {
            return this.month;
        };
        DateTime.prototype.getYear = function () {
            return this.year;
        };
        DateTime.prototype.addYears = function (years) {
            this.year += years;
        };
        DateTime.prototype.addMonths = function (months) {
            this.month += months;
            if (this.month > 12) {
                var yearDiv = Math.floor(this.month / 12);
                var monthMod = Object(helpers["i" /* pymod */])(this.month, 12);
                this.month = monthMod;
                this.year += yearDiv;
                if (this.month === 0) {
                    this.month = 12;
                    --this.year;
                }
            }
        };
        DateTime.prototype.addWeekly = function (days, wkst) {
            if (wkst > this.getWeekday()) {
                this.day += -(this.getWeekday() + 1 + (6 - wkst)) + days * 7;
            }
            else {
                this.day += -(this.getWeekday() - wkst) + days * 7;
            }
            this.fixDay();
        };
        DateTime.prototype.addDaily = function (days) {
            this.day += days;
            this.fixDay();
        };
        DateTime.prototype.addHours = function (hours, filtered, byhour) {
            var fixday = false;
            if (filtered) {
                // Jump to one iteration before next day
                this.hour += Math.floor((23 - this.hour) / hours) * hours;
            }
            while (true) {
                this.hour += hours;
                var _a = Object(helpers["a" /* divmod */])(this.hour, 24), dayDiv = _a.div, hourMod = _a.mod;
                if (dayDiv) {
                    this.hour = hourMod;
                    this.addDaily(dayDiv);
                    fixday = true;
                }
                if (Object(helpers["b" /* empty */])(byhour) || Object(helpers["c" /* includes */])(byhour, this.hour))
                    break;
            }
            return fixday;
        };
        DateTime.prototype.addMinutes = function (minutes, filtered, byhour, byminute) {
            var fixday = false;
            if (filtered) {
                // Jump to one iteration before next day
                this.minute +=
                    Math.floor((1439 - (this.hour * 60 + this.minute)) / minutes) * minutes;
            }
            while (true) {
                this.minute += minutes;
                var _a = Object(helpers["a" /* divmod */])(this.minute, 60), hourDiv = _a.div, minuteMod = _a.mod;
                if (hourDiv) {
                    this.minute = minuteMod;
                    fixday = this.addHours(hourDiv, false, byhour);
                }
                if ((Object(helpers["b" /* empty */])(byhour) || Object(helpers["c" /* includes */])(byhour, this.hour)) &&
                    (Object(helpers["b" /* empty */])(byminute) || Object(helpers["c" /* includes */])(byminute, this.minute))) {
                    break;
                }
            }
            return fixday;
        };
        DateTime.prototype.addSeconds = function (seconds, filtered, byhour, byminute, bysecond) {
            var fixday = false;
            if (filtered) {
                // Jump to one iteration before next day
                this.second +=
                    Math.floor((86399 - (this.hour * 3600 + this.minute * 60 + this.second)) / seconds) * seconds;
            }
            while (true) {
                this.second += seconds;
                var _a = Object(helpers["a" /* divmod */])(this.second, 60), minuteDiv = _a.div, secondMod = _a.mod;
                if (minuteDiv) {
                    this.second = secondMod;
                    fixday = this.addMinutes(minuteDiv, false, byhour, byminute);
                }
                if ((Object(helpers["b" /* empty */])(byhour) || Object(helpers["c" /* includes */])(byhour, this.hour)) &&
                    (Object(helpers["b" /* empty */])(byminute) || Object(helpers["c" /* includes */])(byminute, this.minute)) &&
                    (Object(helpers["b" /* empty */])(bysecond) || Object(helpers["c" /* includes */])(bysecond, this.second))) {
                    break;
                }
            }
            return fixday;
        };
        DateTime.prototype.fixDay = function () {
            if (this.day <= 28) {
                return;
            }
            var daysinmonth = dateutil.monthRange(this.year, this.month - 1)[1];
            if (this.day <= daysinmonth) {
                return;
            }
            while (this.day > daysinmonth) {
                this.day -= daysinmonth;
                ++this.month;
                if (this.month === 13) {
                    this.month = 1;
                    ++this.year;
                    if (this.year > dateutil.MAXYEAR) {
                        return;
                    }
                }
                daysinmonth = dateutil.monthRange(this.year, this.month - 1)[1];
            }
        };
        return DateTime;
    }(Time));
    dateutil.DateTime = DateTime;
})(dateutil_dateutil || (dateutil_dateutil = {}));
/* harmony default export */ var esm_dateutil = (dateutil_dateutil);
//# sourceMappingURL=dateutil.js.map
// CONCATENATED MODULE: ./dist/esm/masks.js

// =============================================================================
// Date masks
// =============================================================================
// Every mask is 7 days longer to handle cross-year weekly periods.
var M365MASK = Object(helpers["k" /* repeat */])(1, 31).concat(Object(helpers["k" /* repeat */])(2, 28), Object(helpers["k" /* repeat */])(3, 31), Object(helpers["k" /* repeat */])(4, 30), Object(helpers["k" /* repeat */])(5, 31), Object(helpers["k" /* repeat */])(6, 30), Object(helpers["k" /* repeat */])(7, 31), Object(helpers["k" /* repeat */])(8, 31), Object(helpers["k" /* repeat */])(9, 30), Object(helpers["k" /* repeat */])(10, 31), Object(helpers["k" /* repeat */])(11, 30), Object(helpers["k" /* repeat */])(12, 31), Object(helpers["k" /* repeat */])(1, 7));
var M366MASK = Object(helpers["k" /* repeat */])(1, 31).concat(Object(helpers["k" /* repeat */])(2, 29), Object(helpers["k" /* repeat */])(3, 31), Object(helpers["k" /* repeat */])(4, 30), Object(helpers["k" /* repeat */])(5, 31), Object(helpers["k" /* repeat */])(6, 30), Object(helpers["k" /* repeat */])(7, 31), Object(helpers["k" /* repeat */])(8, 31), Object(helpers["k" /* repeat */])(9, 30), Object(helpers["k" /* repeat */])(10, 31), Object(helpers["k" /* repeat */])(11, 30), Object(helpers["k" /* repeat */])(12, 31), Object(helpers["k" /* repeat */])(1, 7));
var M28 = Object(helpers["j" /* range */])(1, 29);
var M29 = Object(helpers["j" /* range */])(1, 30);
var M30 = Object(helpers["j" /* range */])(1, 31);
var M31 = Object(helpers["j" /* range */])(1, 32);
var MDAY366MASK = M31.concat(M29, M31, M30, M31, M30, M31, M31, M30, M31, M30, M31, M31.slice(0, 7));
var MDAY365MASK = M31.concat(M28, M31, M30, M31, M30, M31, M31, M30, M31, M30, M31, M31.slice(0, 7));
var NM28 = Object(helpers["j" /* range */])(-28, 0);
var NM29 = Object(helpers["j" /* range */])(-29, 0);
var NM30 = Object(helpers["j" /* range */])(-30, 0);
var NM31 = Object(helpers["j" /* range */])(-31, 0);
var NMDAY366MASK = NM31.concat(NM29, NM31, NM30, NM31, NM30, NM31, NM31, NM30, NM31, NM30, NM31, NM31.slice(0, 7));
var NMDAY365MASK = NM31.concat(NM28, NM31, NM30, NM31, NM30, NM31, NM31, NM30, NM31, NM30, NM31, NM31.slice(0, 7));
var M366RANGE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
var M365RANGE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
var WDAYMASK = (function () {
    var wdaymask = [];
    for (var i = 0; i < 55; i++)
        wdaymask = wdaymask.concat(Object(helpers["j" /* range */])(7));
    return wdaymask;
})();

//# sourceMappingURL=masks.js.map
// CONCATENATED MODULE: ./dist/esm/iterinfo.js




// =============================================================================
// Iterinfo
// =============================================================================
var iterinfo_Iterinfo = /** @class */ (function () {
    function Iterinfo(rrule) {
        this.yearlen = 365;
        this.nextyearlen = 365;
        this.rrule = rrule;
        this.mmask = null;
        this.mrange = null;
        this.mdaymask = null;
        this.nmdaymask = null;
        this.wdaymask = null;
        this.wnomask = null;
        this.nwdaymask = null;
        this.eastermask = null;
    }
    Iterinfo.prototype.easter = function (y, offset) {
        if (offset === void 0) { offset = 0; }
        var a = y % 19;
        var b = Math.floor(y / 100);
        var c = y % 100;
        var d = Math.floor(b / 4);
        var e = b % 4;
        var f = Math.floor((b + 8) / 25);
        var g = Math.floor((b - f + 1) / 3);
        var h = Math.floor(19 * a + b - d - g + 15) % 30;
        var i = Math.floor(c / 4);
        var k = c % 4;
        var l = Math.floor(32 + 2 * e + 2 * i - h - k) % 7;
        var m = Math.floor((a + 11 * h + 22 * l) / 451);
        var month = Math.floor((h + l - 7 * m + 114) / 31);
        var day = ((h + l - 7 * m + 114) % 31) + 1;
        var date = Date.UTC(y, month - 1, day + offset);
        var yearStart = Date.UTC(y, 0, 1);
        return [Math.ceil((date - yearStart) / (1000 * 60 * 60 * 24))];
    };
    Iterinfo.prototype.rebuild = function (year, month) {
        var rr = this.rrule;
        if (year !== this.lastyear) {
            this.rebuildYear(year);
        }
        if (Object(helpers["g" /* notEmpty */])(rr.options.bynweekday) &&
            (month !== this.lastmonth || year !== this.lastyear)) {
            this.rebuildMonth(year, month);
        }
        if (Object(helpers["f" /* isPresent */])(rr.options.byeaster)) {
            this.eastermask = this.easter(year, rr.options.byeaster);
        }
    };
    Iterinfo.prototype.rebuildYear = function (year) {
        var rr = this.rrule;
        this.yearlen = esm_dateutil.isLeapYear(year) ? 366 : 365;
        this.nextyearlen = esm_dateutil.isLeapYear(year + 1) ? 366 : 365;
        var firstyday = new Date(Date.UTC(year, 0, 1));
        this.yearordinal = esm_dateutil.toOrdinal(firstyday);
        this.yearweekday = esm_dateutil.getWeekday(firstyday);
        var wday = esm_dateutil.getWeekday(firstyday);
        if (this.yearlen === 365) {
            this.mmask = M365MASK;
            this.mdaymask = MDAY365MASK;
            this.nmdaymask = NMDAY365MASK;
            this.wdaymask = WDAYMASK.slice(wday);
            this.mrange = M365RANGE;
        }
        else {
            this.mmask = M366MASK;
            this.mdaymask = MDAY366MASK;
            this.nmdaymask = NMDAY366MASK;
            this.wdaymask = WDAYMASK.slice(wday);
            this.mrange = M366RANGE;
        }
        if (Object(helpers["b" /* empty */])(rr.options.byweekno)) {
            this.wnomask = null;
        }
        else {
            this.wnomask = Object(helpers["k" /* repeat */])(0, this.yearlen + 7);
            var no1wkst = void 0;
            var firstwkst = void 0;
            var wyearlen = void 0;
            no1wkst = firstwkst = Object(helpers["i" /* pymod */])(7 - this.yearweekday + rr.options.wkst, 7);
            if (no1wkst >= 4) {
                no1wkst = 0;
                // Number of days in the year, plus the days we got
                // from last year.
                wyearlen =
                    this.yearlen + Object(helpers["i" /* pymod */])(this.yearweekday - rr.options.wkst, 7);
            }
            else {
                // Number of days in the year, minus the days we
                // left in last year.
                wyearlen = this.yearlen - no1wkst;
            }
            var div = Math.floor(wyearlen / 7);
            var mod = Object(helpers["i" /* pymod */])(wyearlen, 7);
            var numweeks = Math.floor(div + mod / 4);
            for (var j = 0; j < rr.options.byweekno.length; j++) {
                var i = void 0;
                var n = rr.options.byweekno[j];
                if (n < 0) {
                    n += numweeks + 1;
                }
                if (!(n > 0 && n <= numweeks)) {
                    continue;
                }
                if (n > 1) {
                    i = no1wkst + (n - 1) * 7;
                    if (no1wkst !== firstwkst) {
                        i -= 7 - firstwkst;
                    }
                }
                else {
                    i = no1wkst;
                }
                for (var k = 0; k < 7; k++) {
                    this.wnomask[i] = 1;
                    i++;
                    if (this.wdaymask[i] === rr.options.wkst)
                        break;
                }
            }
            if (Object(helpers["c" /* includes */])(rr.options.byweekno, 1)) {
                // Check week number 1 of next year as well
                // orig-TODO : Check -numweeks for next year.
                var i = no1wkst + numweeks * 7;
                if (no1wkst !== firstwkst)
                    i -= 7 - firstwkst;
                if (i < this.yearlen) {
                    // If week starts in next year, we
                    // don't care about it.
                    for (var j = 0; j < 7; j++) {
                        this.wnomask[i] = 1;
                        i += 1;
                        if (this.wdaymask[i] === rr.options.wkst)
                            break;
                    }
                }
            }
            if (no1wkst) {
                // Check last week number of last year as
                // well. If no1wkst is 0, either the year
                // started on week start, or week number 1
                // got days from last year, so there are no
                // days from last year's last week number in
                // this year.
                var lnumweeks = void 0;
                if (!Object(helpers["c" /* includes */])(rr.options.byweekno, -1)) {
                    var lyearweekday = esm_dateutil.getWeekday(new Date(Date.UTC(year - 1, 0, 1)));
                    var lno1wkst = Object(helpers["i" /* pymod */])(7 - lyearweekday.valueOf() + rr.options.wkst, 7);
                    var lyearlen = esm_dateutil.isLeapYear(year - 1) ? 366 : 365;
                    if (lno1wkst >= 4) {
                        lno1wkst = 0;
                        lnumweeks = Math.floor(52 +
                            Object(helpers["i" /* pymod */])(lyearlen + Object(helpers["i" /* pymod */])(lyearweekday - rr.options.wkst, 7), 7) /
                                4);
                    }
                    else {
                        lnumweeks = Math.floor(52 + Object(helpers["i" /* pymod */])(this.yearlen - no1wkst, 7) / 4);
                    }
                }
                else {
                    lnumweeks = -1;
                }
                if (Object(helpers["c" /* includes */])(rr.options.byweekno, lnumweeks)) {
                    for (var i = 0; i < no1wkst; i++)
                        this.wnomask[i] = 1;
                }
            }
        }
    };
    Iterinfo.prototype.rebuildMonth = function (year, month) {
        var rr = this.rrule;
        var ranges = [];
        if (rr.options.freq === esm_rrule.YEARLY) {
            if (Object(helpers["g" /* notEmpty */])(rr.options.bymonth)) {
                for (var j = 0; j < rr.options.bymonth.length; j++) {
                    month = rr.options.bymonth[j];
                    ranges.push(this.mrange.slice(month - 1, month + 1));
                }
            }
            else {
                ranges = [[0, this.yearlen]];
            }
        }
        else if (rr.options.freq === esm_rrule.MONTHLY) {
            ranges = [this.mrange.slice(month - 1, month + 1)];
        }
        if (Object(helpers["g" /* notEmpty */])(ranges)) {
            // Weekly frequency won't get here, so we may not
            // care about cross-year weekly periods.
            this.nwdaymask = Object(helpers["k" /* repeat */])(0, this.yearlen);
            for (var j = 0; j < ranges.length; j++) {
                var rang = ranges[j];
                var first = rang[0];
                var last = rang[1];
                last -= 1;
                for (var k = 0; k < rr.options.bynweekday.length; k++) {
                    var i = void 0;
                    var wday = rr.options.bynweekday[k][0];
                    var n = rr.options.bynweekday[k][1];
                    if (n < 0) {
                        i = last + (n + 1) * 7;
                        i -= Object(helpers["i" /* pymod */])(this.wdaymask[i] - wday, 7);
                    }
                    else {
                        i = first + (n - 1) * 7;
                        i += Object(helpers["i" /* pymod */])(7 - this.wdaymask[i] + wday, 7);
                    }
                    if (first <= i && i <= last)
                        this.nwdaymask[i] = 1;
                }
            }
        }
        this.lastyear = year;
        this.lastmonth = month;
    };
    Iterinfo.prototype.ydayset = function () {
        return [Object(helpers["j" /* range */])(this.yearlen), 0, this.yearlen];
    };
    Iterinfo.prototype.mdayset = function (_, month, __) {
        var start = this.mrange[month - 1];
        var end = this.mrange[month];
        var set = Object(helpers["k" /* repeat */])(null, this.yearlen);
        for (var i = start; i < end; i++)
            set[i] = i;
        return [set, start, end];
    };
    Iterinfo.prototype.wdayset = function (year, month, day) {
        // We need to handle cross-year weeks here.
        var set = Object(helpers["k" /* repeat */])(null, this.yearlen + 7);
        var i = esm_dateutil.toOrdinal(new Date(Date.UTC(year, month - 1, day))) -
            this.yearordinal;
        var start = i;
        for (var j = 0; j < 7; j++) {
            set[i] = i;
            ++i;
            if (this.wdaymask[i] === this.rrule.options.wkst)
                break;
        }
        return [set, start, i];
    };
    Iterinfo.prototype.ddayset = function (year, month, day) {
        var set = Object(helpers["k" /* repeat */])(null, this.yearlen);
        var i = esm_dateutil.toOrdinal(new Date(Date.UTC(year, month - 1, day))) -
            this.yearordinal;
        set[i] = i;
        return [set, i, i + 1];
    };
    Iterinfo.prototype.htimeset = function (hour, minute, second, millisecond) {
        var set = [];
        var rr = this.rrule;
        for (var i = 0; i < rr.options.byminute.length; i++) {
            minute = rr.options.byminute[i];
            for (var j = 0; j < rr.options.bysecond.length; j++) {
                second = rr.options.bysecond[j];
                set.push(new esm_dateutil.Time(hour, minute, second, millisecond));
            }
        }
        esm_dateutil.sort(set);
        return set;
    };
    Iterinfo.prototype.mtimeset = function (hour, minute, second, millisecond) {
        var set = [];
        var rr = this.rrule;
        for (var j = 0; j < rr.options.bysecond.length; j++) {
            second = rr.options.bysecond[j];
            set.push(new esm_dateutil.Time(hour, minute, second, millisecond));
        }
        esm_dateutil.sort(set);
        return set;
    };
    Iterinfo.prototype.stimeset = function (hour, minute, second, millisecond) {
        return [new esm_dateutil.Time(hour, minute, second, millisecond)];
    };
    return Iterinfo;
}());
/* harmony default export */ var iterinfo = (iterinfo_Iterinfo);
//# sourceMappingURL=iterinfo.js.map
// CONCATENATED MODULE: ./dist/esm/iterresult.js
/**
 * This class helps us to emulate python's generators, sorta.
 */
var IterResult = /** @class */ (function () {
    function IterResult(method, args) {
        this.minDate = null;
        this.maxDate = null;
        this._result = [];
        this.total = 0;
        this.method = method;
        this.args = args;
        if (method === 'between') {
            this.maxDate = args.inc
                ? args.before
                : new Date(args.before.getTime() - 1);
            this.minDate = args.inc ? args.after : new Date(args.after.getTime() + 1);
        }
        else if (method === 'before') {
            this.maxDate = args.inc ? args.dt : new Date(args.dt.getTime() - 1);
        }
        else if (method === 'after') {
            this.minDate = args.inc ? args.dt : new Date(args.dt.getTime() + 1);
        }
    }
    /**
     * Possibly adds a date into the result.
     *
     * @param {Date} date - the date isn't necessarly added to the result
     *                      list (if it is too late/too early)
     * @return {Boolean} true if it makes sense to continue the iteration
     *                   false if we're done.
     */
    IterResult.prototype.accept = function (date) {
        ++this.total;
        var tooEarly = this.minDate && date < this.minDate;
        var tooLate = this.maxDate && date > this.maxDate;
        if (this.method === 'between') {
            if (tooEarly)
                return true;
            if (tooLate)
                return false;
        }
        else if (this.method === 'before') {
            if (tooLate)
                return false;
        }
        else if (this.method === 'after') {
            if (tooEarly)
                return true;
            this.add(date);
            return false;
        }
        return this.add(date);
    };
    /**
     *
     * @param {Date} date that is part of the result.
     * @return {Boolean} whether we are interested in more values.
     */
    IterResult.prototype.add = function (date) {
        this._result.push(date);
        return true;
    };
    /**
     * 'before' and 'after' return only one date, whereas 'all'
     * and 'between' an array.
     * @return {Date,Array?}
     */
    IterResult.prototype.getValue = function () {
        var res = this._result;
        switch (this.method) {
            case 'all':
            case 'between':
                return res;
            case 'before':
            case 'after':
                return res.length ? res[res.length - 1] : null;
        }
    };
    IterResult.prototype.clone = function () {
        return new IterResult(this.method, this.args);
    };
    return IterResult;
}());
/* harmony default export */ var iterresult = (IterResult);
//# sourceMappingURL=iterresult.js.map
// CONCATENATED MODULE: ./dist/esm/callbackiterresult.js
var callbackiterresult_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

/**
 * IterResult subclass that calls a callback function on each add,
 * and stops iterating when the callback returns false.
 */
var CallbackIterResult = /** @class */ (function (_super) {
    callbackiterresult_extends(CallbackIterResult, _super);
    function CallbackIterResult(method, args, iterator) {
        var _this = _super.call(this, method, args) || this;
        _this.iterator = iterator;
        return _this;
    }
    CallbackIterResult.prototype.add = function (date) {
        if (this.iterator(date, this._result.length)) {
            this._result.push(date);
            return true;
        }
        return false;
    };
    return CallbackIterResult;
}(iterresult));
/* harmony default export */ var callbackiterresult = (CallbackIterResult);
//# sourceMappingURL=callbackiterresult.js.map
// CONCATENATED MODULE: ./dist/esm/types.js
var Frequency;
(function (Frequency) {
    Frequency[Frequency["YEARLY"] = 0] = "YEARLY";
    Frequency[Frequency["MONTHLY"] = 1] = "MONTHLY";
    Frequency[Frequency["WEEKLY"] = 2] = "WEEKLY";
    Frequency[Frequency["DAILY"] = 3] = "DAILY";
    Frequency[Frequency["HOURLY"] = 4] = "HOURLY";
    Frequency[Frequency["MINUTELY"] = 5] = "MINUTELY";
    Frequency[Frequency["SECONDLY"] = 6] = "SECONDLY";
})(Frequency || (Frequency = {}));
//# sourceMappingURL=types.js.map
// CONCATENATED MODULE: ./dist/esm/weekday.js
// =============================================================================
// Weekday
// =============================================================================
var WDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
var Weekday = /** @class */ (function () {
    function Weekday(weekday, n) {
        if (n === 0)
            throw new Error("Can't create weekday with n == 0");
        this.weekday = weekday;
        this.n = n;
    }
    // __call__ - Cannot call the object directly, do it through
    // e.g. RRule.TH.nth(-1) instead,
    Weekday.prototype.nth = function (n) {
        return this.n === n ? this : new Weekday(this.weekday, n);
    };
    // __eq__
    Weekday.prototype.equals = function (other) {
        return this.weekday === other.weekday && this.n === other.n;
    };
    // __repr__
    Weekday.prototype.toString = function () {
        var s = WDAYS[this.weekday];
        if (this.n)
            s = (this.n > 0 ? '+' : '') + String(this.n) + s;
        return s;
    };
    Weekday.prototype.getJsWeekday = function () {
        return this.weekday === 6 ? 0 : this.weekday + 1;
    };
    return Weekday;
}());

//# sourceMappingURL=weekday.js.map
// CONCATENATED MODULE: ./dist/esm/parseoptions.js




function initializeOptions(options) {
    var invalid = [];
    var keys = Object.keys(options);
    var initializedOptions = {};
    // Shallow copy for options and origOptions and check for invalid
    keys.forEach(function (key) {
        var value = options[key];
        initializedOptions[key] = value;
        if (!Object(helpers["c" /* includes */])(rrule_defaultKeys, key))
            invalid.push(key);
        if (esm_dateutil.isDate(value) && !esm_dateutil.isValidDate(value))
            invalid.push(key);
    });
    if (invalid.length) {
        throw new Error('Invalid options: ' + invalid.join(', '));
    }
    return initializedOptions;
}
function parseOptions(options) {
    var opts = initializeOptions(options);
    var keys = Object.keys(options);
    // Merge in default options
    rrule_defaultKeys.forEach(function (key) {
        if (!Object(helpers["c" /* includes */])(keys, key) || !Object(helpers["f" /* isPresent */])(opts[key]))
            opts[key] = DEFAULT_OPTIONS[key];
    });
    if (Object(helpers["f" /* isPresent */])(opts.byeaster))
        opts.freq = esm_rrule.YEARLY;
    if (!(Object(helpers["f" /* isPresent */])(opts.freq) && esm_rrule.FREQUENCIES[opts.freq])) {
        throw new Error("Invalid frequency: " + opts.freq + " " + options.freq);
    }
    if (!opts.dtstart)
        opts.dtstart = new Date(new Date().setMilliseconds(0));
    var millisecondModulo = opts.dtstart.getTime() % 1000;
    if (!Object(helpers["f" /* isPresent */])(opts.wkst)) {
        opts.wkst = esm_rrule.MO.weekday;
    }
    else if (Object(helpers["e" /* isNumber */])(opts.wkst)) {
        // cool, just keep it like that
    }
    else {
        opts.wkst = opts.wkst.weekday;
    }
    if (Object(helpers["f" /* isPresent */])(opts.bysetpos)) {
        if (Object(helpers["e" /* isNumber */])(opts.bysetpos))
            opts.bysetpos = [opts.bysetpos];
        for (var i = 0; i < opts.bysetpos.length; i++) {
            var v = opts.bysetpos[i];
            if (v === 0 || !(v >= -366 && v <= 366)) {
                throw new Error('bysetpos must be between 1 and 366,' + ' or between -366 and -1');
            }
        }
    }
    if (!(Boolean(opts.byweekno) ||
        Object(helpers["g" /* notEmpty */])(opts.byweekno) ||
        Object(helpers["g" /* notEmpty */])(opts.byyearday) ||
        Boolean(opts.bymonthday) ||
        Object(helpers["g" /* notEmpty */])(opts.bymonthday) ||
        Object(helpers["f" /* isPresent */])(opts.byweekday) ||
        Object(helpers["f" /* isPresent */])(opts.byeaster))) {
        switch (opts.freq) {
            case esm_rrule.YEARLY:
                if (!opts.bymonth)
                    opts.bymonth = opts.dtstart.getUTCMonth() + 1;
                opts.bymonthday = opts.dtstart.getUTCDate();
                break;
            case esm_rrule.MONTHLY:
                opts.bymonthday = opts.dtstart.getUTCDate();
                break;
            case esm_rrule.WEEKLY:
                opts.byweekday = [esm_dateutil.getWeekday(opts.dtstart)];
                break;
        }
    }
    // bymonth
    if (Object(helpers["f" /* isPresent */])(opts.bymonth) && !Object(helpers["d" /* isArray */])(opts.bymonth)) {
        opts.bymonth = [opts.bymonth];
    }
    // byyearday
    if (Object(helpers["f" /* isPresent */])(opts.byyearday) &&
        !Object(helpers["d" /* isArray */])(opts.byyearday) &&
        Object(helpers["e" /* isNumber */])(opts.byyearday)) {
        opts.byyearday = [opts.byyearday];
    }
    // bymonthday
    if (!Object(helpers["f" /* isPresent */])(opts.bymonthday)) {
        opts.bymonthday = [];
        opts.bynmonthday = [];
    }
    else if (Object(helpers["d" /* isArray */])(opts.bymonthday)) {
        var bymonthday = [];
        var bynmonthday = [];
        for (var i = 0; i < opts.bymonthday.length; i++) {
            var v = opts.bymonthday[i];
            if (v > 0) {
                bymonthday.push(v);
            }
            else if (v < 0) {
                bynmonthday.push(v);
            }
        }
        opts.bymonthday = bymonthday;
        opts.bynmonthday = bynmonthday;
    }
    else if (opts.bymonthday < 0) {
        opts.bynmonthday = [opts.bymonthday];
        opts.bymonthday = [];
    }
    else {
        opts.bynmonthday = [];
        opts.bymonthday = [opts.bymonthday];
    }
    // byweekno
    if (Object(helpers["f" /* isPresent */])(opts.byweekno) && !Object(helpers["d" /* isArray */])(opts.byweekno)) {
        opts.byweekno = [opts.byweekno];
    }
    // byweekday / bynweekday
    if (!Object(helpers["f" /* isPresent */])(opts.byweekday)) {
        opts.bynweekday = null;
    }
    else if (Object(helpers["e" /* isNumber */])(opts.byweekday)) {
        opts.byweekday = [opts.byweekday];
        opts.bynweekday = null;
    }
    else if (opts.byweekday instanceof Weekday) {
        if (!opts.byweekday.n || opts.freq > esm_rrule.MONTHLY) {
            opts.byweekday = [opts.byweekday.weekday];
            opts.bynweekday = null;
        }
        else {
            opts.bynweekday = [[opts.byweekday.weekday, opts.byweekday.n]];
            opts.byweekday = null;
        }
    }
    else {
        var byweekday = [];
        var bynweekday = [];
        for (var i = 0; i < opts.byweekday.length; i++) {
            var wday = opts.byweekday[i];
            if (Object(helpers["e" /* isNumber */])(wday)) {
                byweekday.push(wday);
                continue;
            }
            var wd = wday;
            if (!wd.n || opts.freq > esm_rrule.MONTHLY) {
                byweekday.push(wd.weekday);
            }
            else {
                bynweekday.push([wd.weekday, wd.n]);
            }
        }
        opts.byweekday = Object(helpers["g" /* notEmpty */])(byweekday) ? byweekday : null;
        opts.bynweekday = Object(helpers["g" /* notEmpty */])(bynweekday) ? bynweekday : null;
    }
    // byhour
    if (!Object(helpers["f" /* isPresent */])(opts.byhour)) {
        opts.byhour =
            opts.freq < esm_rrule.HOURLY ? [opts.dtstart.getUTCHours()] : null;
    }
    else if (Object(helpers["e" /* isNumber */])(opts.byhour)) {
        opts.byhour = [opts.byhour];
    }
    // byminute
    if (!Object(helpers["f" /* isPresent */])(opts.byminute)) {
        opts.byminute =
            opts.freq < esm_rrule.MINUTELY ? [opts.dtstart.getUTCMinutes()] : null;
    }
    else if (Object(helpers["e" /* isNumber */])(opts.byminute)) {
        opts.byminute = [opts.byminute];
    }
    // bysecond
    if (!Object(helpers["f" /* isPresent */])(opts.bysecond)) {
        opts.bysecond =
            opts.freq < esm_rrule.SECONDLY ? [opts.dtstart.getUTCSeconds()] : null;
    }
    else if (Object(helpers["e" /* isNumber */])(opts.bysecond)) {
        opts.bysecond = [opts.bysecond];
    }
    var timeset;
    if (opts.freq >= esm_rrule.HOURLY) {
        timeset = null;
    }
    else {
        timeset = [];
        for (var i = 0; i < opts.byhour.length; i++) {
            var hour = opts.byhour[i];
            for (var j = 0; j < opts.byminute.length; j++) {
                var minute = opts.byminute[j];
                for (var k = 0; k < opts.bysecond.length; k++) {
                    var second = opts.bysecond[k];
                    // python:
                    // datetime.time(hour, minute, second,
                    // tzinfo=self._tzinfo))
                    timeset.push(new esm_dateutil.Time(hour, minute, second, millisecondModulo));
                }
            }
        }
        esm_dateutil.sort(timeset);
    }
    return { parsedOptions: opts, timeset: timeset };
}
//# sourceMappingURL=parseoptions.js.map
// CONCATENATED MODULE: ./dist/esm/parsestring.js
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};




function parseString(rfcString) {
    var options = rfcString.split('\n').map(parseLine).filter(function (x) { return x !== null; });
    return __assign({}, options[0], options[1]);
}
function parseDtstart(line) {
    var options = {};
    var dtstartWithZone = /DTSTART(?:;TZID=([^:=]+?))?(?::|=)([^;\s]+)/i.exec(line);
    if (!dtstartWithZone) {
        return options;
    }
    var _ = dtstartWithZone[0], tzid = dtstartWithZone[1], dtstart = dtstartWithZone[2];
    if (tzid) {
        options.tzid = tzid;
    }
    options.dtstart = esm_dateutil.untilStringToDate(dtstart);
    return options;
}
function parseLine(rfcString) {
    rfcString = rfcString.replace(/^\s+|\s+$/, '');
    if (!rfcString.length)
        return null;
    var header = /^([A-Z]+?)[:;]/.exec(rfcString.toUpperCase());
    if (!header) {
        return parseRrule(rfcString);
    }
    var _ = header[0], key = header[1];
    switch (key.toUpperCase()) {
        case 'RRULE':
        case 'EXRULE':
            return parseRrule(rfcString);
        case 'DTSTART':
            return parseDtstart(rfcString);
        default:
            throw new Error("Unsupported RFC prop " + key + " in " + rfcString);
    }
}
function parseRrule(line) {
    var strippedLine = line.replace(/^RRULE:/i, '');
    var options = parseDtstart(strippedLine);
    var attrs = line.replace(/^(?:RRULE|EXRULE):/i, '').split(';');
    attrs.forEach(function (attr) {
        var _a = attr.split('='), key = _a[0], value = _a[1];
        switch (key.toUpperCase()) {
            case 'FREQ':
                options.freq = Frequency[value.toUpperCase()];
                break;
            case 'WKST':
                options.wkst = Days[value.toUpperCase()];
                break;
            case 'COUNT':
            case 'INTERVAL':
            case 'BYSETPOS':
            case 'BYMONTH':
            case 'BYMONTHDAY':
            case 'BYYEARDAY':
            case 'BYWEEKNO':
            case 'BYHOUR':
            case 'BYMINUTE':
            case 'BYSECOND':
                var num = parseNumber(value);
                var optionKey = key.toLowerCase();
                // @ts-ignore
                options[optionKey] = num;
                break;
            case 'BYWEEKDAY':
            case 'BYDAY':
                options.byweekday = parseWeekday(value);
                break;
            case 'DTSTART':
            case 'TZID':
                // for backwards compatibility
                var dtstart = parseDtstart(line);
                options.tzid = dtstart.tzid;
                options.dtstart = dtstart.dtstart;
                break;
            case 'UNTIL':
                options.until = esm_dateutil.untilStringToDate(value);
                break;
            case 'BYEASTER':
                options.byeaster = Number(value);
                break;
            default:
                throw new Error("Unknown RRULE property '" + key + "'");
        }
    });
    return options;
}
function parseNumber(value) {
    if (value.indexOf(',') !== -1) {
        var values = value.split(',');
        return values.map(function (val) {
            if (/^[+-]?\d+$/.test(val.toString())) {
                return Number(val);
            }
            else {
                return val;
            }
        });
    }
    else if (/^[+-]?\d+$/.test(value)) {
        return Number(value);
    }
    return value;
}
function parseWeekday(value) {
    var days = value.split(',');
    return days.map(function (day) {
        if (day.length === 2) {
            // MO, TU, ...
            return Days[day]; // wday instanceof Weekday
        }
        else {
            // -1MO, +3FR, 1SO, ...
            var parts = day.match(/^([+-]?\d)([A-Z]{2})$/);
            var n = Number(parts[1]);
            var wdaypart = parts[2];
            var wday = Days[wdaypart].weekday;
            return new Weekday(wday, n);
        }
    });
}
//# sourceMappingURL=parsestring.js.map
// EXTERNAL MODULE: ./node_modules/luxon/build/cjs-browser/luxon.js
var luxon = __webpack_require__(2);

// CONCATENATED MODULE: ./dist/esm/datewithzone.js


var datewithzone_DateWithZone = /** @class */ (function () {
    function DateWithZone(date, tzid) {
        this.date = date;
        this.tzid = tzid;
    }
    Object.defineProperty(DateWithZone.prototype, "isUTC", {
        get: function () {
            return !this.tzid || this.tzid.toUpperCase() === 'UTC';
        },
        enumerable: true,
        configurable: true
    });
    DateWithZone.prototype.toString = function () {
        var datestr = esm_dateutil.timeToUntilString(this.date.getTime(), this.isUTC);
        if (!this.isUTC) {
            return ";TZID=" + this.tzid + ":" + datestr;
        }
        return ":" + datestr;
    };
    DateWithZone.prototype.getTime = function () {
        return this.date.getTime();
    };
    DateWithZone.prototype.rezonedDate = function () {
        if (this.isUTC) {
            return this.date;
        }
        try {
            var datetime = luxon["DateTime"]
                .fromJSDate(this.date);
            var rezoned = datetime.setZone(this.tzid, { keepLocalTime: true });
            return rezoned.toJSDate();
        }
        catch (e) {
            if (e instanceof TypeError) {
                console.error('Using TZID without Luxon available is unsupported. Returned times are in UTC, not the requested time zone');
            }
            return this.date;
        }
    };
    return DateWithZone;
}());

//# sourceMappingURL=datewithzone.js.map
// CONCATENATED MODULE: ./dist/esm/optionstostring.js





function optionsToString(options) {
    var rrule = [];
    var dtstart = '';
    var keys = Object.keys(options);
    var defaultKeys = Object.keys(DEFAULT_OPTIONS);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] === 'tzid')
            continue;
        if (!Object(helpers["c" /* includes */])(defaultKeys, keys[i]))
            continue;
        var key = keys[i].toUpperCase();
        var value = options[keys[i]];
        var outValue = '';
        if (!Object(helpers["f" /* isPresent */])(value) || (Object(helpers["d" /* isArray */])(value) && !value.length))
            continue;
        switch (key) {
            case 'FREQ':
                outValue = esm_rrule.FREQUENCIES[options.freq];
                break;
            case 'WKST':
                if (Object(helpers["e" /* isNumber */])(value)) {
                    outValue = new Weekday(value).toString();
                }
                else {
                    outValue = value.toString();
                }
                break;
            case 'BYWEEKDAY':
                /*
                NOTE: BYWEEKDAY is a special case.
                RRule() deconstructs the rule.options.byweekday array
                into an array of Weekday arguments.
                On the other hand, rule.origOptions is an array of Weekdays.
                We need to handle both cases here.
                It might be worth change RRule to keep the Weekdays.
      
                Also, BYWEEKDAY (used by RRule) vs. BYDAY (RFC)
      
                */
                key = 'BYDAY';
                outValue = Object(helpers["m" /* toArray */])(value).map(function (wday) {
                    if (wday instanceof Weekday) {
                        return wday;
                    }
                    else if (Object(helpers["d" /* isArray */])(wday)) {
                        return new Weekday(wday[0], wday[1]);
                    }
                    else {
                        return new Weekday(wday);
                    }
                }).toString();
                break;
            case 'DTSTART':
                dtstart = buildDtstart(value, options.tzid);
                break;
            case 'UNTIL':
                outValue = esm_dateutil.timeToUntilString(value, !options.tzid);
                break;
            default:
                if (Object(helpers["d" /* isArray */])(value)) {
                    var strValues = [];
                    for (var j = 0; j < value.length; j++) {
                        strValues[j] = String(value[j]);
                    }
                    outValue = strValues.toString();
                }
                else {
                    outValue = String(value);
                }
        }
        if (outValue) {
            rrule.push([key, outValue]);
        }
    }
    var rules = rrule.map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + value.toString();
    }).join(';');
    var ruleString = '';
    if (rules !== '') {
        ruleString = "RRULE:" + rules;
    }
    return [dtstart, ruleString].filter(function (x) { return !!x; }).join('\n');
}
function buildDtstart(dtstart, tzid) {
    if (!dtstart) {
        return '';
    }
    return 'DTSTART' + new datewithzone_DateWithZone(new Date(dtstart), tzid).toString();
}
//# sourceMappingURL=optionstostring.js.map
// CONCATENATED MODULE: ./dist/esm/cache.js



var cache_Cache = /** @class */ (function () {
    function Cache() {
        this.all = false;
        this.before = [];
        this.after = [];
        this.between = [];
    }
    /**
     * @param {String} what - all/before/after/between
     * @param {Array,Date} value - an array of dates, one date, or null
     * @param {Object?} args - _iter arguments
     */
    Cache.prototype._cacheAdd = function (what, value, args) {
        if (value) {
            value =
                value instanceof Date
                    ? esm_dateutil.clone(value)
                    : esm_dateutil.cloneDates(value);
        }
        if (what === 'all') {
            this.all = value;
        }
        else {
            args._value = value;
            this[what].push(args);
        }
    };
    /**
     * @return false - not in the cache
     *         null  - cached, but zero occurrences (before/after)
     *         Date  - cached (before/after)
     *         []    - cached, but zero occurrences (all/between)
     *         [Date1, DateN] - cached (all/between)
     */
    Cache.prototype._cacheGet = function (what, args) {
        var cached = false;
        var argsKeys = args ? Object.keys(args) : [];
        var findCacheDiff = function (item) {
            for (var i = 0; i < argsKeys.length; i++) {
                var key = argsKeys[i];
                if (String(args[key]) !== String(item[key])) {
                    return true;
                }
            }
            return false;
        };
        var cachedObject = this[what];
        if (what === 'all') {
            cached = this.all;
        }
        else if (Object(helpers["d" /* isArray */])(cachedObject)) {
            // Let's see whether we've already called the
            // 'what' method with the same 'args'
            for (var i = 0; i < cachedObject.length; i++) {
                var item = cachedObject[i];
                if (argsKeys.length && findCacheDiff(item))
                    continue;
                cached = item._value;
                break;
            }
        }
        if (!cached && this.all) {
            // Not in the cache, but we already know all the occurrences,
            // so we can find the correct dates from the cached ones.
            var iterResult = new iterresult(what, args);
            for (var i = 0; i < this.all.length; i++) {
                if (!iterResult.accept(this.all[i]))
                    break;
            }
            cached = iterResult.getValue();
            this._cacheAdd(what, cached, args);
        }
        return Object(helpers["d" /* isArray */])(cached)
            ? esm_dateutil.cloneDates(cached)
            : cached instanceof Date
                ? esm_dateutil.clone(cached)
                : cached;
    };
    return Cache;
}());

//# sourceMappingURL=cache.js.map
// CONCATENATED MODULE: ./dist/esm/rrule.js












var getnlp = function () {
    // Lazy, runtime import to avoid circular refs.
    if (!getnlp._nlp) {
        getnlp._nlp = __webpack_require__(8);
    }
    return getnlp._nlp;
};
// =============================================================================
// RRule
// =============================================================================
var Days = {
    MO: new Weekday(0),
    TU: new Weekday(1),
    WE: new Weekday(2),
    TH: new Weekday(3),
    FR: new Weekday(4),
    SA: new Weekday(5),
    SU: new Weekday(6)
};
var DEFAULT_OPTIONS = {
    freq: Frequency.YEARLY,
    dtstart: null,
    interval: 1,
    wkst: Days.MO,
    count: null,
    until: null,
    tzid: null,
    bysetpos: null,
    bymonth: null,
    bymonthday: null,
    bynmonthday: null,
    byyearday: null,
    byweekno: null,
    byweekday: null,
    bynweekday: null,
    byhour: null,
    byminute: null,
    bysecond: null,
    byeaster: null
};
var rrule_defaultKeys = Object.keys(DEFAULT_OPTIONS);
/**
 *
 * @param {Options?} options - see <http://labix.org/python-dateutil/#head-cf004ee9a75592797e076752b2a889c10f445418>
 *        The only required option is `freq`, one of RRule.YEARLY, RRule.MONTHLY, ...
 * @constructor
 */
var rrule_RRule = /** @class */ (function () {
    function RRule(options, noCache) {
        if (options === void 0) { options = {}; }
        if (noCache === void 0) { noCache = false; }
        // RFC string
        this._string = null;
        this._cache = noCache ? null : new cache_Cache();
        // used by toString()
        this.origOptions = initializeOptions(options);
        var _a = parseOptions(options), parsedOptions = _a.parsedOptions, timeset = _a.timeset;
        this.options = parsedOptions;
        this.timeset = timeset;
    }
    RRule.parseText = function (text, language) {
        return getnlp().parseText(text, language);
    };
    RRule.fromText = function (text, language) {
        return getnlp().fromText(text, language);
    };
    RRule.fromString = function (str) {
        return new RRule(RRule.parseString(str) || undefined);
    };
    RRule.prototype._cacheGet = function (what, args) {
        if (!this._cache)
            return false;
        return this._cache._cacheGet(what, args);
    };
    RRule.prototype._cacheAdd = function (what, value, args) {
        if (!this._cache)
            return;
        return this._cache._cacheAdd(what, value, args);
    };
    /**
     * @param {Function} iterator - optional function that will be called
     *                   on each date that is added. It can return false
     *                   to stop the iteration.
     * @return Array containing all recurrences.
     */
    RRule.prototype.all = function (iterator) {
        if (iterator) {
            return this._iter(new callbackiterresult('all', {}, iterator));
        }
        else {
            var result = this._cacheGet('all');
            if (result === false) {
                result = this._iter(new iterresult('all', {}));
                this._cacheAdd('all', result);
            }
            return result;
        }
    };
    /**
     * Returns all the occurrences of the rrule between after and before.
     * The inc keyword defines what happens if after and/or before are
     * themselves occurrences. With inc == True, they will be included in the
     * list, if they are found in the recurrence set.
     * @return Array
     */
    RRule.prototype.between = function (after, before, inc, iterator) {
        if (inc === void 0) { inc = false; }
        if (!esm_dateutil.isValidDate(after) || !esm_dateutil.isValidDate(before))
            throw new Error('Invalid date passed in to RRule.between');
        var args = {
            before: before,
            after: after,
            inc: inc
        };
        if (iterator) {
            return this._iter(new callbackiterresult('between', args, iterator));
        }
        var result = this._cacheGet('between', args);
        if (result === false) {
            result = this._iter(new iterresult('between', args));
            this._cacheAdd('between', result, args);
        }
        return result;
    };
    /**
     * Returns the last recurrence before the given datetime instance.
     * The inc keyword defines what happens if dt is an occurrence.
     * With inc == True, if dt itself is an occurrence, it will be returned.
     * @return Date or null
     */
    RRule.prototype.before = function (dt, inc) {
        if (inc === void 0) { inc = false; }
        if (!esm_dateutil.isValidDate(dt))
            throw new Error('Invalid date passed in to RRule.before');
        var args = { dt: dt, inc: inc };
        var result = this._cacheGet('before', args);
        if (result === false) {
            result = this._iter(new iterresult('before', args));
            this._cacheAdd('before', result, args);
        }
        return result;
    };
    /**
     * Returns the first recurrence after the given datetime instance.
     * The inc keyword defines what happens if dt is an occurrence.
     * With inc == True, if dt itself is an occurrence, it will be returned.
     * @return Date or null
     */
    RRule.prototype.after = function (dt, inc) {
        if (inc === void 0) { inc = false; }
        if (!esm_dateutil.isValidDate(dt))
            throw new Error('Invalid date passed in to RRule.after');
        var args = { dt: dt, inc: inc };
        var result = this._cacheGet('after', args);
        if (result === false) {
            result = this._iter(new iterresult('after', args));
            this._cacheAdd('after', result, args);
        }
        return result;
    };
    /**
     * Returns the number of recurrences in this set. It will have go trough
     * the whole recurrence, if this hasn't been done before.
     */
    RRule.prototype.count = function () {
        return this.all().length;
    };
    /**
     * Converts the rrule into its string representation
     * @see <http://www.ietf.org/rfc/rfc2445.txt>
     * @return String
     */
    RRule.prototype.toString = function () {
        return optionsToString(this.origOptions);
    };
    /**
     * Will convert all rules described in nlp:ToText
     * to text.
     */
    RRule.prototype.toText = function (gettext, language) {
        return getnlp().toText(this, gettext, language);
    };
    RRule.prototype.isFullyConvertibleToText = function () {
        return getnlp().isFullyConvertible(this);
    };
    /**
     * @return a RRule instance with the same freq and options
     *          as this one (cache is not cloned)
     */
    RRule.prototype.clone = function () {
        return new RRule(this.origOptions);
    };
    RRule.prototype._iter = function (iterResult) {
        /* Since JavaScript doesn't have the python's yield operator (<1.7),
            we use the IterResult object that tells us when to stop iterating.
    
        */
        var _a, _b;
        var dtstart = this.options.dtstart;
        var date = new esm_dateutil.DateTime(dtstart.getUTCFullYear(), dtstart.getUTCMonth() + 1, dtstart.getUTCDate(), dtstart.getUTCHours(), dtstart.getUTCMinutes(), dtstart.getUTCSeconds(), dtstart.valueOf() % 1000);
        // Some local variables to speed things up a bit
        var _c = this.options, freq = _c.freq, interval = _c.interval, wkst = _c.wkst, until = _c.until, bymonth = _c.bymonth, byweekno = _c.byweekno, byyearday = _c.byyearday, byweekday = _c.byweekday, byeaster = _c.byeaster, bymonthday = _c.bymonthday, bynmonthday = _c.bynmonthday, bysetpos = _c.bysetpos, byhour = _c.byhour, byminute = _c.byminute, bysecond = _c.bysecond;
        var ii = new iterinfo(this);
        ii.rebuild(date.year, date.month);
        var getdayset = (_a = {},
            _a[RRule.YEARLY] = ii.ydayset,
            _a[RRule.MONTHLY] = ii.mdayset,
            _a[RRule.WEEKLY] = ii.wdayset,
            _a[RRule.DAILY] = ii.ddayset,
            _a[RRule.HOURLY] = ii.ddayset,
            _a[RRule.MINUTELY] = ii.ddayset,
            _a[RRule.SECONDLY] = ii.ddayset,
            _a)[freq];
        var timeset;
        var gettimeset;
        if (freq < RRule.HOURLY) {
            timeset = this.timeset;
        }
        else {
            gettimeset = (_b = {},
                _b[RRule.HOURLY] = ii.htimeset,
                _b[RRule.MINUTELY] = ii.mtimeset,
                _b[RRule.SECONDLY] = ii.stimeset,
                _b)[freq];
            if ((freq >= RRule.HOURLY &&
                Object(helpers["g" /* notEmpty */])(byhour) &&
                !Object(helpers["c" /* includes */])(byhour, date.hour)) ||
                (freq >= RRule.MINUTELY &&
                    Object(helpers["g" /* notEmpty */])(byminute) &&
                    !Object(helpers["c" /* includes */])(byminute, date.minute)) ||
                (freq >= RRule.SECONDLY &&
                    Object(helpers["g" /* notEmpty */])(bysecond) &&
                    !Object(helpers["c" /* includes */])(bysecond, date.second))) {
                timeset = [];
            }
            else {
                timeset = gettimeset.call(ii, date.hour, date.minute, date.second, date.millisecond);
            }
        }
        var currentDay;
        var count = this.options.count;
        var pos;
        while (true) {
            // Get dayset with the right frequency
            var _d = getdayset.call(ii, date.year, date.month, date.day), dayset = _d[0], start = _d[1], end = _d[2];
            // Do the "hard" work ;-)
            var filtered = false;
            for (var dayCounter = start; dayCounter < end; dayCounter++) {
                currentDay = dayset[dayCounter];
                filtered = isFiltered(bymonth, ii, currentDay, byweekno, byweekday, byeaster, bymonthday, bynmonthday, byyearday);
                if (filtered)
                    dayset[currentDay] = null;
            }
            // Output results
            if (Object(helpers["g" /* notEmpty */])(bysetpos) && Object(helpers["g" /* notEmpty */])(timeset)) {
                var daypos = void 0;
                var timepos = void 0;
                var poslist = [];
                for (var j = 0; j < bysetpos.length; j++) {
                    pos = bysetpos[j];
                    if (pos < 0) {
                        daypos = Math.floor(pos / timeset.length);
                        timepos = Object(helpers["i" /* pymod */])(pos, timeset.length);
                    }
                    else {
                        daypos = Math.floor((pos - 1) / timeset.length);
                        timepos = Object(helpers["i" /* pymod */])(pos - 1, timeset.length);
                    }
                    var tmp = [];
                    for (var k = start; k < end; k++) {
                        var val = dayset[k];
                        if (!Object(helpers["f" /* isPresent */])(val))
                            continue;
                        tmp.push(val);
                    }
                    var i = void 0;
                    if (daypos < 0) {
                        // we're trying to emulate python's aList[-n]
                        i = tmp.slice(daypos)[0];
                    }
                    else {
                        i = tmp[daypos];
                    }
                    var time = timeset[timepos];
                    var date_1 = esm_dateutil.fromOrdinal(ii.yearordinal + i);
                    var res = esm_dateutil.combine(date_1, time);
                    // XXX: can this ever be in the array?
                    // - compare the actual date instead?
                    if (!Object(helpers["c" /* includes */])(poslist, res))
                        poslist.push(res);
                }
                esm_dateutil.sort(poslist);
                for (var j = 0; j < poslist.length; j++) {
                    var res = poslist[j];
                    if (until && res > until) {
                        return this.emitResult(iterResult);
                    }
                    if (res >= dtstart) {
                        var rezonedDate = this.rezoneIfNeeded(res);
                        if (!iterResult.accept(rezonedDate)) {
                            return this.emitResult(iterResult);
                        }
                        if (count) {
                            --count;
                            if (!count) {
                                return this.emitResult(iterResult);
                            }
                        }
                    }
                }
            }
            else {
                for (var j = start; j < end; j++) {
                    currentDay = dayset[j];
                    if (!Object(helpers["f" /* isPresent */])(currentDay)) {
                        continue;
                    }
                    var date_2 = esm_dateutil.fromOrdinal(ii.yearordinal + currentDay);
                    for (var k = 0; k < timeset.length; k++) {
                        var time = timeset[k];
                        var res = esm_dateutil.combine(date_2, time);
                        if (until && res > until) {
                            return this.emitResult(iterResult);
                        }
                        if (res >= dtstart) {
                            var rezonedDate = this.rezoneIfNeeded(res);
                            if (!iterResult.accept(rezonedDate)) {
                                return this.emitResult(iterResult);
                            }
                            if (count) {
                                --count;
                                if (!count) {
                                    return this.emitResult(iterResult);
                                }
                            }
                        }
                    }
                }
            }
            // Handle frequency and interval
            if (freq === RRule.YEARLY) {
                date.addYears(interval);
            }
            else if (freq === RRule.MONTHLY) {
                date.addMonths(interval);
            }
            else if (freq === RRule.WEEKLY) {
                date.addWeekly(interval, wkst);
            }
            else if (freq === RRule.DAILY) {
                date.addDaily(interval);
            }
            else if (freq === RRule.HOURLY) {
                date.addHours(interval, filtered, byhour);
                // @ts-ignore
                timeset = gettimeset.call(ii, date.hour, date.minute, date.second);
            }
            else if (freq === RRule.MINUTELY) {
                if (date.addMinutes(interval, filtered, byhour, byminute)) {
                    filtered = false;
                }
                // @ts-ignore
                timeset = gettimeset.call(ii, date.hour, date.minute, date.second);
            }
            else if (freq === RRule.SECONDLY) {
                if (date.addSeconds(interval, filtered, byhour, byminute, bysecond)) {
                    filtered = false;
                }
                // @ts-ignore
                timeset = gettimeset.call(ii, date.hour, date.minute, date.second);
            }
            if (date.year > esm_dateutil.MAXYEAR) {
                return this.emitResult(iterResult);
            }
            ii.rebuild(date.year, date.month);
        }
    };
    RRule.prototype.emitResult = function (iterResult) {
        this._len = iterResult.total;
        return iterResult.getValue();
    };
    RRule.prototype.rezoneIfNeeded = function (date) {
        return new datewithzone_DateWithZone(date, this.options.tzid).rezonedDate();
    };
    // RRule class 'constants'
    RRule.FREQUENCIES = [
        'YEARLY',
        'MONTHLY',
        'WEEKLY',
        'DAILY',
        'HOURLY',
        'MINUTELY',
        'SECONDLY'
    ];
    RRule.YEARLY = Frequency.YEARLY;
    RRule.MONTHLY = Frequency.MONTHLY;
    RRule.WEEKLY = Frequency.WEEKLY;
    RRule.DAILY = Frequency.DAILY;
    RRule.HOURLY = Frequency.HOURLY;
    RRule.MINUTELY = Frequency.MINUTELY;
    RRule.SECONDLY = Frequency.SECONDLY;
    RRule.MO = Days.MO;
    RRule.TU = Days.TU;
    RRule.WE = Days.WE;
    RRule.TH = Days.TH;
    RRule.FR = Days.FR;
    RRule.SA = Days.SA;
    RRule.SU = Days.SU;
    RRule.parseString = parseString;
    RRule.optionsToString = optionsToString;
    return RRule;
}());
/* harmony default export */ var esm_rrule = (rrule_RRule);
function isFiltered(bymonth, ii, currentDay, byweekno, byweekday, byeaster, bymonthday, bynmonthday, byyearday) {
    return ((Object(helpers["g" /* notEmpty */])(bymonth) && !Object(helpers["c" /* includes */])(bymonth, ii.mmask[currentDay])) ||
        (Object(helpers["g" /* notEmpty */])(byweekno) && !ii.wnomask[currentDay]) ||
        (Object(helpers["g" /* notEmpty */])(byweekday) && !Object(helpers["c" /* includes */])(byweekday, ii.wdaymask[currentDay])) ||
        (Object(helpers["g" /* notEmpty */])(ii.nwdaymask) && !ii.nwdaymask[currentDay]) ||
        (byeaster !== null && !Object(helpers["c" /* includes */])(ii.eastermask, currentDay)) ||
        ((Object(helpers["g" /* notEmpty */])(bymonthday) || Object(helpers["g" /* notEmpty */])(bynmonthday)) &&
            !Object(helpers["c" /* includes */])(bymonthday, ii.mdaymask[currentDay]) &&
            !Object(helpers["c" /* includes */])(bynmonthday, ii.nmdaymask[currentDay])) ||
        (Object(helpers["g" /* notEmpty */])(byyearday) &&
            ((currentDay < ii.yearlen &&
                !Object(helpers["c" /* includes */])(byyearday, currentDay + 1) &&
                !Object(helpers["c" /* includes */])(byyearday, -ii.yearlen + currentDay)) ||
                (currentDay >= ii.yearlen &&
                    !Object(helpers["c" /* includes */])(byyearday, currentDay + 1 - ii.yearlen) &&
                    !Object(helpers["c" /* includes */])(byyearday, -ii.nextyearlen + currentDay - ii.yearlen)))));
}
//# sourceMappingURL=rrule.js.map
// CONCATENATED MODULE: ./dist/esm/rruleset.js
var rruleset_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var rruleset_RRuleSet = /** @class */ (function (_super) {
    rruleset_extends(RRuleSet, _super);
    /**
     *
     * @param {Boolean?} noCache
     *  The same stratagy as RRule on cache, default to false
     * @constructor
     */
    function RRuleSet(noCache) {
        if (noCache === void 0) { noCache = false; }
        var _this = _super.call(this, {}, noCache) || this;
        _this._rrule = [];
        _this._rdate = [];
        _this._exrule = [];
        _this._exdate = [];
        return _this;
    }
    RRuleSet.prototype.tzid = function (tzid) {
        if (tzid !== undefined) {
            this._tzid = tzid;
        }
        if (this._tzid !== undefined) {
            return this._tzid;
        }
        for (var i = 0; i < this._rrule.length; i++) {
            var tzid_1 = this._rrule[i].origOptions.tzid;
            if (tzid_1) {
                return tzid_1;
            }
        }
        return undefined;
    };
    /**
     * Adds an RRule to the set
     *
     * @param {RRule}
     */
    RRuleSet.prototype.rrule = function (rrule) {
        if (!(rrule instanceof esm_rrule)) {
            throw new TypeError(String(rrule) + ' is not RRule instance');
        }
        if (!Object(helpers["c" /* includes */])(this._rrule.map(String), String(rrule))) {
            this._rrule.push(rrule);
        }
    };
    /**
     * Adds an RDate to the set
     *
     * @param {Date}
     */
    RRuleSet.prototype.rdate = function (date) {
        if (!(date instanceof Date)) {
            throw new TypeError(String(date) + ' is not Date instance');
        }
        if (!Object(helpers["c" /* includes */])(this._rdate.map(Number), Number(date))) {
            this._rdate.push(date);
            esm_dateutil.sort(this._rdate);
        }
    };
    /**
     * Adds an EXRULE to the set
     *
     * @param {RRule}
     */
    RRuleSet.prototype.exrule = function (rrule) {
        if (!(rrule instanceof esm_rrule)) {
            throw new TypeError(String(rrule) + ' is not RRule instance');
        }
        if (!Object(helpers["c" /* includes */])(this._exrule.map(String), String(rrule))) {
            this._exrule.push(rrule);
        }
    };
    /**
     * Adds an EXDATE to the set
     *
     * @param {Date}
     */
    RRuleSet.prototype.exdate = function (date) {
        if (!(date instanceof Date)) {
            throw new TypeError(String(date) + ' is not Date instance');
        }
        if (!Object(helpers["c" /* includes */])(this._exdate.map(Number), Number(date))) {
            this._exdate.push(date);
            esm_dateutil.sort(this._exdate);
        }
    };
    RRuleSet.prototype.rdatesToString = function (param, rdates) {
        var tzid = this.tzid();
        var isUTC = !tzid || tzid.toUpperCase() === 'UTC';
        var header = isUTC ? param + ":" : param + ";TZID=" + tzid + ":";
        var dateString = rdates
            .map(function (rdate) { return esm_dateutil.timeToUntilString(rdate.valueOf(), isUTC); })
            .join(',');
        return "" + header + dateString;
    };
    RRuleSet.prototype.valueOf = function () {
        var result = [];
        this._rrule.forEach(function (rrule) {
            result = result.concat(rrule.toString().split('\n'));
        });
        if (this._rdate.length) {
            result.push(this.rdatesToString('RDATE', this._rdate));
        }
        this._exrule.forEach(function (exrule) {
            result = result.concat(exrule.toString().split('\n')
                .map(function (line) { return line.replace(/^RRULE:/, 'EXRULE:'); })
                .filter(function (line) { return !/^DTSTART/.test(line); }));
        });
        if (this._exdate.length) {
            result.push(this.rdatesToString('EXDATE', this._exdate));
        }
        return result;
    };
    /**
     * to generate recurrence field such as:
     *   DTSTART:19970902T010000Z
     *   RRULE:FREQ=YEARLY;COUNT=2;BYDAY=TU
     *   RRULE:FREQ=YEARLY;COUNT=1;BYDAY=TH
     */
    RRuleSet.prototype.toString = function () {
        return this.valueOf().join('\n');
    };
    RRuleSet.prototype._iter = function (iterResult) {
        var _exdateHash = {};
        var _exrule = this._exrule;
        var _accept = iterResult.accept;
        var tzid = this.tzid();
        function evalExdate(after, before) {
            _exrule.forEach(function (rrule) {
                rrule.between(after, before, true).forEach(function (date) {
                    _exdateHash[Number(date)] = true;
                });
            });
        }
        this._exdate.forEach(function (date) {
            var zonedDate = new datewithzone_DateWithZone(date, tzid).rezonedDate();
            _exdateHash[Number(zonedDate)] = true;
        });
        iterResult.accept = function (date) {
            var dt = Number(date);
            if (!_exdateHash[dt]) {
                evalExdate(new Date(dt - 1), new Date(dt + 1));
                if (!_exdateHash[dt]) {
                    _exdateHash[dt] = true;
                    return _accept.call(this, date);
                }
            }
            return true;
        };
        if (iterResult.method === 'between') {
            evalExdate(iterResult.args.after, iterResult.args.before);
            iterResult.accept = function (date) {
                var dt = Number(date);
                if (!_exdateHash[dt]) {
                    _exdateHash[dt] = true;
                    return _accept.call(this, date);
                }
                return true;
            };
        }
        for (var i = 0; i < this._rdate.length; i++) {
            var zonedDate = new datewithzone_DateWithZone(this._rdate[i], tzid).rezonedDate();
            if (!iterResult.accept(new Date(zonedDate.getTime())))
                break;
        }
        this._rrule.forEach(function (rrule) {
            rrule._iter(iterResult);
        });
        var res = iterResult._result;
        esm_dateutil.sort(res);
        switch (iterResult.method) {
            case 'all':
            case 'between':
                return res;
            case 'before':
                return (res.length && res[res.length - 1]) || null;
            case 'after':
                return (res.length && res[0]) || null;
            default:
                return null;
        }
    };
    /**
     * Create a new RRuleSet Object completely base on current instance
     */
    RRuleSet.prototype.clone = function () {
        var rrs = new RRuleSet(!!this._cache);
        var i;
        for (i = 0; i < this._rrule.length; i++) {
            rrs.rrule(this._rrule[i].clone());
        }
        for (i = 0; i < this._rdate.length; i++) {
            rrs.rdate(new Date(this._rdate[i].getTime()));
        }
        for (i = 0; i < this._exrule.length; i++) {
            rrs.exrule(this._exrule[i].clone());
        }
        for (i = 0; i < this._exdate.length; i++) {
            rrs.exdate(new Date(this._exdate[i].getTime()));
        }
        return rrs;
    };
    return RRuleSet;
}(esm_rrule));
/* harmony default export */ var rruleset = (rruleset_RRuleSet);
//# sourceMappingURL=rruleset.js.map
// CONCATENATED MODULE: ./dist/esm/rrulestr.js
var rrulestr_assign = (undefined && undefined.__assign) || function () {
    rrulestr_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return rrulestr_assign.apply(this, arguments);
};





/**
 * RRuleStr
 *  To parse a set of rrule strings
 */
var rrulestr_DEFAULT_OPTIONS = {
    dtstart: null,
    cache: false,
    unfold: false,
    forceset: false,
    compatible: false,
    tzid: null
};
function parseInput(s, options) {
    var rrulevals = [];
    var rdatevals = [];
    var exrulevals = [];
    var exdatevals = [];
    var _a = parseDtstart(s), dtstart = _a.dtstart, tzid = _a.tzid;
    var lines = splitIntoLines(s, options.unfold);
    lines.forEach(function (line) {
        if (!line)
            return;
        var _a = breakDownLine(line), name = _a.name, parms = _a.parms, value = _a.value;
        switch (name.toUpperCase()) {
            case 'RRULE':
                if (parms.length) {
                    throw new Error("unsupported RRULE parm: " + parms.join(','));
                }
                rrulevals.push(parseString(line));
                break;
            case 'RDATE':
                var _b = /RDATE(?:;TZID=([^:=]+))?/i.exec(line), _ = _b[0], rdateTzid = _b[1];
                if (rdateTzid && !tzid) {
                    tzid = rdateTzid;
                }
                rdatevals = rdatevals.concat(parseRDate(value, parms));
                break;
            case 'EXRULE':
                if (parms.length) {
                    throw new Error("unsupported EXRULE parm: " + parms.join(','));
                }
                exrulevals.push(parseString(value));
                break;
            case 'EXDATE':
                exdatevals = exdatevals.concat(parseRDate(value, parms));
                break;
            case 'DTSTART':
                break;
            default:
                throw new Error('unsupported property: ' + name);
        }
    });
    return {
        // @ts-ignore
        dtstart: dtstart,
        // @ts-ignore
        tzid: tzid,
        rrulevals: rrulevals,
        rdatevals: rdatevals,
        exrulevals: exrulevals,
        exdatevals: exdatevals
    };
}
function buildRule(s, options) {
    var _a = parseInput(s, options), rrulevals = _a.rrulevals, rdatevals = _a.rdatevals, exrulevals = _a.exrulevals, exdatevals = _a.exdatevals, dtstart = _a.dtstart, tzid = _a.tzid;
    var noCache = options.cache === false;
    if (options.compatible) {
        options.forceset = true;
        options.unfold = true;
    }
    if (options.forceset ||
        rrulevals.length > 1 ||
        rdatevals.length ||
        exrulevals.length ||
        exdatevals.length) {
        var rset_1 = new rruleset(noCache);
        rset_1.tzid(tzid || undefined);
        rrulevals.forEach(function (val) {
            rset_1.rrule(new esm_rrule(groomRruleOptions(val, dtstart, tzid), noCache));
        });
        rdatevals.forEach(function (date) {
            rset_1.rdate(date);
        });
        exrulevals.forEach(function (val) {
            rset_1.exrule(new esm_rrule(groomRruleOptions(val, dtstart, tzid), noCache));
        });
        exdatevals.forEach(function (date) {
            rset_1.exdate(date);
        });
        // @ts-ignore
        if (options.compatible && options.dtstart)
            rset_1.rdate(dtstart);
        return rset_1;
    }
    var val = rrulevals[0];
    return new esm_rrule(groomRruleOptions(val, val.dtstart || options.dtstart || dtstart, val.tzid || options.tzid || tzid), noCache);
}
function rrulestr(s, options) {
    if (options === void 0) { options = {}; }
    return buildRule(s, rrulestr_initializeOptions(options));
}
function groomRruleOptions(val, dtstart, tzid) {
    return rrulestr_assign({}, val, { dtstart: dtstart,
        tzid: tzid });
}
function rrulestr_initializeOptions(options) {
    var invalid = [];
    var keys = Object.keys(options);
    var defaultKeys = Object.keys(rrulestr_DEFAULT_OPTIONS);
    keys.forEach(function (key) {
        if (!Object(helpers["c" /* includes */])(defaultKeys, key))
            invalid.push(key);
    });
    if (invalid.length) {
        throw new Error('Invalid options: ' + invalid.join(', '));
    }
    var initializedOptions = rrulestr_assign({}, options);
    // Merge in default options
    defaultKeys.forEach(function (key) {
        if (!Object(helpers["c" /* includes */])(keys, key))
            initializedOptions[key] = rrulestr_DEFAULT_OPTIONS[key];
    });
    return initializedOptions;
}
function extractName(line) {
    if (line.indexOf(':') === -1) {
        return {
            name: 'RRULE',
            value: line
        };
    }
    var _a = Object(helpers["l" /* split */])(line, ':', 1), name = _a[0], value = _a[1];
    return {
        name: name,
        value: value
    };
}
function breakDownLine(line) {
    var _a = extractName(line), name = _a.name, value = _a.value;
    var parms = name.split(';');
    if (!parms)
        throw new Error('empty property name');
    return {
        name: parms[0].toUpperCase(),
        parms: parms.slice(1),
        value: value
    };
}
function splitIntoLines(s, unfold) {
    if (unfold === void 0) { unfold = false; }
    s = s && s.trim();
    if (!s)
        throw new Error('Invalid empty string');
    // More info about 'unfold' option
    // Go head to http://www.ietf.org/rfc/rfc2445.txt
    if (!unfold) {
        return s.split(/\s/);
    }
    var lines = s.split('\n');
    var i = 0;
    while (i < lines.length) {
        // TODO
        var line = (lines[i] = lines[i].replace(/\s+$/g, ''));
        if (!line) {
            lines.splice(i, 1);
        }
        else if (i > 0 && line[0] === ' ') {
            lines[i - 1] += line.slice(1);
            lines.splice(i, 1);
        }
        else {
            i += 1;
        }
    }
    return lines;
}
function validateDateParm(parms) {
    parms.forEach(function (parm) {
        if (!/(VALUE=DATE(-TIME)?)|(TZID=)/.test(parm)) {
            throw new Error('unsupported RDATE/EXDATE parm: ' + parm);
        }
    });
}
function parseRDate(rdateval, parms) {
    validateDateParm(parms);
    return rdateval
        .split(',')
        .map(function (datestr) { return esm_dateutil.untilStringToDate(datestr); });
}
//# sourceMappingURL=rrulestr.js.map
// CONCATENATED MODULE: ./dist/esm/index.js
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Frequency", function() { return Frequency; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Weekday", function() { return Weekday; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "RRule", function() { return esm_rrule; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "RRuleSet", function() { return rruleset; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "rrulestr", function() { return rrulestr; });
/*!
 * rrule.js - Library for working with recurrence rules for calendar dates.
 * https://github.com/jakubroztocil/rrule
 *
 * Copyright 2010, Jakub Roztocil and Lars Schoning
 * Licenced under the BSD licence.
 * https://github.com/jakubroztocil/rrule/blob/master/LICENCE
 *
 * Based on:
 * python-dateutil - Extensions to the standard Python datetime module.
 * Copyright (c) 2003-2011 - Gustavo Niemeyer <gustavo@niemeyer.net>
 * Copyright (c) 2012 - Tomi Pieviläinen <tomi.pievilainen@iki.fi>
 * https://github.com/jakubroztocil/rrule/blob/master/LICENCE
 *
 */





// =============================================================================
// Export
// =============================================================================

/* harmony default export */ var esm = __webpack_exports__["default"] = (esm_rrule);
//# sourceMappingURL=index.js.map

/***/ }