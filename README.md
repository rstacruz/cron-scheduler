# cron-scheduler

> Runs jobs in periodic intervals

cron-scheduler is a way to run functions at specific times of the day. It runs
in Node.js as well as the browser.

It requires a Promise implementation to work. If you're on Node.js v4 or
later, you should be fine. Otherwise, you'll also need to install
[bluebird][], [rsvp][], [when][], or [q.js][].

[bluebird]: https://github.com/petkaantonov/bluebird
[rsvp]: https://www.npmjs.com/package/rsvp
[q.js]: https://github.com/kriskowal/q
[when]: https://github.com/cujojs/when

## cron()
> `cron(options, function)`

Starts a cronjob.

```js
cron({ on: '0 9 * * *' }, function () {
  console.log('this will run every 9:00am')
})
```

You can pass more options.

- `on` *(String, required)* - the schedule in cron format (`min hour day
  month day-of-week`).
- `timezone` *(String)* - the timezone to run it in.
- `name` *(String)* - identifier to show in the debug logs. Means nothing
  if debugging is off.

```js
cron({
  timezone: 'Asia/Manila'
  on: '0 9 * * *',
  name: 'dostuff'
} , function () {
  console.log('this will run every 9:00am')
})
```

The `options.on` parameter is in cron standard format. Check the [cron
cheatsheet](http://ricostacruz.com/cheatsheets/cron.html) for more details.

Any errors will be thrown, and will stop the scheduler. If this is not
what you want, you may wish to decorate the function being passed.

```js
cron({ on: '0 9 * * *' }, trap(work))

function trap (fn) {
  return function () {
    return Promise.resolve(fn.apply(this, arguments))
      .catch(function (err) {
        // do stuff.
        // this handler will work for both promise rejections
        // *and* regular errors.
      })
  }
}
```

If `function` returns a Promise, it will wait for it to finish before
scheduling the next job. If the promise is rejected, it will be an unhandled
rejection (!). You may use the same `trap()` decorator trick above to get
around this.

To stop the cronjob, just run the `stop` method returned by `cron()`.

```js
job = cron({ on: '0 12 * * *' }, work)
job.stop()
```

To manually invoke the cronjob, run the `run` method returned  by `cron()`.

```js
job = cron({ on: '0 12 * * *' }, work)
job.run()
```

## cron.debug

> `cron.debug(function)`

Sets the debug function.

```js
cron.debug(console.log.bind(console))
```

You can pass your custom logger here. For instance, you can use the [debug][]
module for prettier messages.

```js
cron.debug(require('debug')('cron'))
```

[debug]: https://www.npmjs.com/package/debug

## Thanks

**cron-scheduler** © 2016+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/cron-scheduler/contributors
