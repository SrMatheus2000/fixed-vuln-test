function unique_name_250(request, response){
    let parsedURL = url.parse(request.url, true); // .query
    let path = parsedURL.pathname;
    if(path === "/") path = "/index.html";
    let fileType = null;
    var MIME = null;
    if(path.indexOf(".") != -1){
        fileType = path.substr(path.lastIndexOf(".")).toLowerCase();
        MIME = MIMES[fileType];
    }
    // Serve the actual file
    var filePath = pathlib.join(servePath, path);
    if(filePath.indexOf(servePath) !== 0){
        response.end();
        return;
    }
    let handler = handlers[path];
    if(handler !== undefined){
        if(handler.requestTypes === null || handler.requestTypes.indexOf(request.method) != -1){
            handler.handler(request, response, parsedURL);
            return;
        }
    }
    fs.stat(filePath, function(error, stats){
        if(error){
            // Whoopsie. See if they just omitted the .html
            fs.stat(filePath + ".html", function(error, stats){
                if(error){
                    response.writeHead(404);
                    response.write("Item not found");
                    response.end();
                    totalFailure = true;
                }
                else{
                    filePath = filePath + ".html";
                    doStream(request, response, filePath, stats, MIMES[".html"]);
                }
            });
        }
        else{
            doStream(request, response, filePath, stats, MIME);
        }
    });
}