function unique_name_425 () {
  // Avoid recursive require.
  const {app} = require('electron')

  // Simulate the application menu on platforms other than macOS.
  if (process.platform !== 'darwin') {
    const menu = app.getApplicationMenu()
    if (menu) this.setMenu(menu)
  }

  // Make new windows requested by links behave like "window.open"
  this.webContents.on('-new-window', (event, url, frameName,
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
  })

  this.webContents.on('-web-contents-created', (event, webContents, url,
                                                frameName) => {
    v8Util.setHiddenValue(webContents, 'url-framename', {url, frameName})
  })
  // Create a new browser window for the native implementation of
  // "window.open"(sandbox mode only)
  this.webContents.on('-add-new-contents', (event, webContents, disposition,
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
  })

  // window.resizeTo(...)
  // window.moveTo(...)
  this.webContents.on('move', (event, size) => {
    this.setBounds(size)
  })

  // Hide the auto-hide menu when webContents is focused.
  this.webContents.on('activate', () => {
    if (process.platform !== 'darwin' && this.isMenuBarAutoHide() && this.isMenuBarVisible()) {
      this.setMenuBarVisibility(false)
    }
  })

  // Change window title to page title.
  this.webContents.on('page-title-updated', (event, title) => {
    // The page-title-updated event is not emitted immediately (see #3645), so
    // when the callback is called the BrowserWindow might have been closed.
    if (this.isDestroyed()) return

    // Route the event to BrowserWindow.
    this.emit('page-title-updated', event, title)
    if (!event.defaultPrevented) this.setTitle(title)
  })

  // Sometimes the webContents doesn't get focus when window is shown, so we
  // have to force focusing on webContents in this case. The safest way is to
  // focus it when we first start to load URL, if we do it earlier it won't
  // have effect, if we do it later we might move focus in the page.
  //
  // Though this hack is only needed on macOS when the app is launched from
  // Finder, we still do it on all platforms in case of other bugs we don't
  // know.
  this.webContents.once('load-url', function () {
    this.focus()
  })

  // Redirect focus/blur event to app instance too.
  this.on('blur', (event) => {
    app.emit('browser-window-blur', event, this)
  })
  this.on('focus', (event) => {
    app.emit('browser-window-focus', event, this)
  })

  // Subscribe to visibilityState changes and pass to renderer process.
  let isVisible = this.isVisible() && !this.isMinimized()
  const visibilityChanged = () => {
    const newState = this.isVisible() && !this.isMinimized()
    if (isVisible !== newState) {
      isVisible = newState
      this.webContents.send('ELECTRON_RENDERER_WINDOW_VISIBILITY_CHANGE', isVisible ? 'visible' : 'hidden')
    }
  }

  const visibilityEvents = ['show', 'hide', 'minimize', 'maximize', 'restore']
  for (let event of visibilityEvents) {
    this.on(event, visibilityChanged)
  }

  // Notify the creation of the window.
  app.emit('browser-window-created', {}, this)

  Object.defineProperty(this, 'devToolsWebContents', {
    enumerable: true,
    configurable: false,
    get () {
      return this.webContents.devToolsWebContents
    }
  })
}