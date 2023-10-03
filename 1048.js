function unique_name_617 (route, connection, plugin, options) {

    options = options || {};

    // Apply plugin environment (before schema validation)

    const realm = plugin.realm;
    if (realm.modifiers.route.vhost ||
        realm.modifiers.route.prefix) {

        route = Hoek.cloneWithShallow(route, ['config']);       // config is left unchanged
        route.path = (realm.modifiers.route.prefix ? realm.modifiers.route.prefix + (route.path !== '/' ? route.path : '') : route.path);
        route.vhost = realm.modifiers.route.vhost || route.vhost;
    }

    // Setup and validate route configuration

    Hoek.assert(route.path, 'Route missing path');
    const routeDisplay = route.method + ' ' + route.path;
    Hoek.assert(route.handler || (route.config && route.config.handler), 'Missing or undefined handler:', routeDisplay);
    Hoek.assert(!!route.handler ^ !!(route.config && route.config.handler), 'Handler must only appear once:', routeDisplay);            // XOR
    Hoek.assert(route.path === '/' || route.path[route.path.length - 1] !== '/' || !connection.settings.router.stripTrailingSlash, 'Path cannot end with a trailing slash when connection configured to strip:', routeDisplay);

    route = Schema.apply('route', route, routeDisplay);

    const handler = route.handler || route.config.handler;
    const method = route.method.toLowerCase();
    Hoek.assert(method !== 'head', 'Method name not allowed:', routeDisplay);

    // Apply settings in order: {connection} <- {handler} <- {realm} <- {route}

    const handlerDefaults = Handler.defaults(method, handler, connection.server);
    let base = Hoek.applyToDefaultsWithShallow(connection.settings.routes, handlerDefaults, ['bind']);
    base = Hoek.applyToDefaultsWithShallow(base, realm.settings, ['bind']);
    this.settings = Hoek.applyToDefaultsWithShallow(base, route.config || {}, ['bind']);
    this.settings.handler = handler;
    this.settings = Schema.apply('routeConfig', this.settings, routeDisplay);

    const socketTimeout = (this.settings.timeout.socket === undefined ? 2 * 60 * 1000 : this.settings.timeout.socket);
    Hoek.assert(!this.settings.timeout.server || !socketTimeout || this.settings.timeout.server < socketTimeout, 'Server timeout must be shorter than socket timeout:', routeDisplay);
    Hoek.assert(!this.settings.payload.timeout || !socketTimeout || this.settings.payload.timeout < socketTimeout, 'Payload timeout must be shorter than socket timeout:', routeDisplay);

    this.connection = connection;
    this.server = connection.server;
    this.path = route.path;
    this.method = method;
    this.plugin = plugin;

    this.settings.vhost = route.vhost;
    this.settings.plugins = this.settings.plugins || {};            // Route-specific plugins settings, namespaced using plugin name
    this.settings.app = this.settings.app || {};                    // Route-specific application settings

    // Path parsing

    this._special = !!options.special;
    this._analysis = this.connection._router.analyze(this.path);
    this.params = this._analysis.params;
    this.fingerprint = this._analysis.fingerprint;

    this.public = {
        method: this.method,
        path: this.path,
        vhost: this.vhost,
        realm: this.plugin.realm,
        settings: this.settings,
        fingerprint: this.fingerprint
    };

    // Validation

    const validation = this.settings.validate;
    if (this.method === 'get') {

        // Assert on config, not on merged settings

        Hoek.assert(!route.config || !route.config.payload, 'Cannot set payload settings on HEAD or GET request:', routeDisplay);
        Hoek.assert(!route.config || !route.config.validate || !route.config.validate.payload, 'Cannot validate HEAD or GET requests:', routeDisplay);

        validation.payload = null;
    }

    ['headers', 'params', 'query', 'payload'].forEach((type) => {

        validation[type] = internals.compileRule(validation[type]);
    });

    if (this.settings.response.schema !== undefined ||
        this.settings.response.status) {

        this.settings.response._validate = true;

        const rule = this.settings.response.schema;
        this.settings.response.status = this.settings.response.status || {};
        const statuses = Object.keys(this.settings.response.status);

        if (rule === true &&
            !statuses.length) {

            this.settings.response._validate = false;
        }
        else {
            this.settings.response.schema = internals.compileRule(rule);
            for (let i = 0; i < statuses.length; ++i) {
                const code = statuses[i];
                this.settings.response.status[code] = internals.compileRule(this.settings.response.status[code]);
            }
        }
    }

    // Payload parsing

    if (this.method === 'get') {
        this.settings.payload = null;
    }
    else {
        if (this.settings.payload.allow) {
            this.settings.payload.allow = [].concat(this.settings.payload.allow);
        }
    }

    Hoek.assert(!this.settings.validate.payload || this.settings.payload.parse, 'Route payload must be set to \'parse\' when payload validation enabled:', routeDisplay);
    Hoek.assert(!this.settings.jsonp || typeof this.settings.jsonp === 'string', 'Bad route JSONP parameter name:', routeDisplay);

    // Authentication configuration

    this.settings.auth = (this._special ? false : this.connection.auth._setupRoute(this.settings.auth, route.path));

    // Cache

    if (this.method === 'get' &&
        (this.settings.cache.expiresIn || this.settings.cache.expiresAt)) {

        this.settings.cache._statuses = Hoek.mapToObject(this.settings.cache.statuses);
        this._cache = new Catbox.Policy({ expiresIn: this.settings.cache.expiresIn, expiresAt: this.settings.cache.expiresAt });
    }

    // CORS

    this.settings.cors = Cors.route(this.settings.cors);

    // Security

    if (this.settings.security) {
        this.settings.security = Hoek.applyToDefaults(Defaults.security, this.settings.security);

        const security = this.settings.security;
        if (security.hsts) {
            if (security.hsts === true) {
                security._hsts = 'max-age=15768000';
            }
            else if (typeof security.hsts === 'number') {
                security._hsts = 'max-age=' + security.hsts;
            }
            else {
                security._hsts = 'max-age=' + (security.hsts.maxAge || 15768000);
                if (security.hsts.includeSubdomains || security.hsts.includeSubDomains) {
                    security._hsts = security._hsts + '; includeSubDomains';
                }
                if (security.hsts.preload) {
                    security._hsts = security._hsts + '; preload';
                }
            }
        }

        if (security.xframe) {
            if (security.xframe === true) {
                security._xframe = 'DENY';
            }
            else if (typeof security.xframe === 'string') {
                security._xframe = security.xframe.toUpperCase();
            }
            else if (security.xframe.rule === 'allow-from') {
                if (!security.xframe.source) {
                    security._xframe = 'SAMEORIGIN';
                }
                else {
                    security._xframe = 'ALLOW-FROM ' + security.xframe.source;
                }
            }
            else {
                security._xframe = security.xframe.rule.toUpperCase();
            }
        }
    }

    // Handler

    this.settings.handler = Handler.configure(this.settings.handler, this);
    this._prerequisites = Handler.prerequisites(this.settings.pre, this.server);

    // Route lifecycle

    this._extensions = {
        onPreResponse: this._combineExtensions('onPreResponse')
    };

    if (this._special) {
        this._cycle = [Handler.execute];
        return;
    }

    this._extensions.onPreAuth = this._combineExtensions('onPreAuth');
    this._extensions.onPostAuth = this._combineExtensions('onPostAuth');
    this._extensions.onPreHandler = this._combineExtensions('onPreHandler');
    this._extensions.onPostHandler = this._combineExtensions('onPostHandler');

    this.rebuild();
}