function getAnnotationURL(sourceMapString) {
    return sourceMapString.match(/\/\*\s*# sourceMappingURL=(.*)\*\//)[1].trim()
  }