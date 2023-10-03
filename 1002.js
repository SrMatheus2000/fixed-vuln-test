function sanitize(html) {
		if (editor.settings.media_filter_html === false) {
			return html;
		}

		var writer = new tinymce.html.Writer(), blocked;

		new tinymce.html.SaxParser({
			validate: false,
			allow_conditional_comments: false,
			special: 'script,noscript',

			comment: function(text) {
				writer.comment(text);
			},

			cdata: function(text) {
				writer.cdata(text);
			},

			text: function(text, raw) {
				writer.text(text, raw);
			},

			start: function(name, attrs, empty) {
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
			},

			end: function(name) {
				if (blocked) {
					return;
				}

				writer.end(name);
			}
		}, new tinymce.html.Schema({})).parse(html);

		return writer.getContent();
	}