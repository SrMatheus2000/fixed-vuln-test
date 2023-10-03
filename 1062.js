function unique_name_627 (request, reply) {

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
    }