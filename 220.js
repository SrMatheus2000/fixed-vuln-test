row => {
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
        }