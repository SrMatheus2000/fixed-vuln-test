(fieldName, source, filename, encoding, mimetype) => {
      if (!map) {
        source.on('error', defaultErrorHandler)
        source.resume()
        return exit(
          new FilesBeforeMapUploadError(
            `Misordered multipart fields; files should follow “map” (${SPEC_URL}).`,
            400
          )
        )
      }

      currentStream = source
      source.on('end', () => {
        if (currentStream === source) currentStream = null
      })

      if (map.has(fieldName)) {
        const capacitor = new Capacitor()
        capacitor.on('error', () => {
          source.unpipe()
          source.resume()
        })

        // Monkey patch busboy to emit an error when a file is too big.
        source.on('limit', () =>
          capacitor.destroy(
            new MaxFileSizeUploadError(
              'File truncated as it exceeds the size limit.'
            )
          )
        )

        source.on('error', err => {
          if (capacitor.finished || capacitor.destroyed) return

          // A terminated connection may cause the request to emit a 'close' event either before or after
          // the parser encounters an error, depending on the version of node and the state of stream buffers.
          if (isEarlyTerminationError(err))
            err = new FileStreamDisconnectUploadError(err.message)

          capacitor.destroy(err)
        })

        source.pipe(capacitor)

        map.get(fieldName).resolve({
          stream: capacitor,
          filename,
          mimetype,
          encoding
        })
      }

      // Discard the unexpected file.
      else source.resume()
    }