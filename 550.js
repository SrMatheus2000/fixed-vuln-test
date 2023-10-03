function unique_name_298 (h, { props, data, children }) {
    return h(
      props.headerTag,
      mergeData(data, {
        staticClass: 'card-header',
        class: [
          props.headerClass,
          {
            [`bg-${props.headerBgVariant}`]: Boolean(props.headerBgVariant),
            [`border-${props.headerBorderVariant}`]: Boolean(props.headerBorderVariant),
            [`text-${props.headerTextVariant}`]: Boolean(props.headerTextVariant)
          }
        ]
      }),
      children || [h('div', { domProps: htmlOrText(props.headerHTML, props.header) })]
    )
  }