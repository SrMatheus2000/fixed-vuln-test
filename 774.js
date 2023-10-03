function unique_name_424 (message, title) {
    return ipcRenderer.sendSync('ELECTRON_BROWSER_WINDOW_CONFIRM', `${message}`, `${title}`)
  }