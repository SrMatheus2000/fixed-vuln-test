function unique_name_300 (h) {
    const $slots = this.$slots
    const options = this.formOptions.map((option, index) => {
      return h('option', {
        key: `option_${index}_opt`,
        attrs: { disabled: Boolean(option.disabled) },
        domProps: { ...htmlOrText(option.html, option.text), value: option.value }
      })
    })
    return h(
      'select',
      {
        ref: 'input',
        class: this.inputClass,
        directives: [
          {
            name: 'model',
            rawName: 'v-model',
            value: this.localValue,
            expression: 'localValue'
          }
        ],
        attrs: {
          id: this.safeId(),
          name: this.name,
          form: this.form || null,
          multiple: this.multiple || null,
          size: this.computedSelectSize,
          disabled: this.disabled,
          required: this.required,
          'aria-required': this.required ? 'true' : null,
          'aria-invalid': this.computedAriaInvalid
        },
        on: {
          change: evt => {
            const target = evt.target
            const selectedVal = arrayFrom(target.options)
              .filter(o => o.selected)
              .map(o => ('_value' in o ? o._value : o.value))
            this.localValue = target.multiple ? selectedVal : selectedVal[0]
            this.$nextTick(() => {
              this.$emit('change', this.localValue)
            })
          }
        }
      },
      [$slots.first, options, $slots.default]
    )
  }