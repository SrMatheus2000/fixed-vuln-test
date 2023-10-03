function createMenuItems (list, domItems, items) {
      items.forEach(item => {
        if (item.type === 'separator') {
          // create a separator
          const separator = document.createElement('div')
          separator.className = 'jsoneditor-separator'
          const li = document.createElement('li')
          li.appendChild(separator)
          list.appendChild(li)
        } else {
          const domItem = {}

          // create a menu item
          const li = document.createElement('li')
          list.appendChild(li)

          // create a button in the menu item
          const button = document.createElement('button')
          button.type = 'button'
          button.className = item.className
          domItem.button = button
          if (item.title) {
            button.title = item.title
          }
          if (item.click) {
            button.onclick = event => {
              event.preventDefault()
              me.hide()
              item.click()
            }
          }
          li.appendChild(button)

          // create the contents of the button
          if (item.submenu) {
            // add the icon to the button
            const divIcon = document.createElement('div')
            divIcon.className = 'jsoneditor-icon'
            button.appendChild(divIcon)
            const divText = document.createElement('div')
            divText.className = 'jsoneditor-text' +
                (item.click ? '' : ' jsoneditor-right-margin')
            divText.appendChild(document.createTextNode(item.text))
            button.appendChild(divText)

            let buttonSubmenu
            if (item.click) {
              // submenu and a button with a click handler
              button.className += ' jsoneditor-default'

              const buttonExpand = document.createElement('button')
              buttonExpand.type = 'button'
              domItem.buttonExpand = buttonExpand
              buttonExpand.className = 'jsoneditor-expand'
              const buttonExpandInner = document.createElement('div')
              buttonExpandInner.className = 'jsoneditor-expand'
              buttonExpand.appendChild(buttonExpandInner)
              li.appendChild(buttonExpand)
              if (item.submenuTitle) {
                buttonExpand.title = item.submenuTitle
              }

              buttonSubmenu = buttonExpand
            } else {
              // submenu and a button without a click handler
              const divExpand = document.createElement('div')
              divExpand.className = 'jsoneditor-expand'
              button.appendChild(divExpand)

              buttonSubmenu = button
            }

            // attach a handler to expand/collapse the submenu
            buttonSubmenu.onclick = event => {
              event.preventDefault()
              me._onExpandItem(domItem)
              buttonSubmenu.focus()
            }

            // create the submenu
            const domSubItems = []
            domItem.subItems = domSubItems
            const ul = document.createElement('ul')
            domItem.ul = ul
            ul.className = 'jsoneditor-menu'
            ul.style.height = '0'
            li.appendChild(ul)
            createMenuItems(ul, domSubItems, item.submenu)
          } else {
            // no submenu, just a button with clickhandler
            const icon = document.createElement('div')
            icon.className = 'jsoneditor-icon'
            button.appendChild(icon)

            const text = document.createElement('div')
            text.className = 'jsoneditor-text'
            text.appendChild(document.createTextNode(translate(item.text)))
            button.appendChild(text)
          }

          domItems.push(domItem)
        }
      })
    }