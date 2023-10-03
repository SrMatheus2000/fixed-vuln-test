function unique_name_110 (token, array) {
        elem.style.visibility = 'hidden'
        ix = 0
        elem.textContent = ''
        const vph = (window.innerHeight || document.documentElement.clientHeight)
        const rect = elem.parentNode.getBoundingClientRect()
        const distanceToTop = rect.top - 6 // heuristic give 6px
        const distanceToBottom = vph - rect.bottom - 6 // distance from the browser border.

        rows = []
        const filterFn = typeof config.filter === 'function' ? config.filter : defaultFilterFunction[config.filter]

        const filtered = !filterFn ? [] : array.filter(match => filterFn(config.caseSensitive ? token : token.toLowerCase(), config.caseSensitive ? match : match.toLowerCase(), config))

        rows = filtered.map(row => {
          const divRow = document.createElement('div')
          divRow.className = 'item'
          // divRow.style.color = config.color;
          divRow.onmouseover = onMouseOver
          divRow.onmouseout = onMouseOut
          divRow.onmousedown = onMouseDown
          divRow.__hint = row
          divRow.textContent = ''
          divRow.appendChild(document.createTextNode(row.substring(0, token.length)))
          const b = document.createElement('b')
          b.appendChild(document.createTextNode(row.substring(token.length)))
          divRow.appendChild(b)
          elem.appendChild(divRow)
          return divRow
        })

        if (rows.length === 0) {
          return // nothing to show.
        }
        if (rows.length === 1 && ((token.toLowerCase() === rows[0].__hint.toLowerCase() && !config.caseSensitive) ||
                                           (token === rows[0].__hint && config.caseSensitive))) {
          return // do not show the dropDown if it has only one element which matches what we have just displayed.
        }

        if (rows.length < 2) return
        p.highlight(0)

        if (distanceToTop > distanceToBottom * 3) { // Heuristic (only when the distance to the to top is 4 times more than distance to the bottom
          elem.style.maxHeight = distanceToTop + 'px' // we display the dropDown on the top of the input text
          elem.style.top = ''
          elem.style.bottom = '100%'
        } else {
          elem.style.top = '100%'
          elem.style.bottom = ''
          elem.style.maxHeight = distanceToBottom + 'px'
        }
        elem.style.visibility = 'visible'
      }