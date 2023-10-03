function unique_name_629 (src, file) {
    if (typeof src !== 'string') src = String(src);
    
    try {
        eval('throw "STOP"; (function () { ' + src + '})()');
        return;
    }
    catch (err) {
        if (err === 'STOP') return undefined;
        if (err.constructor.name !== 'SyntaxError') throw err;
        return errorInfo(src, file);
    }
}