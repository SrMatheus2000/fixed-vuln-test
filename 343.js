function sanitizeURL(url, href) {
    if (url.trim().toLowerCase().indexOf('javascript:') === 0 ||
        url.trim().toLowerCase().indexOf('vbscript:') === 0) {
        console.log('Script URL removed.');
        return 'about:blank';
    }
    if (href && url.trim().toLowerCase().indexOf('data:') === 0) {
        console.log('Data URI removed from link.');
        return 'about:blank';
    }
    return url;
}