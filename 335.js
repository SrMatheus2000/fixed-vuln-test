function unique_name_172 (caller) {
			var editor = this;

			defaultCmds.link._dropDown(editor, caller, function (url, text) {
				// needed for IE to restore the last range
				editor.focus();

				// If there is no selected text then must set the URL as
				// the text. Most browsers do this automatically, sadly
				// IE doesn't.
				if (text || !editor.getRangeHelper().selectedHtml()) {
					text = text || url;

					editor.wysiwygEditorInsertHtml(
						'<a href="' + escape.entities(url) + '">' +
							escape.entities(text) +
						'</a>'
					);
				} else {
					editor.execCommand('createlink', url);
				}
			});
		}