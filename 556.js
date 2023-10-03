function unique_name_303 (h) {
    let childNodes = h(false)
    if (this.$slots.default) {
      childNodes = this.$slots.default
    } else if (this.label || this.labelHTML) {
      childNodes = h('span', { domProps: htmlOrText(this.labelHTML, this.label) })
    } else if (this.computedShowProgress) {
      childNodes = this.progress.toFixed(this.computedPrecision)
    } else if (this.computedShowValue) {
      childNodes = this.value.toFixed(this.computedPrecision)
    }
    return h(
      'div',
      {
        class: this.progressBarClasses,
        style: this.progressBarStyles,
        attrs: {
          role: 'progressbar',
          'aria-valuemin': '0',
          'aria-valuemax': this.computedMax.toString(),
          'aria-valuenow': this.value.toFixed(this.computedPrecision)
        }
      },
      [childNodes]
    )
  }