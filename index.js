var cronConverter = require('cron-converter')
var moment = require('moment-timezone')
var ms = require('pretty-ms')
var Promise = require('any-promise')
var debug = function () {}

/*
 * Starts a cronjob.
 */

var cron = function (options, fn) {
  var crontime, timezone, name, started, timer
  init()
  return { stop: stop, run: run, next: next }

  function init () {
    if (!options || !options.on) {
      throw new Error('cron-scheduler: expected an options object with `on`')
    }

    if (typeof fn !== 'function') {
      throw new Error('cron-scheduler: expected function')
    }

    crontime = new cronConverter()
    crontime.fromString(options.on)
    timezone = options.timezone
    name = options.name || fn.name || options.on
    started = true
    schedule()
  }

  function schedule () {
    var future = next()
    var delta = Math.max(future.diff(moment()), 1000)

    debug(name + ': next run in ' + ms(delta) +
      ' at ' + future.format('llll Z'))

    if (timer) clearTimeout(timer)
    timer = setTimeout(run, delta)
  }

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

  function run () {
    debug(name + ': starting')
    var start = new Date()
    Promise.resolve(fn())
      .then(function () {
        var elapsed = +new Date() - start
        debug(name + ': OK in ' + ms(elapsed))
        if (started) schedule()
      })
      .catch(function (err) {
        var elapsed = +new Date() - start
        debug(name + ': FAILED in ' + ms(elapsed))
        throw err
      })
  }

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
