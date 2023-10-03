function unique_name_168 (email, text) {
					// needed for IE to reset the last range
					editor.focus();

					if (!editor.getRangeHelper().selectedHtml() || text) {
						editor.wysiwygEditorInsertHtml(
							'<a href="' +
							'mailto:' + escape.entities(email) + '">' +
								escape.entities((text || email)) +
							'</a>'
						);
					} else {
						editor.execCommand('createlink', 'mailto:' + email);
					}
				}