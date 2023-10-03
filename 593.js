() => {
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
    }