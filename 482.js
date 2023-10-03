function unique_name_254 (ids, _linkStr) {
  let linkStr = _linkStr
  if (config.securityLevel === 'strict') {
    linkStr = _linkStr.replace(/javascript:.*/g, '')
  }
  ids.split(',').forEach(function (id) {
    let rawTask = findTaskById(id)
    if (typeof rawTask !== 'undefined') {
      pushFun(id, () => { window.open(linkStr, '_self') })
    }
  })
  setClass(ids, 'clickable')
}