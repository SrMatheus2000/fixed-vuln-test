(req, res) => {
      let url = /^http/.test(req.query.url) ? req.query.url : `http://${req.query.url}`
      let t0 = Date.now()

      function send(sample) {
        sample.time = Date.now() - t0
        res.send(JSON.stringify(sample))
      }

      Promise.race([
        fetch(url,{redirect:'manual'}),
        timeout(3000)
      ])
      .then(response => {
        if (!response.ok && !response.status==302) {
          return send({exit: 1, error: response.statusText, code: response.status})
        }
        return response.text()
      })
      .then(data => {
        return send({exit: 0, stdout:data.length})
      })
      .catch(error => {
        return send({exit: 2, error: error.message})
      })
    }