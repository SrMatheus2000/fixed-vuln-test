(value) => {
          if (props.suggestionText) {
            return `<div><strong>${lodash.escape(props.suggestionText)}</strong> ${lodash.escape(value[props.displayKey])}</div>`;
          }
          return `<div>${lodash.escape(value[props.displayKey])}</div>`;
        }