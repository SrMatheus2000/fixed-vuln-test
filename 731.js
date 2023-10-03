function unique_name_404 () {
    'use strict';

    var Mimer = function (extPath) {
        if (!(this instanceof Mimer)) {
            if (extPath) {
                var mime = new Mimer();
                return mime.get(extPath);
            }
            return new Mimer();
        }
    },
    _extGetter = function (fileName) {
        return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
    };

    Mimer.prototype = {
        set: function (ext, type) {
            if (!(ext instanceof Array)) {
                if (ext.match('.')) {
                    ext = ext.replace('.', '');
                }
                this.list[ext] = type;
                return this;
            } else {
                for (var i = 0; i < ext.length; i++) {
                    this.set(ext[i], type);
                }
            }
        },
        get: function (path) {
            var ext     = null,
                generic = 'application/octet-stream';

            if (!path) {
                return generic;
            }

            ext = _extGetter(path);

            return this.list[ext] || generic;
        },
        list: (typeof process !== 'undefined' && process.cwd) ? require('./data/parser')(__dirname + '/data/mime.types') : $_MIMER_DATA_LIST
    };

    return Mimer;
}