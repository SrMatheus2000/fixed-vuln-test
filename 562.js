(linkTo, ariaLabel, btnSlot, btnText, pageTest, key) => {
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