function getRedirectUrl(query) {
    try {
        const redirect = decodeURIComponent(query.r || '/');
        const pathname = new URL(redirect, config.get('url')).pathname;

        const base = new URL(config.get('url'));
        const target = new URL(pathname, config.get('url'));
        // Make sure we don't redirect outside of the instance
        return target.host === base.host ? pathname : '/';
    } catch (e) {
        return '/';
    }
}