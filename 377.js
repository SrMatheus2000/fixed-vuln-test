function unique_name_191(instance, ctxt) {
  ctxt = _.extend(ctxt, instance.die ? instance.die.context : {})

  var diecount = 0

  var die = function(err) {
    var so = instance.options()
    var test = so.test

    // undead is only for testing, do not use in production
    var undead = (so.debug && so.debug.undead) || (err && err.undead)
    var full =
      (so.debug && so.debug.print && 'full' === so.debug.print.fatal) || false
    var print_env = (so.debug && so.debug.print.env) || false

    if (0 < diecount) {
      if (!undead) {
        throw error(err, '[DEATH LOOP] die count: ' + diecount)
      }
      return
    } else {
      diecount++
    }

    try {
      if (!err) {
        err = new Error('unknown')
      } else if (!Util.isError(err)) {
        err = new Error(_.isString(err) ? err : Util.inspect(err))
      }

      err.fatal$ = true

      var logdesc = {
        kind: ctxt.txt || 'fatal',
        level: ctxt.level || 'fatal',
        plugin: ctxt.plugin,
        tag: ctxt.tag,
        id: ctxt.id,
        code: err.code || 'fatal',
        notice: err.message,
        err: err,
        callpoint: ctxt.callpoint && ctxt.callpoint()
      }

      instance.log.fatal.call(instance, logdesc)

      var stack = err.stack || ''
      stack = stack
        .substring(stack.indexOf('\n') + 5)
        .replace(/\n\s+/g, '\n               ')

      var procdesc =
        'pid=' +
        process.pid +
        ', arch=' +
        process.arch +
        ', platform=' +
        process.platform +
        (!full ? '' : ', path=' + process.execPath) +
        ', argv=' +
        Util.inspect(process.argv).replace(/\n/g, '') +
        (!full
          ? ''
          : !print_env
          ? ''
          : ', env=' + Util.inspect(process.env).replace(/\n/g, ''))

      var when = new Date()

      var stderrmsg =
        '\n\n' +
        '=== SENECA FATAL ERROR ===' +
        '\nMESSAGE   :::  ' +
        err.message +
        '\nCODE      :::  ' +
        err.code +
        '\nINSTANCE  :::  ' +
        instance.toString() +
        '\nDETAILS   :::  ' +
        Util.inspect(
          full ? err.details : _.omit(clean(err.details), ['instance']),
          { depth: null }
        ).replace(/\n/g, '\n               ') +
        '\nSTACK     :::  ' +
        stack +
        '\nWHEN      :::  ' +
        when.toISOString() +
        ', ' +
        when.getTime() +
        '\nLOG       :::  ' +
        Jsonic.stringify(logdesc) +
        '\nNODE      :::  ' +
        process.version +
        ', ' +
        process.title +
        (!full
          ? ''
          : ', ' +
            Util.inspect(process.versions).replace(/\s+/g, ' ') +
            ', ' +
            Util.inspect(process.features).replace(/\s+/g, ' ') +
            ', ' +
            Util.inspect(process.moduleLoadList).replace(/\s+/g, ' ')) +
        '\nPROCESS   :::  ' +
        procdesc +
        '\nFOLDER    :::  ' +
        process.env.PWD

      if (so.errhandler) {
        so.errhandler.call(instance, err)
      }

      if (instance.flags.closed) {
        return
      }

      if (!undead) {
        instance.act('role:seneca,info:fatal,closing$:true', { err: err })

        instance.close(
          // terminate process, err (if defined) is from seneca.close
          function(close_err) {
            if (!undead) {
              process.nextTick(function() {
                if (close_err) {
                  instance.log.fatal({
                    kind: 'close',
                    err: Util.inspect(close_err)
                  })
                }

                if (test) {
                  if (close_err) {
                    Print.err(close_err)
                  }

                  Print.err(stderrmsg)
                  Print.err(
                    '\nSENECA TERMINATED at ' +
                      new Date().toISOString() +
                      '. See above for error report.\n'
                  )
                }

                so.system.exit(1)
              })
            }
          }
        )
      }

      // make sure we close down within options.death_delay seconds
      if (!undead) {
        var killtimer = setTimeout(function() {
          instance.log.fatal({ kind: 'close', timeout: true })

          if (so.test) {
            Print.err(stderrmsg)
            Print.err(
              '\n\nSENECA TERMINATED (on timeout) at ' +
                new Date().toISOString() +
                '.\n\n'
            )
          }

          so.system.exit(2)
        }, so.death_delay)

        if (killtimer.unref) {
          killtimer.unref()
        }
      }
    } catch (panic) {
      this.log.fatal({
        kind: 'panic',
        panic: Util.inspect(panic),
        orig: arguments[0]
      })

      if (so.test) {
        var msg =
          '\n\n' +
          'Seneca Panic\n' +
          '============\n\n' +
          panic.stack +
          '\n\nOriginal Error:\n' +
          (arguments[0] && arguments[0].stack
            ? arguments[0].stack
            : arguments[0])
        Print.err(msg)
      }
    }
  }

  die.context = ctxt

  return die
}