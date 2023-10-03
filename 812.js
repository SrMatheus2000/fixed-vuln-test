function unique_name_444(pid, options, done) {
    pid = parseInt(pid, 10)
    var history = this.history[pid] ? this.history[pid] : {}
    var cpu = this.cpu
    var self = this

    //Arguments to path.join must be strings
    fs.readFile(p.join('/proc', ''+pid, 'stat'), 'utf8', function(err, infos) {
      if(err) {
        return done(err, null)
      }

      //https://github.com/arunoda/node-usage/commit/a6ca74ecb8dd452c3c00ed2bde93294d7bb75aa8
      //preventing process space in name by removing values before last ) (pid (name) ...)
      var index = infos.lastIndexOf(')')
      infos = infos.substr(index + 2).split(' ')

      //according to http://man7.org/linux/man-pages/man5/proc.5.html (index 0 based - 2)
      //In kernels before Linux 2.6, start was expressed in jiffies. Since Linux 2.6, the value is expressed in clock ticks
      var stat = {
          utime: parseFloat(infos[11]),
          stime: parseFloat(infos[12]),
          cutime: parseFloat(infos[13]),
          cstime: parseFloat(infos[14]),
          start: parseFloat(infos[19]) / cpu.clock_tick,
          rss: parseFloat(infos[21])
      }

      //http://stackoverflow.com/questions/16726779/total-cpu-usage-of-an-application-from-proc-pid-stat/16736599#16736599

      var childrens = options.childrens ? stat.cutime + stat.cstime : 0

      var total = stat.stime - (history.stime || 0) + stat.utime - (history.utime || 0) + childrens

      total = total / cpu.clock_tick

      //time elapsed between calls
      var seconds = history.uptime !== undefined ? cpu.uptime - history.uptime : stat.start - cpu.uptime
      seconds = Math.abs(seconds)
      seconds = seconds === 0 ? 1 : seconds //we sure can't divide through 0

      self.history[pid] = stat
      self.history[pid].uptime = cpu.uptime

      return done(null, {
        cpu: (total / seconds) * 100,
        memory: stat.rss * cpu.pagesize
      })
    })
  }