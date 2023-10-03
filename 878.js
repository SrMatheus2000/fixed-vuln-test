function unique_name_493 () {
    $(this.el).html(Handlebars.templates.main(this.model));
    this.info = this.$('.info')[0];

    if (this.info) {
      this.info.addEventListener('click', this.onLinkClick, true);
    }

    this.model.securityDefinitions = this.model.securityDefinitions || {};

    // Render each resource

    var resources = {};
    var counter = 0;
    for (var i = 0; i < this.model.apisArray.length; i++) {
      var resource = this.model.apisArray[i];
      var id = resource.name;
      while (typeof resources[id] !== 'undefined') {
        id = id + '_' + counter;
        counter += 1;
      }
      resource.id = sanitizeHtml(id);
      resources[id] = resource;
      this.addResource(resource, this.model.auths);
    }

    $('.propWrap').hover(function onHover(){
      $('.optionsWrapper', $(this)).show();
    }, function offhover(){
      $('.optionsWrapper', $(this)).hide();
    });
    return this;
  }