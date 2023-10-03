function unique_name_93 () {
				new Prism.plugins.Previewer('easing', function (value) {

					value = {
						'linear': '0,0,1,1',
						'ease': '.25,.1,.25,1',
						'ease-in': '.42,0,1,1',
						'ease-out': '0,0,.58,1',
						'ease-in-out':'.42,0,.58,1'
					}[value] || value;

					var p = value.match(/-?\d*\.?\d+/g);

					if(p.length === 4) {
						p = p.map(function(p, i) { return (i % 2? 1 - p : p) * 100; });

						this.querySelector('path').setAttribute('d', 'M0,100 C' + p[0] + ',' + p[1] + ', ' + p[2] + ',' + p[3] + ', 100,0');

						var lines = this.querySelectorAll('line');
						lines[0].setAttribute('x2', p[0]);
						lines[0].setAttribute('y2', p[1]);
						lines[1].setAttribute('x2', p[2]);
						lines[1].setAttribute('y2', p[3]);

						return true;
					}

					return false;
				}, '*', function () {
					this._elt.innerHTML = '<svg viewBox="-20 -20 140 140" width="100" height="100">' +
						'<defs>' +
						'<marker id="prism-previewer-easing-marker" viewBox="0 0 4 4" refX="2" refY="2" markerUnits="strokeWidth">' +
						'<circle cx="2" cy="2" r="1.5" />' +
						'</marker>' +
						'</defs>' +
						'<path d="M0,100 C20,50, 40,30, 100,0" />' +
						'<line x1="0" y1="100" x2="20" y2="50" marker-start="url(#prism-previewer-easing-marker)" marker-end="url(#prism-previewer-easing-marker)" />' +
						'<line x1="100" y1="0" x2="40" y2="30" marker-start="url(#prism-previewer-easing-marker)" marker-end="url(#prism-previewer-easing-marker)" />' +
						'</svg>';
				});
			}