function unique_name_423 (message, title) {
    ipcRenderer.sendSync('ELECTRON_BROWSER_WINDOW_ALERT', `${message}`, `${title}`)
  }