(option, index) => {
      return h('option', {
        key: `option_${index}_opt`,
        attrs: { disabled: Boolean(option.disabled) },
        domProps: { ...htmlOrText(option.html, option.text), value: option.value }
      })
    }