(option, idx) => {
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
    }