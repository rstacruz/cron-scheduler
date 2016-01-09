var cronConverter = require('cron-converter')
var moment = require('moment-timezone')
var ms = require('pretty-ms')
var Promise = require('any-promise')
var debug = function () {}

/*
 * Starts a cronjob.
 */

var cron = function (options, fn) {
  var crontime, timezone, name, started
  init()
  return { stop, run }

  function init () {
    if (!options || !options.on) {
      throw new Error('cron-scheduler: expected an options object with `on`')
    }

    crontime = new cronConverter()
    crontime.fromString(options.on)
    timezone = options.timezone
    name = options.name || fn.name || cron.on
    started = true
    schedule()
  }

  function schedule () {
    var now = moment()
    if (timezone) now = now.tz(timezone)
    now = now.add(1, 'minute')

    var next = crontime.next(now)
    var delta = Math.max(+next - new Date(), 1000)

    var nextDate = timezone ? moment.tz(next, timezone) : moment(next)
    debug(name + ': next run in ' + ms(delta) +
      ' at ' + nextDate.format('llll Z'))

    setTimeout(run, delta)
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
