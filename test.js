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

test('cron with long delay', function (t) {
  sandbox(function (sinon, clock) {
    var clock = sinon.useFakeTimers()
    t.ok(+new Date() === 0, 'sinon timers is working')

    // HACK sinon timers do not implement the 2147483647ms limit, but we need it to make this test genuine
    var oldSetTimeout = setTimeout
    setTimeout = function(func, timeout) {
      if (timeout < 1 || timeout > 2147483647) timeout = 1

      return oldSetTimeout(func, timeout)
    }

    var cron = rerequire('./index')

    // we architect it in a way to have about three months until the next execution
    var called = false
    var job = cron({ on: '0 1 31 3 *', timezone: 'GMT' }, function () {
      t.fail('called')
      called = true
    })

    clock.tick(3600 * 1000)
    if (!called) t.pass('not called')
    job.stop()
    t.end()
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
