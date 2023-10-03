function unique_name_41(range = []) {
    if (!this.myDevice.connection) return new Promise((_, reject) => reject(new Error('No connection!')));
    const arps = range.map(ip => new Promise((resolve, reject) => {
        execFile('arp', [ ip ], (err, stdout) => {
            if (err || stdout.includes('no entry')) return reject(ip);

            const mac = osType === 'Linux' ?
                stdout.split('\n')[1].replace(/ +/g, ' ').split(' ')[2]:
                stdout.split(' ')[3];
            if (mac.includes('incomplete')) return reject(ip);
            const host = { ip, mac, type: macLookup(mac) };
            if (ip === this.myDevice.connection.address) host.isHostDevice = true;
            resolve(host);
        });
    }));
    return Promise.allSettled(arps)
        .then(results => results.reduce((ret, { status, value = null, reason: ip = null }) => {
            if (status === 'fulfilled') ret.hosts.push(value);
            else ret.missing.push(ip);
            return ret;
        }, { hosts: [], missing: [] }));
}