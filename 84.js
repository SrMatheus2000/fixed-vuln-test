function unique_name_40(range) {
    if (!this.myDevice.connection) return new Promise((_, reject) => reject(new Error('No connection!')));
    if (!range) {
        range = this._getFullRange();
        if (!range.length) {
            return new Promise((_, reject) => reject(new Error('No connection!')));
        }
    }

    const pings = range.map(ip => new Promise((resolve, reject) => {
        execFile('ping', [ flag, this.timeout, ip ], (err, stdout) => {
            if (err || stdout.includes(`100% packet loss`)) return reject(ip);
            return resolve(ip);
        });
    }));
    return Promise.allSettled(pings)
        .then(results => results.reduce((ret, { status, value = null, reason: ip = null }) => {
            if (status === 'fulfilled') ret.hosts.push(value);
            else ret.missing.push(ip);
            return ret;
        }, { hosts: [], missing: [] }));
}