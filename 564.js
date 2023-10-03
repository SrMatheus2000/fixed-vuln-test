function unique_name_306 (h) {
    const buttons = []
    const numberOfPages = this.localNumPages
    const disabled = this.disabled
    const { showFirstDots, showLastDots } = this.paginationParams

    // Helper function
    const isActivePage = pageNum => pageNum === this.currentPage

    // Factory function for prev/next/first/last buttons
    const makeEndBtn = (linkTo, ariaLabel, btnSlot, btnText, pageTest, key) => {
      let button
      const domProps = btnSlot ? {} : { textContent: btnText }
      const staticClass = 'page-item'
      const attrs = {
        role: 'none presentation',
        'aria-hidden': disabled ? 'true' : null
      }
      if (disabled || isActivePage(pageTest) || linkTo < 1 || linkTo > numberOfPages) {
        button = h('li', { key, attrs, staticClass, class: ['disabled'] }, [
          h('span', { staticClass: 'page-link', domProps }, [btnSlot])
        ])
      } else {
        button = h('li', { key, attrs, staticClass }, [
          h(
            'b-link',
            {
              staticClass: 'page-link',
              props: this.linkProps(linkTo),
              attrs: {
                role: 'menuitem',
                tabindex: '-1',
                'aria-label': ariaLabel,
                'aria-controls': this.ariaControls || null
              },
              on: {
                click: evt => {
                  this.onClick(linkTo, evt)
                },
                keydown: onSpaceKey
              }
            },
            [h('span', { domProps }, [btnSlot])]
          )
        ])
      }
      return button
    }

    // Ellipsis factory
    const makeEllipsis = isLast => {
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

    // Goto First Page button bookend
    buttons.push(
      this.hideGotoEndButtons
        ? h(false)
        : makeEndBtn(
            1,
            this.labelFirstPage,
            this.$slots['first-text'],
            stripTags(this.firstText),
            1,
            'bookend-goto-first'
          )
    )

    // Goto Previous page button bookend
    buttons.push(
      makeEndBtn(
        this.currentPage - 1,
        this.labelPrevPage,
        this.$slots['prev-text'],
        stripTags(this.prevText),
        1,
        'bookend-goto-prev'
      )
    )

    // First Ellipsis Bookend
    buttons.push(showFirstDots ? makeEllipsis(false) : h(false))

    // Individual Page links
    this.pageList.forEach(page => {
      let inner
      const pageText = this.makePage(page.number)
      const active = isActivePage(page.number)
      const staticClass = 'page-link'
      const attrs = {
        role: 'menuitemradio',
        'aria-disabled': disabled ? 'true' : null,
        'aria-controls': this.ariaControls || null,
        'aria-label': `${this.labelPage} ${page.number}`,
        'aria-checked': active ? 'true' : 'false',
        'aria-posinset': page.number,
        'aria-setsize': numberOfPages,
        // ARIA "roving tabindex" method
        tabindex: disabled ? null : active ? '0' : '-1'
      }
      if (disabled) {
        inner = h(
          'span',
          {
            key: `page-${page.number}-link-disabled`,
            staticClass,
            attrs
          },
          pageText
        )
      } else {
        inner = h(
          'b-link',
          {
            key: `page-${page.number}-link`,
            props: this.linkProps(page.number),
            staticClass,
            attrs,
            on: {
              click: evt => {
                this.onClick(page.number, evt)
              },
              keydown: onSpaceKey
            }
          },
          pageText
        )
      }
      buttons.push(
        h(
          'li',
          {
            key: `page-${page.number}`,
            staticClass: 'page-item',
            class: [disabled ? 'disabled' : '', active ? 'active' : '', page.classes],
            attrs: { role: 'none presentation' }
          },
          [inner]
        )
      )
    })

    // Last Ellipsis Bookend
    buttons.push(showLastDots ? makeEllipsis(true) : h(false))

    // Goto Next page button bookend
    buttons.push(
      makeEndBtn(
        this.currentPage + 1,
        this.labelNextPage,
        this.$slots['next-text'],
        this.nextText,
        numberOfPages,
        'bookend-goto-next'
      )
    )

    // Goto Last Page button bookend
    buttons.push(
      this.hideGotoEndButtons
        ? h(false)
        : makeEndBtn(
            numberOfPages,
            this.labelLastPage,
            this.$slots['last-text'],
            this.lastText,
            numberOfPages,
            'bookend-goto-last'
          )
    )

    // Assemble the paginatiom buttons
    const pagination = h(
      'ul',
      {
        ref: 'ul',
        class: ['pagination', 'b-pagination', this.btnSize, this.alignment],
        attrs: {
          role: 'menubar',
          'aria-disabled': disabled ? 'true' : 'false',
          'aria-label': this.ariaLabel || null
        },
        on: {
          keydown: evt => {
            const keyCode = evt.keyCode
            const shift = evt.shiftKey
            if (keyCode === KeyCodes.LEFT) {
              evt.preventDefault()
              shift ? this.focusFirst() : this.focusPrev()
            } else if (keyCode === KeyCodes.RIGHT) {
              evt.preventDefault()
              shift ? this.focusLast() : this.focusNext()
            }
          }
        }
      },
      buttons
    )

    // if we are pagination-nav, wrap in '<nav>' wrapper
    if (this.isNav) {
      return h(
        'nav',
        {
          attrs: {
            'aria-disabled': disabled ? 'true' : null,
            'aria-hidden': disabled ? 'true' : 'false'
          }
        },
        [pagination]
      )
    } else {
      return pagination
    }
  }