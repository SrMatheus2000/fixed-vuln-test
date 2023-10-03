function unique_name_167 (url, width, height) {
					var attrs  = '';

					if (width) {
						attrs += ' width="' + parseInt(width) + '"';
					}

					if (height) {
						attrs += ' height="' + parseInt(height) + '"';
					}

					attrs += ' src="' + escape.entities(url) + '"';

					editor.wysiwygEditorInsertHtml(
						'<img' + attrs + ' />'
					);
				}