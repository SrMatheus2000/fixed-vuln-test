function unique_name_386 (req, res) {
        var requestPath = path.join(rootPath, req.url);
        var targetPath;
        if(!utils.allowPath(requestPath, rootPath)){
            targetPath = rootPath;
            req.url = '/';
        }else {
            targetPath = requestPath;
        }
        if (fs.existsSync(targetPath)) {
            var targetType = fs.lstatSync(targetPath);
            if (targetType.isFile()) {
                res.end(fs.readFileSync(targetPath))
            } else if (targetType.isDirectory()) {
                fs.readdir(targetPath, function (error, list) {
                    if (error) {
                        console.log(error);
                        res.end(error.toString())
                    }
                    var dirs = [];
                    var files = [];
                    list.forEach(function (val) {
                        var file = fs.lstatSync(path.join(targetPath, val));
                        if (file.isFile()) {
                            files.push(val)
                        } else if (file.isDirectory()) {
                            dirs.push(val);
                        }
                    });
                    res.writeHead(200);
                    res.write(utils.render(req.url, dirs, files));
                    res.end()
                })
            } else {
                res.end('error')
            }
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('not found');
        }
        req.on('error', function (e) {
            console.log(e);
        })
        res.on('error', function (e) {
            console.log(e);
        })
    }