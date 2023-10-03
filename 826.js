function displayCaptions() {

		if (this.tracks === undefined) {
			return;
		}

		var t = this,
		    track = t.selectedTrack,
		    i = void 0,
		    sanitize = function sanitize(html) {

			var div = document.createElement('div');

			div.innerHTML = html;

			// Remove all `<script>` tags first
			var scripts = div.getElementsByTagName('script');
			var i = scripts.length;
			while (i--) {
				scripts[i].parentNode.removeChild(scripts[i]);
			}

			// Loop the elements and remove anything that contains value="javascript:" or an `on*` attribute
			// (`onerror`, `onclick`, etc.)
			var allElements = div.getElementsByTagName('*');
			for (var _i = 0, n = allElements.length; _i < n; _i++) {
				var attributesObj = allElements[_i].attributes,
				    attributes = Array.prototype.slice.call(attributesObj);

				for (var j = 0, total = attributes.length; j < total; j++) {
					if (attributes[j].name.startsWith('on') || attributes[j].value.startsWith('javascript')) {
						allElements[_i].parentNode.removeChild(allElements[_i]);
					} else if (attributes[j].name === 'style') {
						allElements[_i].removeAttribute(attributes[j].name);
					}
				}
			}
			return div.innerHTML;
		};

		if (track !== null && track.isLoaded) {
			i = t.searchTrackPosition(track.entries, t.media.currentTime);
			if (i > -1) {
				// Set the line before the timecode as a class so the cue can be targeted if needed
				t.captionsText.html(sanitize(track.entries[i].text)).attr('class', t.options.classPrefix + 'captions-text ' + (track.entries[i].identifier || ''));
				t.captions.show().height(0);
				return; // exit out if one is visible;
			}

			t.captions.hide();
		} else {
			t.captions.hide();
		}
	}