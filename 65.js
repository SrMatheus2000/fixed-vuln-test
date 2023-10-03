async function execute(smbCommand, smbCommandArgs, workingDir) {
    const args = this.getSmbClientArgs(smbCommand, smbCommandArgs);

    const options = {
      all: true,
      cwd: workingDir || "",
    };

    try {
      const { all } = await execa("smbclient", args, options);
      return all;
    } catch (error) {
      if (this.maskCmd) {
        error.message = error.all;
        error.shortMessage = error.all;
      }
      throw error;
    }
  }