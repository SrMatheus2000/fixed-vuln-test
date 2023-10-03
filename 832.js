function unique_name_459 () {

		if (this.tracks === undefined) {
			return;
		}

		let
			t = this,
			track = t.selectedTrack,
			i,
			sanitize = (html) => {

				const div = document.createElement('div');

				div.innerHTML = html;

				// Remove all `<script>` tags first
				const scripts = div.getElementsByTagName('script');
				let i = scripts.length;
				while (i--) {
					scripts[i].parentNode.removeChild(scripts[i]);
				}

				// Loop the elements and remove anything that contains value="javascript:" or an `on*` attribute
				// (`onerror`, `onclick`, etc.)
				const allElements = div.getElementsByTagName('*');
				for (let i = 0, n = allElements.length; i < n; i++) {
					const
						attributesObj = allElements[i].attributes,
						attributes = Array.prototype.slice.call(attributesObj)
					;

					for (let j = 0, total = attributes.length; j < total; j++) {
						if (attributes[j].name.startsWith('on') || attributes[j].value.startsWith('javascript')) {
							allElements[i].parentNode.removeChild(allElements[i]);
						} else if (attributes[j].name === 'style') {
							allElements[i].removeAttribute(attributes[j].name);
						}
					}

				}
				return div.innerHTML;
			}
		;

		if (track !== null && track.isLoaded) {
			i = t.searchTrackPosition(track.entries, t.media.currentTime);
			if (i > -1) {
				// Set the line before the timecode as a class so the cue can be targeted if needed
				t.captionsText.html(sanitize(track.entries[i].text))
				.attr('class', `${t.options.classPrefix}captions-text ${(track.entries[i].identifier || '')}`);
				t.captions.show().height(0);
				return; // exit out if one is visible;
			}

			t.captions.hide();
		} else {
			t.captions.hide();
		}
	}