function unique_name_421 (embedder, url, frameName, options, postData) {
  let guest = frameToGuest.get(frameName)
  if (frameName && (guest != null)) {
    guest.loadURL(url)
    return guest.webContents.id
  }

  // Remember the embedder window's id.
  if (options.webPreferences == null) {
    options.webPreferences = {}
  }

  guest = new BrowserWindow(options)
  if (!options.webContents || url !== 'about:blank') {
    // We should not call `loadURL` if the window was constructed from an
    // existing webContents(window.open in a sandboxed renderer) and if the url
    // is not 'about:blank'.
    //
    // Navigating to the url when creating the window from an existing
    // webContents would not be necessary(it will navigate there anyway), but
    // apparently there's a bug that allows the child window to be scripted by
    // the opener, even when the child window is from another origin.
    //
    // That's why the second condition(url !== "about:blank") is required: to
    // force `OverrideSiteInstanceForNavigation` to be called and consequently
    // spawn a new renderer if the new window is targeting a different origin.
    //
    // If the URL is "about:blank", then it is very likely that the opener just
    // wants to synchronously script the popup, for example:
    //
    //     let popup = window.open()
    //     popup.document.body.write('<h1>hello</h1>')
    //
    // The above code would not work if a navigation to "about:blank" is done
    // here, since the window would be cleared of all changes in the next tick.
    const loadOptions = {}
    if (postData != null) {
      loadOptions.postData = postData
      loadOptions.extraHeaders = 'content-type: application/x-www-form-urlencoded'
      if (postData.length > 0) {
        const postDataFront = postData[0].bytes.toString()
        const boundary = /^--.*[^-\r\n]/.exec(postDataFront)
        if (boundary != null) {
          loadOptions.extraHeaders = `content-type: multipart/form-data; boundary=${boundary[0].substr(2)}`
        }
      }
    }
    guest.loadURL(url, loadOptions)
  }

  return setupGuest(embedder, frameName, guest, options)
}