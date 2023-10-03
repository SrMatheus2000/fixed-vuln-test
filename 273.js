function unique_name_131 (scanner) {
        const path = this.settings[scanner].path || null;
        if (!path) {
            if (this.settings.debug_mode) console.log(`${this.debug_label}: Could not determine path for clamav binary.`);
            return false;
        }

        const version_cmds = {
            clamdscan: `${path} --version`,
            clamscan: `${path} --version`,
        };

        try {
            await fs_access(path, fs.constants.R_OK);
            version_cmds_exec = version_cmds[scanner].split(' ');
            const {stdout} = await cp_execfile(version_cmds_exec[0], [version_cmds_exec[1]]);
            if (stdout.toString().match(/ClamAV/) === null) {
                if (this.settings.debug_mode) console.log(`${this.debug_label}: Could not verify the ${scanner} binary.`);
                return false;
            }
            return true;
        } catch (err) {
            if (this.settings.debug_mode) console.log(`${this.debug_label}: Could not verify the ${scanner} binary.`);
            return false;
        }
    }