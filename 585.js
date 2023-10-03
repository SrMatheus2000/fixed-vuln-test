function block(callback) {
        const report = [];


        // Capture the flags, & ranges as a command string
        cmd = scope.command(opts, range);

        // Split up cmd for .spawn()
        const obj = cmd.split(" ");
        cmd = obj[0];
        const args = obj.slice(1);

        if (opts.verbose)
          console.log(`Running: ${cmd}`);

        // Push it on to the heap
        const execute = proc(cmd, args);

        // Discard stderr for now, maybe log?
        execute.stderr.on('data', (chunk) => {
          /* Silently discard stderr messages to not interupt scans */
        });

        // Push to array of reports
        execute.stdout.on('data', (chunk) => {
          report.push(chunk);
        });

        // Push report array to reporting function on stream end
        execute.stdout.on('end', () => {
          if (report.length > 0)
            return reporting.reports(opts, report, callback);
        });
      }