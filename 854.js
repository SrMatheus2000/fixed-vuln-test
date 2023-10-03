function unique_name_474 () {

    const config = this._listener._settings.auth;
    if (!config) {
        return;
    }

    if (config.timeout) {
        this.auth._timeout = setTimeout(() => this.disconnect(), config.timeout);
    }

    const cookies = this._ws.upgradeReq.headers.cookie;
    if (!cookies) {
        return;
    }

    this._listener._connection.states.parse(cookies, (err, state, failed) => {

        if (err) {
            this.auth._error = Boom.unauthorized('Invalid nes authentication cookie');
            return;
        }

        const auth = state[config.cookie];
        if (auth) {
            this.auth._error = this._setCredentials(auth.credentials, auth.artifacts);
        }
    });
}