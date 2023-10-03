function unique_name_381(element, name) {
            element.name = name;

            // Workaround IE 6/7 issue
            // - https://github.com/SteveSanderson/knockout/issues/197
            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
            if (ieVersion <= 7) {
                try {
                    var escapedName = element.name.replace(/[&<>'"]/g, function(r){ return "&#" + r.charCodeAt(0) + ";"; });
                    element.mergeAttributes(document.createElement("<input name='" + escapedName + "'/>"), false);
                }
                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
            }
        }