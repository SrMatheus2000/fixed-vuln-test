function createSwaggerPage(options) {
    if (!options.title) {
        throw new Error('options.title is required');
    }
    else if (!options.version) {
        throw new Error('options.version is required');
    }
    else if (!options.server) {
        throw new Error('options.server is required');
    }
    else if (!options.path) {
        throw new Error('options.path is required');
    }
    const swaggerUiPath = `${trimTrailingChar(path.dirname(require.resolve('swagger-ui-dist')), path.sep)}${path.sep}`;
    const swaggerSpec = swaggerJSDoc({
        swaggerDefinition: {
            info: {
                title: options.title,
                version: options.version,
                description: typeof options.description === 'string' ? options.description : undefined
            },
            host: typeof options.host === 'string' ? trimTrailingChar(options.host) : undefined,
            basePath: typeof options.routePrefix === 'string' ? `/${options.routePrefix.replace(/^\/+/, '')}` : '/',
            schemes: Array.isArray(options.schemes) ? options.schemes : undefined,
            tags: Array.isArray(options.tags) ? options.tags : []
        },
        apis: Array.isArray(options.apis) ? options.apis : []
    });
    if (options.definitions) {
        Object.keys(options.definitions).forEach(key => {
            swaggerSpec.definitions[key] = options.definitions[key];
        });
    }
    if (options.securityDefinitions && Object.keys(options.securityDefinitions).length > 0) {
        for (const k of Object.keys(options.securityDefinitions)) {
            swaggerSpec.securityDefinitions[k] = options.securityDefinitions[k];
        }
    }
    else {
        delete swaggerSpec.securityDefinitions;
    }
    const publicPath = trimTrailingChar(options.path);
    options.server.get(`${publicPath}/swagger.json`, (req, res, next) => {
        res.setHeader('Content-type', 'application/json');
        res.send(swaggerSpec);
        return next();
    });
    options.server.get(publicPath, (req, res, next) => {
        res.setHeader('Location', `${publicPath}/index.html`);
        res.send(302);
        return next();
    });
    options.server.get(`${publicPath}/*`, (req, res, next) => {
        const file = req.params['*'];
        const filePath = path.resolve(swaggerUiPath, file);
        if (filePath.indexOf(swaggerUiPath) !== 0) {
            return fileNotFound(file, next);
        }
        fs.readFile(filePath, (err, content) => {
            if (err) {
                return fileNotFound(file, next);
            }
            if (file === 'index.html') {
                const isReqSecure = options.forceSecure || req.isSecure();
                const jsonFileUrl = `${isReqSecure ? 'https' : 'http'}://${req.headers.host}${publicPath}/swagger.json`;
                let localContent = content.toString().replace('url: "https://petstore.swagger.io/v2/swagger.json"', `url: "${jsonFileUrl}"`);
                if (options.validatorUrl === null || typeof options.validatorUrl === 'string') {
                    localContent = addSwaggerUiConfig(localContent, 'validatorUrl', options.validatorUrl);
                }
                if (Array.isArray(options.supportedSubmitMethods)) {
                    localContent = addSwaggerUiConfig(localContent, 'supportedSubmitMethods', options.supportedSubmitMethods);
                }
                content = Buffer.from(localContent);
            }
            const contentType = mime.lookup(file);
            if (contentType !== false) {
                res.setHeader('Content-Type', contentType);
            }
            res.write(content);
            res.end();
            return next();
        });
    });
}