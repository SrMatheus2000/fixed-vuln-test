(event, webContents, disposition,
                                            userGesture, left, top, width,
                                            height) => {
    let urlFrameName = v8Util.getHiddenValue(webContents, 'url-framename')
    if ((disposition !== 'foreground-tab' && disposition !== 'new-window') ||
        !urlFrameName) {
      return
    }

    let {url, frameName} = urlFrameName
    v8Util.deleteHiddenValue(webContents, 'url-framename')
    const options = {
      show: true,
      x: left,
      y: top,
      width: width || 800,
      height: height || 600,
      webContents: webContents
    }
    ipcMain.emit('ELECTRON_GUEST_WINDOW_MANAGER_INTERNAL_WINDOW_OPEN',
                 event, url, frameName, disposition, options)
  }