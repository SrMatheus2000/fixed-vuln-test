(err) => {

        if (err && Net.isIP(host) === 0) {
            return callback(new Error('Invalid host'));
        }

        const command = (internals.isWin ? 'tracert' : 'traceroute');
        const args = internals.isWin ? ['-d', host] : ['-q', 1, '-n', host];

        const traceroute = Child.spawn(command, args);

        const hops = [];
        let counter = 0;
        traceroute.stdout.on('data', (data) => {

            ++counter;
            if ((!internals.isWin && counter < 2) || (internals.isWin && counter < 5)) {
                return null;
            }

            const result = data.toString().replace(/\n$/,'');
            if (!result) {
                return null;
            }

            const hop = internals.parseHop(result);
            hops.push(hop);
        });

        traceroute.on('close', (code) => {

            if (callback) {
                return callback(null, hops);
            }
        });

        return traceroute;
    }