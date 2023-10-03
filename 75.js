function onContextMenu ({ id }) {
  if (id === 'vue-inspect-instance') {
    const src = 'window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__'

    chrome.devtools.inspectedWindow.eval(src, function (res, err) {
      if (err) {
        console.log(err)
      }
      if (typeof res !== 'undefined' && res) {
        panelAction(() => {
          chrome.runtime.sendMessage('vue-get-context-menu-target')
        }, 'Open Vue devtools to see component details')
      } else {
        pendingAction = null
        toast('component-not-found')
      }
    })
  }
}