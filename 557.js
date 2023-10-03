(field, colIndex) => {
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
      }