function unique_name_184 (value) {
    if (value === '*') {
      return '*';
    }

    return `[${value.replace(/[[\]']+/g, '')}]`;
  }