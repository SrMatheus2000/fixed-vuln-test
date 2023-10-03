function unique_name_422 (embedder, options) {
  if (options.webPreferences == null) {
    options.webPreferences = {}
  }
  if (embedder.browserWindowOptions != null) {
    // Inherit the original options if it is a BrowserWindow.
    mergeOptions(options, embedder.browserWindowOptions)
  } else {
    // Or only inherit web-preferences if it is a webview.
    mergeOptions(options.webPreferences, embedder.getWebPreferences())
  }

  // Disable node integration on child window if disabled on parent window
  if (embedder.getWebPreferences().nodeIntegration === false) {
    options.webPreferences.nodeIntegration = false
  }

  // Enable context isolation on child window if enabled on parent window
  if (embedder.getWebPreferences().contextIsolation === true) {
    options.webPreferences.contextIsolation = true
  }

  // Disable JavaScript on child window if disabled on parent window
  if (embedder.getWebPreferences().javascript === false) {
    options.webPreferences.javascript = false
  }

  // Sets correct openerId here to give correct options to 'new-window' event handler
  options.webPreferences.openerId = embedder.id

  return options
}