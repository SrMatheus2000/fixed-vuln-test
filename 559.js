function unique_name_304 (h) {
    const $slots = this.$slots
    const $scoped = this.$scopedSlots
    const fields = this.computedFields
    const items = this.computedItems
    const tableStriped = this.striped
    const hasRowClickHandler = this.$listeners['row-clicked'] || this.selectable
    // Build the caption
    let caption = h(false)
    let captionId = null
    if (this.caption || this.captionHTML || $slots['table-caption']) {
      captionId = this.isStacked ? this.safeId('_caption_') : null
      const data = {
        key: 'caption',
        id: captionId,
        class: this.captionClasses
      }
      if (!$slots['table-caption']) {
        data.domProps = htmlOrText(this.captionHTML, this.caption)
      }
      caption = h('caption', data, $slots['table-caption'])
    }

    // Build the colgroup
    const colgroup = $slots['table-colgroup']
      ? h('colgroup', { key: 'colgroup' }, $slots['table-colgroup'])
      : h(false)

    // factory function for thead and tfoot cells (th's)
    const makeHeadCells = (isFoot = false) => {
      return fields.map((field, colIndex) => {
        let ariaLabel = ''
        if (!field.label.trim() && !field.headerTitle) {
          // In case field's label and title are empty/blank
          // We need to add a hint about what the column is about for non-dighted users
          ariaLabel = _startCase(field.key)
        }
        const ariaLabelSorting = field.sortable
          ? this.localSortDesc && this.localSortBy === field.key
            ? this.labelSortAsc
            : this.labelSortDesc
          : null
        // Assemble the aria-label
        ariaLabel = [ariaLabel, ariaLabelSorting].filter(a => a).join(': ') || null
        const ariaSort =
          field.sortable && this.localSortBy === field.key
            ? this.localSortDesc
              ? 'descending'
              : 'ascending'
            : field.sortable
              ? 'none'
              : null
        const data = {
          key: field.key,
          class: this.fieldClasses(field),
          style: field.thStyle || {},
          attrs: {
            tabindex: field.sortable ? '0' : null,
            abbr: field.headerAbbr || null,
            title: field.headerTitle || null,
            scope: isFoot ? null : 'col',
            'aria-colindex': String(colIndex + 1),
            'aria-label': ariaLabel,
            'aria-sort': ariaSort
          },
          on: {
            click: evt => {
              this.headClicked(evt, field)
            },
            keydown: evt => {
              const keyCode = evt.keyCode
              if (keyCode === KeyCodes.ENTER || keyCode === KeyCodes.SPACE) {
                this.headClicked(evt, field)
              }
            }
          }
        }
        let slot =
          isFoot && $scoped[`FOOT_${field.key}`]
            ? $scoped[`FOOT_${field.key}`]
            : $scoped[`HEAD_${field.key}`]
        if (slot) {
          slot = [slot({ label: field.label, column: field.key, field: field })]
        } else {
          data.domProps = htmlOrText(field.labelHTML, field.label)
        }
        return h('th', data, slot)
      })
    }

    // Build the thead
    let thead = h(false)
    if (this.isStacked !== true) {
      // If in always stacked mode (this.isStacked === true), then we don't bother rendering the thead
      thead = h('thead', { key: 'thead', class: this.headClasses }, [
        h('tr', { class: this.theadTrClass }, makeHeadCells(false))
      ])
    }

    // Build the tfoot
    let tfoot = h(false)
    if (this.footClone && this.isStacked !== true) {
      // If in always stacked mode (this.isStacked === true), then we don't bother rendering the tfoot
      tfoot = h('tfoot', { key: 'tfoot', class: this.footClasses }, [
        h('tr', { class: this.tfootTrClass }, makeHeadCells(true))
      ])
    }

    // Prepare the tbody rows
    const rows = []

    // Add static Top Row slot (hidden in visibly stacked mode as we can't control the data-label)
    // If in always stacked mode, we don't bother rendering the row
    if ($scoped['top-row'] && this.isStacked !== true) {
      rows.push(
        h(
          'tr',
          {
            key: 'top-row',
            staticClass: 'b-table-top-row',
            class: [
              typeof this.tbodyTrClass === 'function'
                ? this.tbodyTrClass(null, 'row-top')
                : this.tbodyTrClass
            ]
          },
          [$scoped['top-row']({ columns: fields.length, fields: fields })]
        )
      )
    } else {
      rows.push(h(false))
    }

    // Add the item data rows or the busy slot
    if ($slots['table-busy'] && this.computedBusy) {
      // Show the busy slot
      const trAttrs = {
        role: this.isStacked ? 'row' : null
      }
      const tdAttrs = {
        colspan: String(fields.length),
        role: this.isStacked ? 'cell' : null
      }
      rows.push(
        h(
          'tr',
          {
            key: 'table-busy-slot',
            staticClass: 'b-table-busy-slot',
            class: [
              typeof this.tbodyTrClass === 'function'
                ? this.tbodyTrClass(null, 'table-busy')
                : this.tbodyTrClass
            ],
            attrs: trAttrs
          },
          [h('td', { attrs: tdAttrs }, [$slots['table-busy']])]
        )
      )
    } else {
      // Show the rows
      items.forEach((item, rowIndex) => {
        const detailsSlot = $scoped['row-details']
        const rowShowDetails = Boolean(item._showDetails && detailsSlot)
        const rowSelected = this.selectedRows[rowIndex]
        // Details ID needed for aria-describedby when details showing
        const detailsId = rowShowDetails ? this.safeId(`_details_${rowIndex}_`) : null
        const toggleDetailsFn = () => {
          if (detailsSlot) {
            this.$set(item, '_showDetails', !item._showDetails)
          }
        }
        // For each item data field in row
        const tds = fields.map((field, colIndex) => {
          const formatted = this.getFormattedValue(item, field)
          const data = {
            // For the Vue key, we concatinate the column index and field key (as field keys can be duplicated)
            key: `row-${rowIndex}-cell-${colIndex}-${field.key}`,
            class: this.tdClasses(field, item),
            attrs: this.tdAttrs(field, item, colIndex),
            domProps: {}
          }
          let childNodes
          if ($scoped[field.key]) {
            childNodes = [
              $scoped[field.key]({
                item: item,
                index: rowIndex,
                field: field,
                unformatted: _get(item, field.key, ''),
                value: formatted,
                toggleDetails: toggleDetailsFn,
                detailsShowing: Boolean(item._showDetails),
                rowSelected: Boolean(rowSelected)
              })
            ]
            if (this.isStacked) {
              // We wrap in a DIV to ensure rendered as a single cell when visually stacked!
              childNodes = [h('div', {}, [childNodes])]
            }
          } else {
            if (this.isStacked) {
              // We wrap in a DIV to ensure rendered as a single cell when visually stacked!
              childNodes = [h('div', formatted)]
            } else {
              // Non stacked
              childNodes = formatted
            }
          }
          // Render either a td or th cell
          return h(field.isRowHeader ? 'th' : 'td', data, childNodes)
        })
        // Calculate the row number in the dataset (indexed from 1)
        let ariaRowIndex = null
        if (this.currentPage && this.perPage && this.perPage > 0) {
          ariaRowIndex = String((this.currentPage - 1) * this.perPage + rowIndex + 1)
        }
        // Create a unique key based on the record content, to ensure that sub components are
        // re-rendered rather than re-used, which can cause issues. If a primary key is not provided
        // we concatinate the row number and stringified record (in case there are duplicate records).
        // See: https://github.com/bootstrap-vue/bootstrap-vue/issues/2410
        const rowKey =
          this.primaryKey && typeof item[this.primaryKey] !== 'undefined'
            ? toString(item[this.primaryKey])
            : `${rowIndex}__${recToString(item)}`
        // Assemble and add the row
        rows.push(
          h(
            'tr',
            {
              key: `__b-table-row-${rowKey}__`,
              class: [
                this.rowClasses(item),
                {
                  'b-table-has-details': rowShowDetails,
                  'b-row-selected': rowSelected,
                  [`${this.dark ? 'bg' : 'table'}-${this.selectedVariant}`]:
                    rowSelected && this.selectedVariant
                }
              ],
              attrs: {
                tabindex: hasRowClickHandler ? '0' : null,
                'aria-describedby': detailsId,
                'aria-owns': detailsId,
                'aria-rowindex': ariaRowIndex,
                'aria-selected': this.selectable ? (rowSelected ? 'true' : 'false') : null,
                role: this.isStacked ? 'row' : null
              },
              on: {
                // TODO: only instatiate handlers if we have registered listeners
                auxclick: evt => {
                  if (evt.which === 2) {
                    this.middleMouseRowClicked(evt, item, rowIndex)
                  }
                },
                click: evt => {
                  this.rowClicked(evt, item, rowIndex)
                },
                keydown: evt => {
                  const keyCode = evt.keyCode
                  if (keyCode === KeyCodes.ENTER || keyCode === KeyCodes.SPACE) {
                    if (
                      evt.target &&
                      evt.target.tagName === 'TR' &&
                      evt.target === document.activeElement
                    ) {
                      this.rowClicked(evt, item, rowIndex)
                    }
                  }
                },
                contextmenu: evt => {
                  this.rowContextmenu(evt, item, rowIndex)
                },
                // Note: these events are not accessibility friendly
                dblclick: evt => {
                  this.rowDblClicked(evt, item, rowIndex)
                },
                mouseenter: evt => {
                  this.rowHovered(evt, item, rowIndex)
                },
                mouseleave: evt => {
                  this.rowUnhovered(evt, item, rowIndex)
                }
              }
            },
            tds
          )
        )
        // Row Details slot
        if (rowShowDetails) {
          const tdAttrs = { colspan: String(fields.length) }
          const trAttrs = { id: detailsId }
          if (this.isStacked) {
            tdAttrs['role'] = 'cell'
            trAttrs['role'] = 'row'
          }
          const details = h('td', { attrs: tdAttrs }, [
            detailsSlot({
              item: item,
              index: rowIndex,
              fields: fields,
              toggleDetails: toggleDetailsFn
            })
          ])
          if (tableStriped) {
            // Add a hidden row to keep table row striping consistent when details showing
            rows.push(
              h('tr', {
                key: `__b-table-details-${rowIndex}-stripe__`,
                staticClass: 'd-none',
                attrs: { 'aria-hidden': 'true' }
              })
            )
          }
          rows.push(
            h(
              'tr',
              {
                key: `__b-table-details-${rowIndex}__`,
                staticClass: 'b-table-details',
                class: [
                  typeof this.tbodyTrClass === 'function'
                    ? this.tbodyTrClass(item, 'row-details')
                    : this.tbodyTrClass
                ],
                attrs: trAttrs
              },
              [details]
            )
          )
        } else if (detailsSlot) {
          // Only add the placeholder if a the table has a row-details slot defined (but not shown)
          rows.push(h(false))
          if (tableStriped) {
            // add extra placeholder if table is striped
            rows.push(h(false))
          }
        }
      })
    }

    // Empty Items / Empty Filtered Row slot
    if (this.showEmpty && (!items || items.length === 0)) {
      let empty = this.isFiltered ? $slots['emptyfiltered'] : $slots['empty']
      if (!empty) {
        empty = h('div', {
          class: ['text-center', 'my-2'],
          domProps: this.isFiltered
            ? htmlOrText(this.emptyFilteredHTML, this.emptyFilteredText)
            : htmlOrText(this.emptyHTML, this.emptyText)
        })
      }
      empty = h(
        'td',
        {
          attrs: {
            colspan: String(fields.length),
            role: this.isStacked ? 'cell' : null
          }
        },
        [h('div', { attrs: { role: 'alert', 'aria-live': 'polite' } }, [empty])]
      )
      rows.push(
        h(
          'tr',
          {
            key: '__b-table-empty-row__',
            staticClass: 'b-table-empty-row',
            class: [
              typeof this.tbodyTrClass === 'function'
                ? this.tbodyTrClass(null, 'row-empty')
                : this.tbodyTrClass
            ],
            attrs: this.isStacked ? { role: 'row' } : {}
          },
          [empty]
        )
      )
    } else {
      rows.push(h(false))
    }

    // Static bottom row slot (hidden in visibly stacked mode as we can't control the data-label)
    // If in always stacked mode, we don't bother rendering the row
    if ($scoped['bottom-row'] && this.isStacked !== true) {
      rows.push(
        h(
          'tr',
          {
            key: '__b-table-bottom-row__',
            staticClass: 'b-table-bottom-row',
            class: [
              typeof this.tbodyTrClass === 'function'
                ? this.tbodyTrClass(null, 'row-bottom')
                : this.tbodyTrClass
            ]
          },
          [$scoped['bottom-row']({ columns: fields.length, fields: fields })]
        )
      )
    } else {
      rows.push(h(false))
    }

    // Is tbody transition enabled
    const isTransGroup = this.tbodyTransitionProps || this.tbodyTransitionHandlers
    let tbodyProps = {}
    let tbodyOn = {}
    if (isTransGroup) {
      tbodyOn = this.tbodyTransitionHandlers || {}
      tbodyProps = assign(
        {},
        this.tbodyTransitionProps || {},
        // Always use tbody element as tag. Users can't override this.
        { tag: 'tbody' }
      )
    }

    // Assemble the rows into the tbody
    const tbody = h(
      isTransGroup ? 'transition-group' : 'tbody',
      {
        props: tbodyProps,
        on: tbodyOn,
        class: this.bodyClasses,
        attrs: this.isStacked ? { role: 'rowgroup' } : {}
      },
      rows
    )

    // Assemble table
    const table = h(
      'table',
      {
        key: 'b-table',
        staticClass: 'table b-table',
        class: this.tableClasses,
        attrs: {
          // We set aria-rowcount before merging in $attrs, in case user has supplied their own
          'aria-rowcount':
            this.filteredItems.length > items.length ? String(this.filteredItems.length) : null,
          // Merge in user supplied $attrs if any
          ...this.$attrs,
          // Now we can override any $attrs here
          id: this.safeId(),
          role: this.isStacked ? 'table' : null,
          'aria-multiselectable': this.selectable
            ? this.selectMode === 'single'
              ? 'false'
              : 'true'
            : null,
          'aria-busy': this.computedBusy ? 'true' : 'false',
          'aria-colcount': String(fields.length),
          'aria-describedby':
            [
              // Preserve user supplied aria-describedby, if provided in $attrs
              (this.$attrs || {})['aria-describedby'],
              captionId
            ]
              .filter(a => a)
              .join(' ') || null
        }
      },
      [caption, colgroup, thead, tfoot, tbody]
    )

    // Add responsive wrapper if needed and return table
    return this.isResponsive
      ? h('div', { key: 'b-table-responsive', class: this.responsiveClass }, [table])
      : table
  }