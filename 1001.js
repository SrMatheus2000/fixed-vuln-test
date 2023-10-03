function unique_name_581(name, attrs, empty) {
				blocked = true;

				if (name == 'script' || name == 'noscript') {
					return;
				}

				for (var i = 0; i < attrs.length; i++) {
					if (attrs[i].name.indexOf('on') === 0) {
						return;
					}

					if (attrs[i].name == 'style') {
						attrs[i].value = editor.dom.serializeStyle(editor.dom.parseStyle(attrs[i].value), name);
					}
				}

				writer.start(name, attrs, empty);
				blocked = false;
			}