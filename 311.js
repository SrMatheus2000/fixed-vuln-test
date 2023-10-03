function unique_name_154 (port, host) {
    var server = require('http').createServer(function (req, res) {
      // NOTE: we're still using domains here intentionally,
      // we have tried to avoid its usage but unfortunately there is no other way to
      // ensure that we are handling all kind of errors that can occur in an external script,
      // but everything is ok because node.js will only remove domains when they found an alternative
      // and when that time comes, we just need to migrate to that alternative.
      var d = domain.create()

      d.on('error', function (er) {
        try {
          // make sure we close down within 30 seconds
          var killtimer = setTimeout(function () {
            process.exit(1)
          }, 30000)

          // But don't keep the process open just for that!
          killtimer.unref()

          // stop taking new requests.
          server.close()

          // Let the master know we're dead.  This will trigger a
          // 'disconnect' in the cluster master, and then it will fork
          // a new worker.
          if (cluster) {
            cluster.worker.disconnect()
          }

          error(res, er)
        } catch (er2) {
          // oh well, not much we can do at this point.
          console.error('Error sending 500!', er2.stack)
        }
      })

      d.add(req)
      d.add(res)
      d.req = req

      d.run(function () {
        processRequest(workersClusterId, req, res)
      })
    })

    server.timeout = 0
    server.listen(port, host)
  }