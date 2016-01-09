var test = require('tape')
var sandbox = require('sinon-in-sandbox')

test('cron', function (t) {
  sandbox(function (sinon, clock) {
    var clock = sinon.useFakeTimers()
    t.ok(+new Date() === 0, 'sinon timers is working')

    var cron = rerequire('./index')

    var job = cron({ on: '0 1 * * *', timezone: 'GMT' }, function () {
      t.pass('called')
      job.stop()
      t.end()
    })

    clock.tick(3600 * 1000)
  })
})

test('cron timezones', function (t) {
  sandbox(function (sinon) {
    var clock = sinon.useFakeTimers()
    var cron = rerequire('./index')

    // Asia/Manila is +0800 GMT, so this is 1AM GMT
    var job = cron({ on: '0 9 * * *', timezone: 'Asia/Manila' }, function () {
      t.pass('called')
      job.stop()
      t.end()
    })

    clock.tick(3600 * 1000)
  })
})

/*
 * substitute for require() that will not cache its result, so it make be
 * re-required again in the future. we need this so that cron/moment will
 * pick up the sandboxed Date object.
 */

function rerequire (mod) {
  var keys = Object.keys(require.cache)
  var result = require(mod)
  Object.keys(require.cache).forEach(function (key) {
    if (keys.indexOf(key) === -1) delete require.cache[key]
  })
  return result
}
