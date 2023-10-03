function unique_name_349 (iface, callback) {
    execFile("cat", ["/sys/class/net/" + iface + "/address"], function (err, out) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, out.trim().toLowerCase());
    });
}