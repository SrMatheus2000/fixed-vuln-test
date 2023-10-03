function unique_name_301 (h, { props, data, slots }) {
    const $slots = slots()

    const childNodes = []

    // Prepend prop
    if (props.prepend) {
      childNodes.push(
        h(InputGroupPrepend, [
          h(InputGroupText, {
            domProps: htmlOrText(props.prependHTML, props.prepend)
          })
        ])
      )
    } else {
      childNodes.push(h(false))
    }

    // Prepend slot
    if ($slots.prepend) {
      childNodes.push(h(InputGroupPrepend, $slots.prepend))
    } else {
      childNodes.push(h(false))
    }

    // Default slot
    if ($slots.default) {
      childNodes.push(...$slots.default)
    } else {
      childNodes.push(h(false))
    }

    // Append prop
    if (props.append) {
      childNodes.push(
        h(InputGroupAppend, [
          h(InputGroupText, {
            domProps: htmlOrText(props.appendHTML, props.append)
          })
        ])
      )
    } else {
      childNodes.push(h(false))
    }

    // Append slot
    if ($slots.append) {
      childNodes.push(h(InputGroupAppend, $slots.append))
    } else {
      childNodes.push(h(false))
    }

    return h(
      props.tag,
      mergeData(data, {
        staticClass: 'input-group',
        class: {
          [`input-group-${props.size}`]: Boolean(props.size)
        },
        attrs: {
          id: props.id || null,
          role: 'group'
        }
      }),
      childNodes
    )
  }