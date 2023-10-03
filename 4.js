function unique_name_1(name) {
    return [
      this.aliasable('container.lookup'),
      '(depths, ',
      JSON.stringify(name),
      ')'
    ];
  }