function itemTemplate(data) {
    if (_.isEmpty(data)) {
      return '';
    }

    // If they wish to show the value in read only mode, then just return the itemValue here.
    if (this.options.readOnly && this.component.readOnlyValue) {
      return this.itemValue(data);
    }

    // Perform a fast interpretation if we should not use the template.
    if (data && !this.component.template) {
      const itemLabel = data.label || data;
      return (typeof itemLabel === 'string') ? this.t(itemLabel) : itemLabel;
    }
    if (typeof data === 'string') {
      return this.t(data);
    }

    if (data.data) {
      // checking additional fields in the template for the selected Entire Object option
      const hasNestedFields = /item\.data\.\w*/g.test(this.component.template);
      data.data = this.isEntireObjectDisplay() && _.isObject(data.data) && !hasNestedFields
        ? JSON.stringify(data.data)
        : data.data;
    }
    const template = this.sanitize(this.component.template ? this.interpolate(this.component.template, { item: data }) : data.label);
    if (template) {
      const label = template.replace(/<\/?[^>]+(>|$)/g, '');
      if (!label || !this.t(label)) return;
      return template.replace(label, this.t(label));
    }
    else {
      return JSON.stringify(data);
    }
  }