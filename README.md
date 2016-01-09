# cron-scheduler

Runs jobs.

### cron()
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

### cron.debug

> `cron.debug(function)`

Sets the debug function.

```js
cron.debug(console.log.bind(console))
```

You can pass your custom logger here. For instance, you can use the [debug][] module for prettier messages.

```js
cron.debug(require('debug')('cron'))
```

[debug]: https://www.npmjs.com/package/debug
