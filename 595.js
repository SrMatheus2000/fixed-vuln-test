(
  request,
  response,
  {
    maxFieldSize = 1000000, // 1 MB
    maxFileSize = Infinity,
    maxFiles = Infinity
  } = {}
) =>
  new Promise((resolve, reject) => {
    let requestEnded = false
    let released = false
    let exitError
    let currentStream
    let operations
    let operationsPath
    let map

    const parser = new Busboy({
      headers: request.headers,
      limits: {
        fieldSize: maxFieldSize,
        fields: 2, // Only operations and map.
        fileSize: maxFileSize,
        files: maxFiles
      }
    })

    /**
     * Exits request processing with an error. Successive calls have no effect.
     * @kind function
     * @name processRequest~exit
     * @param {Object} error Error instance.
     * @ignore
     */
    const exit = error => {
      if (exitError) return
      exitError = error

      reject(exitError)

      parser.destroy()

      if (currentStream) currentStream.destroy(exitError)

      if (map)
        for (const upload of map.values())
          if (!upload.file) upload.reject(exitError)

      request.unpipe(parser)
      request.resume()
    }

    /**
     * Releases resources and cleans up Capacitor temporary files. Successive
     * calls have no effect.
     * @kind function
     * @name processRequest~release
     * @ignore
     */
    const release = () => {
      if (released) return
      released = true

      if (map)
        for (const upload of map.values())
          if (upload.file) upload.file.capacitor.destroy()
    }

    parser.on('field', (fieldName, value) => {
      switch (fieldName) {
        case 'operations':
          try {
            operations = JSON.parse(value)
            operationsPath = objectPath(operations)
          } catch (error) {
            exit(
              createError(
                400,
                `Invalid JSON in the ‘operations’ multipart field (${SPEC_URL}).`
              )
            )
          }
          break
        case 'map': {
          if (!operations)
            return exit(
              createError(
                400,
                `Misordered multipart fields; ‘map’ should follow ‘operations’ (${SPEC_URL}).`
              )
            )

          let mapEntries
          try {
            mapEntries = Object.entries(JSON.parse(value))
          } catch (error) {
            return exit(
              createError(
                400,
                `Invalid JSON in the ‘map’ multipart field (${SPEC_URL}).`
              )
            )
          }

          // Check max files is not exceeded, even though the number of files to
          // parse might not match the map provided by the client.
          if (mapEntries.length > maxFiles)
            return exit(
              createError(413, `${maxFiles} max file uploads exceeded.`)
            )

          map = new Map()
          for (const [fieldName, paths] of mapEntries) {
            map.set(fieldName, new Upload())

            for (const path of paths)
              operationsPath.set(path, map.get(fieldName).promise)
          }

          resolve(operations)
        }
      }
    })

    parser.on('file', (fieldName, stream, filename, encoding, mimetype) => {
      if (!map) {
        // Prevent an unhandled error from crashing the process.
        stream.on('error', () => {})
        stream.resume()

        return exit(
          createError(
            400,
            `Misordered multipart fields; files should follow ‘map’ (${SPEC_URL}).`
          )
        )
      }

      currentStream = stream
      stream.on('end', () => {
        if (currentStream === stream) currentStream = null
      })

      const upload = map.get(fieldName)
      if (upload) {
        const capacitor = new WriteStream()

        capacitor.on('error', () => {
          stream.unpipe()
          stream.resume()
        })

        stream.on('limit', () => {
          if (currentStream === stream) currentStream = null
          stream.unpipe()
          capacitor.destroy(
            createError(413, 'File truncated as it exceeds the size limit.')
          )
        })

        stream.on('error', error => {
          if (currentStream === stream) currentStream = null

          stream.unpipe()
          capacitor.destroy(exitError || error)
        })

        stream.pipe(capacitor)

        upload.resolve(
          Object.create(null, {
            filename: { value: filename, enumerable: true },
            mimetype: { value: mimetype, enumerable: true },
            encoding: { value: encoding, enumerable: true },
            createReadStream: {
              value() {
                const error = capacitor.error || (released ? exitError : null)
                if (error) throw error

                return capacitor.createReadStream()
              },
              enumerable: true
            },
            capacitor: { value: capacitor }
          })
        )
      } else {
        // Discard the unexpected file.
        stream.on('error', () => {})
        stream.resume()
      }
    })

    parser.once('filesLimit', () =>
      exit(createError(413, `${maxFiles} max file uploads exceeded.`))
    )

    parser.once('finish', () => {
      request.unpipe(parser)
      request.resume()

      if (!operations)
        return exit(
          createError(
            400,
            `Missing multipart field ‘operations’ (${SPEC_URL}).`
          )
        )

      if (!map)
        return exit(
          createError(400, `Missing multipart field ‘map’ (${SPEC_URL}).`)
        )

      for (const upload of map.values())
        if (!upload.file)
          upload.reject(createError(400, 'File missing in the request.'))
    })

    parser.once('error', exit)

    response.once('finish', release)
    response.once('close', release)

    request.once('end', () => {
      requestEnded = true
    })

    request.once('close', () => {
      if (!requestEnded)
        exit(
          createError(
            499,
            'Request disconnected during file upload stream parsing.'
          )
        )
    })

    request.pipe(parser)
  });