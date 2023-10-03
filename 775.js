(ipcRenderer, guestInstanceId, openerId, hiddenPage) => {
  if (guestInstanceId == null) {
    // Override default window.close.
    window.close = function () {
      ipcRenderer.sendSync('ELECTRON_BROWSER_WINDOW_CLOSE')
    }
  }

  // Make the browser window or guest view emit "new-window" event.
  window.open = function (url, frameName, features) {
    if (url != null && url !== '') {
      url = resolveURL(url)
    }
    const guestId = ipcRenderer.sendSync('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_OPEN', url, frameName, features)
    if (guestId != null) {
      return getOrCreateProxy(ipcRenderer, guestId)
    } else {
      return null
    }
  }

  window.alert = function (message, title) {
    ipcRenderer.sendSync('ELECTRON_BROWSER_WINDOW_ALERT', `${message}`, `${title}`)
  }

  window.confirm = function (message, title) {
    return ipcRenderer.sendSync('ELECTRON_BROWSER_WINDOW_CONFIRM', `${message}`, `${title}`)
  }

  // But we do not support prompt().
  window.prompt = function () {
    throw new Error('prompt() is and will not be supported.')
  }

  if (openerId != null) {
    window.opener = getOrCreateProxy(ipcRenderer, openerId)
  }

  ipcRenderer.on('ELECTRON_GUEST_WINDOW_POSTMESSAGE', function (event, sourceId, message, sourceOrigin) {
    // Manually dispatch event instead of using postMessage because we also need to
    // set event.source.
    event = document.createEvent('Event')
    event.initEvent('message', false, false)
    event.data = message
    event.origin = sourceOrigin
    event.source = getOrCreateProxy(ipcRenderer, sourceId)
    window.dispatchEvent(event)
  })

  window.history.back = function () {
    sendHistoryOperation(ipcRenderer, 'goBack')
  }

  window.history.forward = function () {
    sendHistoryOperation(ipcRenderer, 'goForward')
  }

  window.history.go = function (offset) {
    sendHistoryOperation(ipcRenderer, 'goToOffset', offset)
  }

  defineProperty(window.history, 'length', {
    get: function () {
      return getHistoryOperation(ipcRenderer, 'length')
    }
  })

  // The initial visibilityState.
  let cachedVisibilityState = hiddenPage ? 'hidden' : 'visible'

  // Subscribe to visibilityState changes.
  ipcRenderer.on('ELECTRON_RENDERER_WINDOW_VISIBILITY_CHANGE', function (event, visibilityState) {
    if (cachedVisibilityState !== visibilityState) {
      cachedVisibilityState = visibilityState
      document.dispatchEvent(new Event('visibilitychange'))
    }
  })

  // Make document.hidden and document.visibilityState return the correct value.
  defineProperty(document, 'hidden', {
    get: function () {
      return cachedVisibilityState !== 'visible'
    }
  })

  defineProperty(document, 'visibilityState', {
    get: function () {
      return cachedVisibilityState
    }
  })
}