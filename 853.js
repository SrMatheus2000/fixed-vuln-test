(err, state, failed) => {

        if (err) {
            this.auth._error = Boom.unauthorized('Invalid nes authentication cookie');
            return;
        }

        const auth = state[config.cookie];
        if (auth) {
            this.auth._error = this._setCredentials(auth.credentials, auth.artifacts);
        }
    }