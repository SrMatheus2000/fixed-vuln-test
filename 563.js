isLast => {
      return h(
        'li',
        {
          key: `elipsis-${isLast ? 'last' : 'first'}`,
          class: ['page-item', 'disabled', 'd-none', 'd-sm-flex'],
          attrs: { role: 'separator' }
        },
        [
          this.$slots['ellipsis-text'] ||
            h('span', {
              class: ['page-link'],
              domProps: { textContent: this.ellipsisText }
            })
        ]
      )
    }