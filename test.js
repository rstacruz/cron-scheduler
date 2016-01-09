var test = require('tape')
var cron = require('./index')
var moment = require('moment-timezone')
cron.debug(console.log.bind(console))

test('cron', function (t) {
  var job = cron({ on: '0 9 * * *' }, function () {})
  job.stop()
  t.end()
})
