function unique_name_420 (embedder, frameName, guest, options) {
  // When |embedder| is destroyed we should also destroy attached guest, and if
  // guest is closed by user then we should prevent |embedder| from double
  // closing guest.
  const guestId = guest.webContents.id
  const closedByEmbedder = function () {
    guest.removeListener('closed', closedByUser)
    guest.destroy()
  }
  const closedByUser = function () {
    embedder.send('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_CLOSED_' + guestId)
    embedder.removeListener('render-view-deleted', closedByEmbedder)
  }
  if (!options.webPreferences.sandbox) {
    // These events should only be handled when the guest window is opened by a
    // non-sandboxed renderer for two reasons:
    //
    // - `render-view-deleted` is emitted when the popup is closed by the user,
    //   and that will eventually result in NativeWindow::NotifyWindowClosed
    //   using a dangling pointer since `destroy()` would have been called by
    //   `closeByEmbedded`
    // - No need to emit `ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_CLOSED_` since
    //   there's no renderer code listening to it.,
    embedder.once('render-view-deleted', closedByEmbedder)
    guest.once('closed', closedByUser)
  }
  if (frameName) {
    frameToGuest.set(frameName, guest)
    guest.frameName = frameName
    guest.once('closed', function () {
      frameToGuest.delete(frameName)
    })
  }
  return guestId
}