err => {
          if (capacitor.finished || capacitor.destroyed) return

          // A terminated connection may cause the request to emit a 'close' event either before or after
          // the parser encounters an error, depending on the version of node and the state of stream buffers.
          if (isEarlyTerminationError(err))
            err = new FileStreamDisconnectUploadError(err.message)

          capacitor.destroy(err)
        }