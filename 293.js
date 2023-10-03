function at(i) {
    const s = this.source
    const l = s.length
    if (i >= l) {
      return -1
    }
    const c = s.charCodeAt(i)
    if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    const next = s.charCodeAt(i + 1)
    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  }