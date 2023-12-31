function unique_name_628 (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    // copy the key and restful settings from internals.defaults to internals.routeDefaults for consistency
    internals.routeDefaults.key = settings.key;
    internals.routeDefaults.restful = settings.restful;

    plugin.state(settings.key, settings.cookieOptions);

    plugin.ext('onPostAuth', function (request, reply) {

        // Validate incoming crumb

        if (typeof request.route.plugins._crumb === 'undefined') {
            if (request.route.plugins.crumb ||
                !request.route.plugins.hasOwnProperty('crumb') && settings.autoGenerate) {

                request.route.plugins._crumb = Hoek.applyToDefaults(internals.routeDefaults, request.route.plugins.crumb || {});
            }
            else {
                request.route.plugins._crumb = false;
            }
        }

        // Set crumb cookie and calculate crumb

        if ((settings.autoGenerate ||
            request.route.plugins._crumb) &&
            !request.headers.origin) {

            generate(request, reply);
        }

        // Validate crumb

        if (settings.restful === false ||
            (!request.route.plugins._crumb || request.route.plugins._crumb.restful === false)) {

            if (request.method !== 'post' ||
                !request.route.plugins._crumb) {

                return reply();
            }

            var content = request[request.route.plugins._crumb.source];
            if (content instanceof Stream) {

                return reply(plugin.hapi.error.forbidden());
            }

            if (content[request.route.plugins._crumb.key] !== request.plugins.crumb) {
                return reply(plugin.hapi.error.forbidden());
            }

            // Remove crumb

            delete request[request.route.plugins._crumb.source][request.route.plugins._crumb.key];
        }
        else {
            if (request.method !== 'post' && request.method !== 'put' && request.method !== 'patch' && request.method !== 'delete' ||
                !request.route.plugins._crumb) {

                return reply();
            }

            var header = request.headers['x-csrf-token'];

            if (!header)  {
                return reply(plugin.hapi.error.forbidden());
            }

            if (header !== request.plugins.crumb) {
                return reply(plugin.hapi.error.forbidden());
            }

        }

        return reply();
    });

    plugin.ext('onPreResponse', function (request, reply) {

        // Add to view context

        var response = request.response;

        if (settings.addToViewContext &&
            request.plugins.crumb &&
            request.route.plugins._crumb &&
            !response.isBoom &&
            response.variety === 'view') {

            response.source.context = response.source.context || {};
            response.source.context[request.route.plugins._crumb.key] = request.plugins.crumb;
        }

        return reply();
    });

    var generate = function (request, reply) {

        var crumb = request.state[settings.key];
        if (!crumb) {
            crumb = Cryptiles.randomString(settings.size);
            reply.state(settings.key, crumb, settings.cookieOptions);
        }

        request.plugins.crumb = crumb;
        return request.plugins.crumb;
    };

    plugin.expose({ generate: generate });

    return next();
}