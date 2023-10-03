function unique_name_252 (id) {
    if (typeof vertices[id] !== 'undefined') {
      if (config.securityLevel === 'strict') {
        vertices[id].link = linkStr.replace(/javascript:.*/g, '')
      } else {
        vertices[id].link = linkStr
      }
    }
  }