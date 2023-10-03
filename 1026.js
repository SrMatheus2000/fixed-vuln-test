function unique_name_601(options) {
        var o       = options || {},
            prefix  = o.prefix || '/console';
        
        if (o.socket)
            Socket = o.socket;
        else if (o.server)
            Socket = io.listen(o.server);
        else
            throw Error('server or socket should be passed in options!');
        
        Socket
            .of(prefix)
            .on('connection', function(socket) {
                var auth        = options.auth;
               
                if (auth && typeof auth !== 'function')
                    throw Error('options.auth should be function!');
                
                if (!auth)
                    onConnection(options, socket);
                else
                    auth(socket, function() {
                        onConnection(options, socket);
                    });
            });
    }