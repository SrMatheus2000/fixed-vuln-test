function registerAPICalls() {
    const self = this;
    const apiRoute = '/embark-api/process-logs/' + this.processName;
    this.embark.registerAPICall(
      'ws',
      apiRoute,
      (ws, _req) => {
        this.events.on('process-log-' + this.processName, function (log) {
          log.msg = self.escapeMessage(log.msg);
          log.msg_clear = self.escapeMessage(log.msg_clear);

          ws.send(JSON.stringify(log), () => {});
        });
      }
    );
    this.embark.registerAPICall(
      'get',
      '/embark-api/process-logs/' + this.processName,
      (req, res) => {
        let limit = parseInt(req.query.limit, 10);
        if (!Number.isInteger(limit)) limit = 0;
        const result = this.logHandler.logs
          .slice(limit * -1)
          .map(msg => this.escapeMessage(msg));

        res.send(JSON.stringify(result));
      }
    );
  }