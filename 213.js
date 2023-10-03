function unique_name_106 (event) {
    const type = event.type
    const target = event.target || event.srcElement
    const dom = this.dom
    const node = this
    const expandable = this._hasChilds()

    if (typeof this.editor.options.onEvent === 'function') {
      this._onEvent(event)
    }

    // check if mouse is on menu or on dragarea.
    // If so, highlight current row and its childs
    if (target === dom.drag || target === dom.menu) {
      if (type === 'mouseover') {
        this.editor.highlighter.highlight(this)
      } else if (type === 'mouseout') {
        this.editor.highlighter.unhighlight()
      }
    }

    // context menu events
    if (type === 'click' && target === dom.menu) {
      const highlighter = node.editor.highlighter
      highlighter.highlight(node)
      highlighter.lock()
      addClassName(dom.menu, 'jsoneditor-selected')
      this.showContextMenu(dom.menu, () => {
        removeClassName(dom.menu, 'jsoneditor-selected')
        highlighter.unlock()
        highlighter.unhighlight()
      })
    }

    // expand events
    if (type === 'click') {
      if (target === dom.expand) {
        if (expandable) {
          const recurse = event.ctrlKey // with ctrl-key, expand/collapse all
          this._onExpand(recurse)
        }
      }
    }

    if (type === 'click' && (event.target === node.dom.tdColor || event.target === node.dom.color)) {
      this._showColorPicker()
    }

    // swap the value of a boolean when the checkbox displayed left is clicked
    if (type === 'change' && target === dom.checkbox) {
      this.dom.value.textContent = String(!this.value)
      this._getDomValue()
      this._updateDomDefault()
    }

    // update the value of the node based on the selected option
    if (type === 'change' && target === dom.select) {
      this.dom.value.innerHTML = this._escapeHTML(dom.select.value)
      this._getDomValue()
      this._updateDomValue()
    }

    // value events
    const domValue = dom.value
    if (target === domValue) {
      // noinspection FallthroughInSwitchStatementJS
      switch (type) {
        case 'blur':
        case 'change': {
          this._getDomValue()
          this._clearValueError()
          this._updateDomValue()

          const escapedValue = this._escapeHTML(this.value)
          if (escapedValue !== this._unescapeHTML(getInnerText(domValue))) {
            // only update when there is an actual change, else you loose the
            // caret position when changing tabs or whilst typing
            domValue.innerHTML = escapedValue
          }
          break
        }

        case 'input':
          // this._debouncedGetDomValue(true); // TODO
          this._getDomValue()
          this._updateDomValue()
          break

        case 'keydown':
        case 'mousedown':
          // TODO: cleanup
          this.editor.selection = this.editor.getDomSelection()
          break

        case 'click':
          if (event.ctrlKey && this.editable.value) {
            // if read-only, we use the regular click behavior of an anchor
            if (isUrl(this.value)) {
              event.preventDefault()
              window.open(this.value, '_blank')
            }
          }
          break

        case 'keyup':
          // this._debouncedGetDomValue(true); // TODO
          this._getDomValue()
          this._updateDomValue()
          break

        case 'cut':
        case 'paste':
          setTimeout(() => {
            node._getDomValue()
            node._updateDomValue()
          }, 1)
          break
      }
    }

    // field events
    const domField = dom.field
    if (target === domField) {
      switch (type) {
        case 'blur': {
          this._getDomField(true)
          this._updateDomField()

          const escapedField = this._escapeHTML(this.field)
          if (escapedField !== this._unescapeHTML(getInnerText(domField))) {
            // only update when there is an actual change, else you loose the
            // caret position when changing tabs or whilst typing
            domField.innerHTML = escapedField
          }
          break
        }

        case 'input':
          this._getDomField()
          this._updateSchema()
          this._updateDomField()
          this._updateDomValue()
          break

        case 'keydown':
        case 'mousedown':
          this.editor.selection = this.editor.getDomSelection()
          break

        case 'keyup':
          this._getDomField()
          this._updateDomField()
          break

        case 'cut':
        case 'paste':
          setTimeout(() => {
            node._getDomField()
            node._updateDomField()
          }, 1)
          break
      }
    }

    // focus
    // when clicked in whitespace left or right from the field or value, set focus
    const domTree = dom.tree
    if (domTree && target === domTree.parentNode && type === 'click' && !event.hasMoved) {
      const left = (event.offsetX !== undefined)
        ? (event.offsetX < (this.getLevel() + 1) * 24)
        : (event.pageX < getAbsoluteLeft(dom.tdSeparator))// for FF
      if (left || expandable) {
        // node is expandable when it is an object or array
        if (domField) {
          setEndOfContentEditable(domField)
          domField.focus()
        }
      } else {
        if (domValue && !this.enum) {
          setEndOfContentEditable(domValue)
          domValue.focus()
        }
      }
    }
    if (((target === dom.tdExpand && !expandable) || target === dom.tdField || target === dom.tdSeparator) &&
        (type === 'click' && !event.hasMoved)) {
      if (domField) {
        setEndOfContentEditable(domField)
        domField.focus()
      }
    }

    if (type === 'keydown') {
      this.onKeyDown(event)
    }
  }