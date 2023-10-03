function unique_name_440 (origin, allowOrigins, request) {

    var host = internals.trimHost(request.connection.info.uri);
    var requestHost = request.headers.host;
    this._match = false;

    // If a same origin request, pass check

    if (host === requestHost) {
        this._match = true;
        return this._match;
    }

    // If no origin header is set and cross-origin, automatically fail check

    else if (!origin || allowOrigins.length === 0) {
        return this._match;
    }

    // Split origin in to port and domain

    this._origin = origin.split(':');
    this._originPort = this._origin.length === 3 ? this._origin[2] : null;
    this._originParts = this._origin[1].split('.');

    // Iterate through allowed origins list and check origin header matches

    for (var i = 0, il = allowOrigins.length; i < il; ++i) {
        if (allowOrigins[i] === '*') {
            return false;
        }

        this._originAllow = allowOrigins[i].split(':');
        this._originAllowPort = this._originAllow.length === 3 ? this._originAllow[2] : null;
        this._originAllowParts = this._originAllow[1].split('.');

        if ((this._originPort && !this._originAllowPort) || (!this._originPort && this._originAllowPort) || (this._originAllowPort !== '*' && this._originPort !== this._originAllowPort)) {
            this._match = false;
        }
        else {
            for (var j = 0, jl = this._originAllowParts.length; j < jl; ++j) {
                this._match = this._originAllowParts[j] === '*' || this._originAllowParts[j] === this._originParts[j];
                if (!this._match) {
                    break;
                }
            }
            if (this._match) {
                return this._match;
            }
        }
    }

    return this._match;
}