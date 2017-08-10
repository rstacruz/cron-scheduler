var CronConverter = require('cron-converter')
var moment = require('moment-timezone')
var ms = require('pretty-ms')
var Promise = require('any-promise')
var lt = require('long-timeout')
var debug = function () {}

/*
 * Starts a cronjob.
 */

function cron (options, fn) {
  var crontime, timezone, name, started, timer
  init()
  return { stop: stop, run: run, next: next }

  /*
   * Constructor.
   */

  function init () {
    if (!options || !options.on) {
      throw new Error('cron-scheduler: expected an options object with `on`')
    }

    if (typeof fn !== 'function') {
      throw new Error('cron-scheduler: expected function')
    }

    crontime = new CronConverter()
    crontime.fromString(options.on)
    timezone = options.timezone
    name = options.name || fn.name || options.on
    started = true
    schedule()
  }

  /*
   * Sets a timer to run the next iteration.
   */

  function schedule () {
    var future = next()
    var delta = Math.max(future.diff(moment()), 1000)

    debug(name + ': next run in ' + ms(delta) +
      ' at ' + future.format('llll Z'))

    if (timer) lt.clearTimeout(timer)
    timer = lt.setTimeout(run, delta)
  }

  /*
   * Returns the next scheduled iteration as a Moment date.
   */

  function next () {
    // get the time to check for. cron-converter needs an
    // extra minute so it doesn't schedule it in the past
    var now = moment()
    if (timezone) now = now.tz(timezone)
    now = now.add(1, 'minute')

    // get the next date and cast it to the timezone.
    // return it as a Moment object.
    var next = crontime.next(now)
    var date = timezone ? moment.tz(next, timezone) : moment(next)
    return date
  }

  /*
   * Runs an iteration.
   */

  function run () {
    debug(name + ': starting')
    var start = new Date()
    Promise.resolve(fn())
      .then(function () {
        debug(name + ': OK in ' + ms(elapsed()))
        if (started) schedule()
      })
      .catch(function (err) {
        debug(name + ': FAILED in ' + ms(elapsed()))
        throw err
      })

    function elapsed () { return +new Date() - start }
  }

  /*
   * ...in the name of love.
   */

  function stop () {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }

    started = false
  }
}

/*
 * Sets the debug function.
 */

cron.debug = function (fn) {
  debug = fn
}

module.exports = cron
