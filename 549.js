function unique_name_297 (h, { props, data, children }) {
    return h(
      props.footerTag,
      mergeData(data, {
        staticClass: 'card-footer',
        class: [
          props.footerClass,
          {
            [`bg-${props.footerBgVariant}`]: Boolean(props.footerBgVariant),
            [`border-${props.footerBorderVariant}`]: Boolean(props.footerBorderVariant),
            [`text-${props.footerTextVariant}`]: Boolean(props.footerTextVariant)
          }
        ]
      }),
      children || [h('div', { domProps: htmlOrText(props.footerHTML, props.footer) })]
    )
  }