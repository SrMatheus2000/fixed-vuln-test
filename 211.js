(child, index) => {
          child.index = index
          const childField = child.dom.field
          if (childField) {
            childField.textContent = index
          }
        }