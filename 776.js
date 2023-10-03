(event, url, frameName,
                                      disposition, additionalFeatures,
                                      postData) => {
    const options = {
      show: true,
      width: 800,
      height: 600
    }
    ipcMain.emit('ELECTRON_GUEST_WINDOW_MANAGER_INTERNAL_WINDOW_OPEN',
                 event, url, frameName, disposition,
                 options, additionalFeatures, postData)
  }