function unique_name_104 (items, options) {
    this.dom = {}

    const me = this
    const dom = this.dom
    this.anchor = undefined
    this.items = items
    this.eventListeners = {}
    this.selection = undefined // holds the selection before the menu was opened
    this.onClose = options ? options.close : undefined

    // create root element
    const root = document.createElement('div')
    root.className = 'jsoneditor-contextmenu-root'
    dom.root = root

    // create a container element
    const menu = document.createElement('div')
    menu.className = 'jsoneditor-contextmenu'
    dom.menu = menu
    root.appendChild(menu)

    // create a list to hold the menu items
    const list = document.createElement('ul')
    list.className = 'jsoneditor-menu'
    menu.appendChild(list)
    dom.list = list
    dom.items = [] // list with all buttons

    // create a (non-visible) button to set the focus to the menu
    const focusButton = document.createElement('button')
    focusButton.type = 'button'
    dom.focusButton = focusButton
    const li = document.createElement('li')
    li.style.overflow = 'hidden'
    li.style.height = '0'
    li.appendChild(focusButton)
    list.appendChild(li)

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
    createMenuItems(list, this.dom.items, items)

    // TODO: when the editor is small, show the submenu on the right instead of inline?

    // calculate the max height of the menu with one submenu expanded
    this.maxHeight = 0 // height in pixels
    items.forEach(item => {
      const height = (items.length + (item.submenu ? item.submenu.length : 0)) * 24
      me.maxHeight = Math.max(me.maxHeight, height)
    })
  }