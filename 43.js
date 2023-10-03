function kmsRequest(request) {
      const parsedUrl = request.endpoint.split(':');
      const port = parsedUrl[1] != null ? Number.parseInt(parsedUrl[1], 10) : HTTPS_PORT;
      const options = { host: parsedUrl[0], servername: parsedUrl[0], port };
      const message = request.message;

      return new Promise((resolve, reject) => {
        const buffer = new BufferList();
        const socket = tls.connect(options, () => {
          socket.write(message);
        });

        socket.once('timeout', () => {
          socket.removeAllListeners();
          socket.destroy();
          reject(new MongoCryptError('KMS request timed out'));
        });

        socket.once('error', err => {
          socket.removeAllListeners();
          socket.destroy();

          const mcError = new MongoCryptError('KMS request failed');
          mcError.originalError = err;
          reject(mcError);
        });

        socket.on('data', data => {
          buffer.append(data);
          while (request.bytesNeeded > 0 && buffer.length) {
            const bytesNeeded = Math.min(request.bytesNeeded, buffer.length);
            request.addResponse(buffer.slice(0, bytesNeeded));
            buffer.consume(bytesNeeded);
          }

          if (request.bytesNeeded <= 0) {
            socket.end(resolve);
          }
        });
      });
    }