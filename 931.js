function unique_name_528(rootID, transaction, mountDepth) {
    ReactComponent.Mixin.mountComponent.call(
      this,
      rootID,
      transaction,
      mountDepth
    );
    return (
      '<span ' + ReactMount.ATTR_NAME + '="' + escapeTextForBrowser(rootID) + '">' +
        escapeTextForBrowser(this.props.text) +
      '</span>'
    );
  }