function unique_name_513 (stringId, subs) {
        var message = this.get('strings.' + stringId);
        this._ariaNode.set('text', subs ? Lang.sub(message, subs) : message);
    }