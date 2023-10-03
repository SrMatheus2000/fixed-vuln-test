function unique_name_435 () {
    const api_key_base64 = Buffer.from(this.options.api_key).toString('base64')
    return `Basic ${api_key_base64}`
  }