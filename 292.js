function unique_name_142 (i) {
    const s = this.source
    const l = s.length
    if (i >= l) {
      return l
    }
    let c = s.charCodeAt(i), next
    if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
      return i + 1
    }
    return i + 2
  }