exitCode => {
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
      }