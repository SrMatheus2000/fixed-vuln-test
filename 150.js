options =>
  new Promise((resolve, reject) => {
    const cwd = options.cwd || process.cwd();
    const command = "zip";
    expandSources(cwd, options.source, (err, sources) => {
      const args = ["--quiet", "--recurse-paths", options.destination].concat(
        sources
      );
      const zipProcess = cp.spawn(command, args, {
        stdio: "inherit",
        cwd
      });
      zipProcess.on("error", reject);
      zipProcess.on("close", exitCode => {
        if (exitCode === 0) {
          resolve();
        } else {
          // exit code 12 means "nothing to do" right?
          //console.log('rejecting', zipProcess)
          reject(
            new Error(
              `Unexpected exit code from native zip: ${exitCode}\n executed command '${command} ${args.join(
                " "
              )}'\n executed in directory '${cwd}'`
            )
          );
        }
      });
    });
  });