function unique_name_305 (h) {
    const $slots = this.$slots

    const inputs = this.formOptions.map((option, idx) => {
      const uid = `_BV_option_${idx}_`
      return h(
        this.is_RadioGroup ? 'b-form-radio' : 'b-form-checkbox',
        {
          key: uid,
          props: {
            id: this.safeId(uid),
            value: option.value,
            disabled: option.disabled || null
            // Do we need to do these, since radio's will know they are inside here?
            // name: this.groupName,
            // form: this.form || null,
            // required: Boolean(this.name && this.required),
          }
        },
        [h('span', { domProps: htmlOrText(option.html, option.text) })]
      )
    })
    return h(
      'div',
      {
        class: this.groupClasses,
        attrs: {
          id: this.safeId(),
          role: this.is_RadioGroup ? 'radiogroup' : 'group',
          // Tabindex to allow group to be focused if needed
          tabindex: '-1',
          'aria-required': this.required ? 'true' : null,
          'aria-invalid': this.computedAriaInvalid
        }
      },
      [$slots.first, inputs, $slots.default]
    )
  }