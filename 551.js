function unique_name_299 (h) {
    const $slots = this.$slots
    const noDrag = !this.carousel.noTouch && hasTouchSupport

    let img = $slots.img
    if (!img && (this.imgSrc || this.imgBlank)) {
      img = h('b-img', {
        props: {
          fluidGrow: true,
          block: true,
          src: this.imgSrc,
          blank: this.imgBlank,
          blankColor: this.imgBlankColor,
          width: this.computedWidth,
          height: this.computedHeight,
          alt: this.imgAlt
        },
        // Touch support event handler
        on: noDrag
          ? {
              dragstart: e => {
                e.preventDefault()
              }
            }
          : {}
      })
    }
    if (!img) {
      img = h(false)
    }

    const content = h(
      this.contentTag,
      { staticClass: 'carousel-caption', class: this.contentClasses },
      [
        this.caption || this.captionHTML
          ? h(this.captionTag, {
              domProps: htmlOrText(this.captionHTML, this.caption)
            })
          : h(false),
        this.text || this.textHTML
          ? h(this.textTag, { domProps: htmlOrText(this.textHTML, this.text) })
          : h(false),
        $slots.default
      ]
    )

    return h(
      'div',
      {
        staticClass: 'carousel-item',
        style: { background: this.background || this.carousel.background || null },
        attrs: { id: this.safeId(), role: 'listitem' }
      },
      [img, content]
    )
  }