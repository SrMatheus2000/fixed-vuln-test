function * unique_name_207 (next) {
    const directory = config.get(configKey.DIRECTORY);

    // decode for chinese character
    const requestPath = decodeURIComponent(this.request.path);
    const fullRequestPath = path.join(directory, requestPath);
    // fix security issue
    if (!fullRequestPath.startsWith(directory)) {
        return yield next;
    }
    const stat = yield getFileStat(fullRequestPath);

    if (stat.isDirectory()) {
        const files = yield readFolder(fullRequestPath);

        if (files.indexOf(INDEX_PAGE) !== NOT_FOUNT_INDEX) {
            this.redirect(path.join(requestPath, INDEX_PAGE), '/');
        } else {
            this.body = buildFileBrowser(files, requestPath, directory);
            this.type = mime.lookup(INDEX_PAGE);
        }
    } else if (stat.isFile()) {
        this.body = yield readFile(fullRequestPath);
        let type = mime.lookup(fullRequestPath);

        if (path.extname(fullRequestPath) === '') {
            type = FALLBACK_CONTENT_TYPE;
        }

        this.type = type;
        log.verbose(logPrefix.RESPONSE, this.request.method, requestPath, 'as', type);
    }

    yield next;
}