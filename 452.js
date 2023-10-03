property => {
    /** Set Text helper function
     * @function setText
     * @param {Element} elem Element to set the text on
     * @param {String} property Name of the property to render
     * @param {String} value (Optional) A value to use instead of a property (used in lil-list-text)
     */
    const setText = (elem, property, value) => elem.textContent = value || state[property].value;

    /** Set style helper function
     * @function setStyle
     * @param {Element} Element to set the styles on
     * @property {String} Name of the property to render
     */
    const setStyle = (elem, property) => {
      elem.setAttribute("style", null);
      Object.keys(state[property].value).forEach(key => {
        elem.style[key] = state[property].value[key];
      });
    };

    /** Set list helper function
     * calls setText() and setStyle() to apply those properties to the template node\
     * @function setList
     * @param {Element} Element to set the styles on
     * @property {String} Name of the property to render
     */
    const setList = (elem, property) => {
      //TODO: Find a way to update without clearing lists
      elem.textContent = "";
      state[property].value.forEach(value => {
        let clone = document.importNode(state[property].template.content, true);
        clone.querySelectorAll("[lil-list-text]").forEach(node => {
          setText(node, null, value[node.getAttribute("lil-list-text")]);
        });
        clone.querySelectorAll("[lil-style]").forEach(node => {
          setStyle(node, node.getAttribute("lil-style"));
        });
        elem.appendChild(clone);
      });
    };

    state[property].elem.forEach(elem => {
      switch (state[property].bindType) {
        case "text":
          setText(elem, property);
          break;
        case "style":
          setStyle(elem, property);
          break;
        case "list":
          setList(elem, property);
          break;
      }
    });

    return state[property];
  }