function unique_name_153 (cb) {
  var self = this

  this.findFreePort(function (err, port) {
    if (err) {
      return cb(err)
    }

    self.options.port = port

    var forkOptions = self.options.forkOptions || {}
    forkOptions.env = Object.assign({}, process.env, forkOptions.env || {})

    self.workersClusterId = uuid()

    forkOptions.env['SCRIPT_MANAGER_WORKERS_CLUSTER_ID'] = self.workersClusterId

    self.workersCluster = childProcess.fork(path.join(__dirname, 'worker-servers.js'), forkOptions)

    self.workersCluster.on('exit', function () {
      // manual kill
      if (!self.isStarted) {
        return
      }

      self.start(function () {

      })
    })

    self.workersCluster.on('message', function (rawM) {
      var m = messageHandler.parse(rawM)

      if (m.action === 'running') {
        self.isStarted = true
        cb()
      }
    })

    self.workersCluster.on('message', function (rawM) {
      var m = messageHandler.parse(rawM)
      var reqOptions

      if (m.action === 'callback') {
        reqOptions = self._runningRequests.find(r => r.rid === m.rid)

        if (reqOptions.isDone) {
          return
        }

        m.params.push(function () {
          if (reqOptions.isDone) {
            return
          }

          var args = Array.prototype.slice.call(arguments)

          if (args.length && args[0]) {
            args[0] = args[0].message
          }

          self.workersCluster.send(messageHandler.serialize({
            action: 'callback-response',
            cid: m.cid,
            rid: m.rid,
            params: args
          }))
        })

        reqOptions.callback.apply(self, m.params)
      }

      if (m.action === 'register') {
        reqOptions = self._runningRequests.find(r => r.rid === m.rid)

        if (!reqOptions) {
          return
        }

        // TODO we should actually kill only the script that caused timeout and resend other requests from the same worker... some more complicated logic is required here
        reqOptions.timeoutRef = setTimeout(function () {
          if (reqOptions.isDone) {
            return
          }

          reqOptions.isDone = true

          self.workersCluster.send(messageHandler.serialize({
            action: 'kill',
            rid: reqOptions.rid
          }))

          var error = new Error()
          error.weak = true
          error.message = reqOptions.timeoutErrorMessage || 'Timeout error during executing script'

          self._runningRequests = self._runningRequests.filter(r => r.rid !== reqOptions.rid)

          reqOptions.cb(error)
        }, reqOptions.timeout || self.options.timeout).unref()
      }
    })

    self.workersCluster.send(messageHandler.serialize({
      action: 'start',
      port: self.options.port,
      host: self.options.host,
      inputRequestLimit: self.options.inputRequestLimit || 200e6,
      numberOfWorkers: self.options.numberOfWorkers
    }))
  })
}