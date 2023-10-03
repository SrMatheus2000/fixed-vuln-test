async function getAllShares() {
    try {
      const { stdout } = await execa("smbtree", ["-U", "guest", "-N"], {
        all: true,
      });

      const shares = [];
      for (const line in stdout.split(/\r?\n/)) {
        const words = line.split(/\t/);
        if (words.length > 2 && words[2].match(/^\s*$/) !== null) {
          shares.append(words[2].trim());
        }
      }

      return shares;
    } catch (error) {
      if (this.maskCmd) {
        error.message = error.all;
        error.shortMessage = error.all;
      }
      throw error;
    }
  }