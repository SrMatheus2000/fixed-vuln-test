function unique_name_589(url, queryParams) {
    if (queryParams) {
        return url + encodeURIComponent(JSON.stringify(queryParams));
    }

    return url;
}