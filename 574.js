function unique_name_312 (tabId, options, atIndex) {
    if (!tabId) {
      return this;
    }

    if (!options) {
      options = {};
    }

    const startFromZero = this.tablist.find('li').not('.application-menu-trigger, .add-tab-button').length === 0;

    // Sanitize
    tabId = `${tabId.replace(/#/g, '')}`;
    options.name = options.name ? options.name.toString() : '&nbsp;';
    options.isDismissible = options.isDismissible ? options.isDismissible === true : false;
    options.isDropdown = options.isDropdown ? options.isDropdown === true : false;

    function getObjectFromSelector(sourceString) {
      const contentType = typeof sourceString;
      let hasId;

      switch (contentType) {
        case 'string':
          hasId = sourceString.match(/#/g);
          // Text Content or a Selector.
          if (hasId !== null) {
            const obj = $(sourceString);
            sourceString = obj.length ? obj : sourceString;
          }
          // do nothing if it's just a string of text.
          break;
        default:
          break;
      }
      return sourceString;
    }

    if (options.content) {
      options.content = getObjectFromSelector(options.content);
    }
    if (options.dropdown) {
      options.dropdown = getObjectFromSelector(options.dropdown);
    }

    // Build
    const tabHeaderMarkup = $('<li role="presentation" class="tab"></li>');
    const anchorMarkup = $(`<a href="#${tabId}" role="tab" aria-expanded="false" aria-selected="false" tabindex="-1">${xssUtils.escapeHTML(options.name)}</a>`);
    const tabContentMarkup = this.createTabPanel(tabId, options.content);

    tabHeaderMarkup.html(anchorMarkup);

    if (options.isDismissible) {
      tabHeaderMarkup.addClass('dismissible');
      tabHeaderMarkup.append($.createIconElement({ icon: 'close', classes: 'close icon' }));
    }

    if (this.settings.tabCounts) {
      anchorMarkup.prepend('<span class="count">0 </span>');
    }

    if (options.dropdown) {
      // TODO: Need to implement the passing of Dropdown Tab menus into this method.
    }

    function insertIntoTabset(self, targetIndex) {
      let method;
      const tabs = self.tablist.children('li');
      const nonSpecialTabs = tabs.not('.application-menu-trigger, .add-tab-button');
      let finalIndex = tabs.length - 1;

      if (!tabs.length) {
        tabHeaderMarkup.appendTo(self.tablist);
        tabContentMarkup.appendTo(self.container);
        return;
      }

      const addTabButton = tabs.filter('.add-tab-button');
      const appMenuTrigger = tabs.filter('.application-menu-trigger');

      // NOTE: Cannot simply do !targetIndex here because zero is a valid index
      if (targetIndex === undefined || targetIndex === null || isNaN(targetIndex)) {
        targetIndex = tabs.length;
      }

      function pastEndOfTabset(index) {
        return index > tabs.length - 1;
      }

      function atBeginningOfTabset(index) {
        return index <= 0;
      }

      if (tabs.length > nonSpecialTabs.length) {
        if (pastEndOfTabset(targetIndex) && addTabButton && addTabButton.length) {
          targetIndex -= 1;
        }

        if (atBeginningOfTabset(targetIndex) && appMenuTrigger && appMenuTrigger.length) {
          targetIndex += 1;
        }
      }

      const conditionInsertTabBefore = tabs.eq(targetIndex).length > 0;

      finalIndex = conditionInsertTabBefore ? targetIndex : finalIndex;

      method = 'insertAfter';
      if (conditionInsertTabBefore) {
        method = 'insertBefore';
      }

      tabHeaderMarkup[method](tabs.eq(finalIndex));
      tabContentMarkup.appendTo(self.container);
    }

    insertIntoTabset(this, atIndex);

    // Add each new part to their respective collections.
    this.panels = this.panels.add(tabContentMarkup);
    this.anchors = this.anchors.add(anchorMarkup);

    // Link the two items via data()
    anchorMarkup.data('panel-link', tabContentMarkup);
    tabContentMarkup.data('tab-link', anchorMarkup);
    // TODO: When Dropdown Tabs can be added/removed, add that here

    // Make it possible for Module Tabs to display a tooltip containing their contents
    // if the contents are cut off by ellipsis.
    if (this.settings.moduleTabsTooltips) {
      anchorMarkup.on('beforeshow.toolbar', () => anchorMarkup.data('cutoffTitle') === 'yes').tooltip({
        content: `${anchorMarkup.text().trim()}`
      });
    }

    // Recalc tab width before detection of overflow
    if (this.isModuleTabs()) {
      this.adjustModuleTabs();
    }

    // Adjust tablist height
    this.setOverflow();

    // If started from zero, position the focus state/bar and activate the tab
    if (startFromZero) {
      this.positionFocusState(anchorMarkup);
      this.focusBar(tabHeaderMarkup);
      if (!this.activate(anchorMarkup.attr('href'))) {
        return this;
      }
      anchorMarkup.focus();
    }

    if (options.doActivate) {
      this.activate(anchorMarkup.attr('href'));
    }

    return this;
  }