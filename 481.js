function unique_name_253 (ids, linkStr, tooltip) {
  ids.split(',').forEach(function (id) {
    if (typeof vertices[id] !== 'undefined') {
      if (config.securityLevel === 'strict') {
        vertices[id].link = linkStr.replace(/javascript:.*/g, '')
      } else {
        vertices[id].link = linkStr
      }
    }
  })
  setTooltip(ids, tooltip)
  setClass(ids, 'clickable')
}