function getAnnotationURL(sourceMapString) {
    return sourceMapString.match(/\/\*\s*# sourceMappingURL=((?:(?!sourceMappingURL=).)*)\*\//)[1].trim()
  }