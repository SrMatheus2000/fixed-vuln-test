function unique_name_337(el) {
		this.element.hide();
		this.id = jQuery(el).attr('id');
		try {
			// ensure the id is valid for jQuery
			jQuery(`#${this.id}`);
		} catch (ex) {
			console.error(`jQuery failed to find mergely: #${this.id}`);
			return;
		}
		this.changed_timeout = null;
		this.chfns = {};
		this.chfns[this.id + '-lhs'] = [];
		this.chfns[this.id + '-rhs'] = [];
		this.prev_query = [];
		this.cursor = [];
		this._skipscroll = {};
		this.change_exp = new RegExp(/(\d+(?:,\d+)?)([acd])(\d+(?:,\d+)?)/);
		var merge_lhs_button;
		var merge_rhs_button;
		if (jQuery.button != undefined) {
			//jquery ui
			merge_lhs_button = '<button title="Merge left"></button>';
			merge_rhs_button = '<button title="Merge right"></button>';
		}
		else {
			// homebrew
			var style = 'opacity:0.4;width:10px;height:15px;background-color:#888;cursor:pointer;text-align:center;color:#eee;border:1px solid #222;margin-right:5px;margin-top: -2px;';
			merge_lhs_button = '<div style="' + style + '" title="Merge left">&lt;</div>';
			merge_rhs_button = '<div style="' + style + '" title="Merge right">&gt;</div>';
		}
		this.merge_rhs_button = jQuery(merge_rhs_button);
		this.merge_lhs_button = jQuery(merge_lhs_button);

		// create the textarea and canvas elements
		var height = '10px';
		var width = '10px';

		var splash = jQuery('<div id="mergely-splash">');
		var canvasLhs = jQuery(`<div class="mergely-margin" style="height: '${height}'"><canvas id="lhs-margin" width="8px" height="'${height}'"></canvas></div>`);
		canvasLhs.find('#lhs-margin').attr('id', `${this.id}-lhs-margin`);
		var editorLhs = jQuery(`<div style="position:relative;width:'${width}'; height:'${height}'" id="editor-lhs" class="mergely-column"><textarea id="text-lhs"></textarea></div>`);
		editorLhs.eq(0).attr('id', `${this.id}-editor-lhs`);
		editorLhs.find('#text-lhs').attr('id', `${this.id}-lhs`);
		var canvasMid = jQuery(`<div class="mergely-canvas" style="height: '${height}'"><canvas id="lhs-rhs-canvas" style="width:28px" width="28px" height="'${height}'"></canvas></div>`);
		canvasMid.find('#mergely-canvas').attr('id', `${this.id}-mergely-canvas`);
		canvasMid.find('#lhs-rhs-canvas').attr('id', `${this.id}-lhs-${this.id}-rhs-canvas`);

		this.element.append(splash);
		this.element.append(canvasLhs);
		this.element.append(editorLhs);
		this.element.append(canvasMid);
		var canvasRhs = jQuery(`<div class="mergely-margin" style="height: '${height}'"><canvas id="rhs-margin" width="8px" height="'${height}'"></canvas></div>`);
		canvasRhs.find('#rhs-margin').attr('id', `${this.id}-rhs-margin`);
		if (this.settings.rhs_margin == 'left') {
			this.element.append(canvasRhs);
		}
		var editorRhs = jQuery(`<div style="width:'${width}'; height:'${height}'" id="editor-rhs" class="mergely-column"><textarea id="text-rhs"></textarea></div>`);
		editorRhs.eq(0).attr('id', `${this.id}-editor-rhs`);
		editorRhs.find('#text-rhs').attr('id', `${this.id}-rhs`);
		this.element.append(editorRhs);
		if (this.settings.rhs_margin != 'left') {
			this.element.append(canvasRhs);
		}
		if (!this.settings.sidebar) {
			this.element.find('.mergely-margin').css({display: 'none'});
		}
		if (['lgpl-separate-notice', 'gpl-separate-notice', 'mpl-separate-notice', 'commercial'].indexOf(this.settings.license) < 0) {
			const _lic = {
				'lgpl': 'GNU LGPL v3.0',
				'gpl': 'GNU GPL v3.0',
				'mpl': 'MPL 1.1'
			};
			var lic = _lic[this.settings.license];
			if (!lic) {
				lic = _lic['lgpl'];
			}

			const parenth = this.element.parent().height();
			const parentw = this.element.parent().width();
			const icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABuCAIAAABJObGsAAAAFXRFWHRDcmVhdGlvbiBUaW1lAAfbCw8UOxvjZ6kDAAAAB3RJTUUH2wsPFQESa9FGmQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAFDBJREFUeNrtXQtQVFeavk2DvF/yZlUetg+EJIqPIvgIEo1xIxArcWqiMZWqsVK1Mbprand0NVuVrY1WnN2NW8ZNzWasqawmupPAqMRdFDdG81BGGYIjLKiooA4QQUF5N4/ezz7w9+He233PbRoaCX9R1Onbp/9z/u/8/3/+87wGi8UijZMryMPdFRg75OnuCtglmEtLS8tDK+FjkJUCAwMNBoO7q6ZOowLKurq68vLySitVVFRcu3atubm5tbVV6XyAY0BAQEhIyLRp05KSkmZaKTk5OSYmxt1CSAY3+sqSkpJjx47l5+eXlpYOkdXs2bOzs7NzcnJSU1PdJc4jOxpJMpvNhYWFGzdunDx58nCIA7ZgjiJQ0AiLNkJaCa93/Phx6GBBQQHzfQ7I09MTbtF7gCZMmICHgKZrgMChp6fHMRNwWLlyJfR01apV8LAjIOOwQwnJP/roo507d967d89enrCwMJPJFB4eHmYloOC4b0GdgeY9KzU2NlZVVTlmvmPHjjfffBOt8rhC2dfXd+jQoXfeeaempkalYIMhNjaW9RsRERFDLKuhoYH1WrW1taoSxcXFvffee2vXrvXwGK74b7igPHHixLZt2y5duiR7bjQa4+PjGYLDYXfwJAzT6urq3t5e2bdPPfXU+++///zzzw+HyK6Hsri4eOvWradPn5Y9R7ySnp6OIMbHx2c4JJFRZ2cngqpz584h0pJ9lZmZuXv37nnz5rm2RFdCCePasmXLF198IeMZGhqK2qekpIx8dI2alJWVoV2bmpoGiW0wrFmzZs+ePXAyrirLZVBeuHBh9erVQJN/6Ofnt2TJkvnz58OuRwQ6dYKlX7x48Ztvvmlvb+efA8cjR44sWLDAJaW4BsrPPvtsw4YNsCl64uXllZaWtnDhwpExZxFC9b7//vuioqLu7m56iOrt379/3bp1Q+c/VCjRTSPUgC+nJ+giMfbIyMhATOM+3OwSoqgzZ85gfIWa00M49127dg2xcx8SlOgu0Z5ffvklPfH19X355ZenTp3qbsQ06Pr167m5uR0dHfQkKysLtjWUoMJ5KG/cuIFhb3l5OT1BjP3KK68gJHY3UEKEqP7w4cOI8OlJcnJyfn5+YmKicwydhPLrr79GD8iPMRDlvPTSS6PHM4oQvGdeXh5iJnoCPUAEsnTpUie4OQMlcFyxYgXvvBEwLl++fNTOJDogiH/q1CmEn/QEHebJkyedQFM3lLBrRA+kj56envAyGEW4G5MhEUZl8Pg0RQLdRGyn19L1QYl+5umnnyb/6O/vD+c4adIkd0PhArpz5w5cZ1tbG/sIv3n+/HldvZCO7h/RA/prwhH6OGZwBEEQiAOh2EeICWH5gEmTdEC5fft2Pu6BXY8ZHBlBHAhFHyEsQmbxn4saOGKuV199lT6in3nuuefcLfuwUGFhId8Lffrpp4JjISEo4YOfeeYZGhci7lm7du3j2F+LEAA5dOgQRUgI786ePSsyTtc28Nra2tWrVxOOiMMRP45VHCXrpBEEhJjsIwRXTtOokjaUW7ZsIUYYF8I3P15xuBMEASEmhGUf2eSh5q80DLy4uBi6zfJgtA+vMfrH164ijNPRQ7BOHKoKL+d4tlhDK7du3UpYz549+6eDIwjCQmSWBgiAwnF+R7szTpw4QesKGE5lZGQ4yEyIswT+91lJss68Go1GDysZBkjiluCRDcNQs9mM8QZ8Ew1JUainldgSLhL8z5UVYAQmKBHcwAppe9xQGdTKHjdGEPny5cuMA6AAIA7WhewaOMRLTU2lda7Fixc/++yzDgRgqOE/E4OBgsEDSYKhEQYPfn5+EInNDDIE29vbMYhqamq6fft2XV1dfX09zz84ODg2NjYqKiomJgZpMIEjk0HAKoByGTcMau/fv3/r1i34uAcPHvDcUDSCx7i4uHArgRswxUMHgH711VfffvstS2N8XFJSYm9a0y6UiKfWr1/P0pB/8+bNst6GwcdUAAIwbQJ2wOXu3btKUFDjlJSUmTNnYoQLvcCv8BNIi7CjoqJCEqDo6GgIk5CQEBQUBG60yMFYATU0xtWrV2/evCnCDQ0zZ84ck8mEBGseVYzAee/evbSScfDgQT6+1oayq6trxowZtH4NrU5LS+MzMO0jAaACVVVV/FyRA4IAkZGRKKKyslIGtyCgixYtwn80MOSHBaD9AF9RUZFMB0UITZKZmYlIGRZD5iIjcIZpszQ0+sqVK6q7E9Sh3LNnz9tvv83SoaGhb731Fr/OxQwT2geFggfRRNDoE+A7JcXoG/Dg0v86yDYhbFLQk896R0xBAn995g5zw62uxludtVcflJ6y9A4qBe2BbgHCw5bhhZRN4m+a5zt5lk+0ySfG5BkY1tPW3Nt6v7P2WtuNkraq4t7OVhm3uXPnRkREqKIJpdm3bx+tWX7wwQeqsZEKlMAIRkTTaIhXn3jiCfqW+XW0f1lZ2ZkzZ+y2dnBk8FPLg2cvD5y12DsyAdEEfvmnzckdd+S2bPQPCVv08/DFryCnZMdhdT+423j6k7unftNZV+W42YBa+NLXIp97w/cvZtrLg0ZqKjry48lft/zft/QwKSlp4cKF9tBE55OXl8fScFAwAuWkkQqUhw8fxriQpeHs33jjDd4lQyVh1zdu3MjNze3Hwi/YL/5J/4TZPrHTvUJj8DdhYqx3RJwSlys7s5qLj3OFe0Qu+8XkV3d5BoVLImTpqzv6L7cP/YOlx6wCYsDEya/tDs9Y7+Elujfo/rncmt9uMd+7Q2hifAykWKgwqGSL5eOPP6bdCRhZIoaXV0BZwLFjxyidnp6uZAofTFNt0/7ui4npLwtWHRBTGloz9W8O+JvmC/6WQR+z+pcBM9Ov/NNf9na08N+ELshJ+Ktfe4VE6+AmSah5YNLCyn9c0V5zGR/R+yFUQCwJjZMt3AMEQEGKCYiUUMo1GY6voKCApcEO/liGI7QSHoD1uWh/cRwlqzdkicjlG1L+9Y/6cBygwKRFM3YcB6z9lfQJMG35bPrfH9WLIyPYUNJ7Z30nJbGPcFnwifBgSmMFFIQvIFL2EHIowYv2P8bHxyuH24ASnWZ/ururt11jsyRP6FLgGU1/+7uEN3/j4e3nhOT9aCYvic7660e19/KZvj0/bMlap1lJjzxDaOKm31LbIJzq6OhQQgkoAAhLs8V0DSh560YMqFo23yDdTXWSMAXOWvLk3vKwhT8biuSMYlf/Eo0xbdvvg55wZnVQRgHT0yKWvsbSxcXFra2t6LWVaPKA8ECpQ5mfn88S8A72oOTJ3KwjMPSOSuDd5VAI5pzyqwshqStdwg0UtqR/fheK0tzcrLoUAUCo5yCgiAZBiVER4m2WxnBNZJGou0l3jO0q8p2S7EJuQSkZcD4s3djYyLayy/IAENr5BqAAF//tIChFrFuyjhAo3a1HK0czGYyePtH9816ImpXbXJWwyGx8EJS80tqDEuEr22fPyI1a6XJCb84SMHDVTlwGi8zGbVAi/qTzMwhTHewPH5NaKVm7cpbgt2XJCLDQpijAxW8ptkHJb6QymUyqjOB0oZUYDBCaY0krLb39uzMApYPDLDw4PGi20U5lZSWlaZHIHvn5+bFpmJ7W+87V29x4u/6/97ZWnu9qqEGEHDLvhegXNkvOrr71tjXX5X/QUv5NZ32Vd/TU4CeXYVwkPoIcgFJoZosHB6AtW7bMEZSON/ZBK319fRmUfeYOSSehxrcObP3xf/6dhtIYBT+4dOph+dnpW3/vBI73z+dVf7yxu/nHAW5/BqZ4mPyrIsTwOirWIwQlDw4Pms3A+flXzT2StBqnF8q+rvaru3Lq8/copySaio4AUL04Nv3h6LV//hnhSNRefak2731drMjAxaHkQbNBSYvo7FycPUZwl8hAA0q9UN7+dHtzSYG9b++e/A9d3DrrrlXtWSdZ1Hf23Pvuv3RCKaSVAIe2FvF7M21QIgKgrJo7BjgoOyVxsljuffc7/kF0dDQfDyhnMx1T4+n/hJrTRy8r0ceuuqq+7i4noITNEVhKAjikagSaRL4SMRQGniyt6yygLq3s6+nig6eMjIyYmJi2tjYK0MwNt3RB2cTNfiYlJSUnJ2OUQtM2lr7e7vt/9o4S3SYp6Ct5iNihdaZ5/VrZ0tJCEakmlEaj0UmtlGzKHhwcjKgiKioqMjIyISGBPeztbNWlR3z8ABwnTZqEgV1KSgo95HVWG0oxX8lDZLFepcDS/VDyB4v1nVC19Am6GMlqGpROTExEe8CU2K0DtkzC8kicTcBRIEbBMAw80UjKDGJQ2gxcEEoeOhUo+XGhCC/JqYMBkJn8ET8rCqt0AsrQ0FBwM1qJr1uvPq0U1QkeIjmUQyLxuJrLCYHZ0rNMeEufDq0k78YaRoWbvm5HR9FK6oeSj35oklyYxIco2jl1aSUZhL3NdRaLjh3QfLejXCnjiYeIoFOBsqtLR0u6nvSphpZv0eN8yMA1dz3yEMmh5O/v0Q2lUwbO0yCTFI5IZEipH+7Vo5XighBEAI0myD3oEXpSWT7hCojWgM9pr5Q+Yd8v2bHfQd2mHq00ePR3g/wRYlWiygM0EsrW7VBEgi5J57koV26mVt0uYD+3Ret7PVAaPUV+yy5BYWk+jLNBSUvePT09mvfXDK6CS7udoXWjkqzbdBZKB/OV/NU8/D4BG5QYeFHawV0zQyIB0A0GPfGZVmaZorkkMw8OD5qtKvyqxXBBKSKPl/YAwVZ7z/7JC3g31YUtg6eXODdpwFc6WJCQgcODpg4lf0palWydht55b06P1IU36hBeM7PBU0fDCGolD446lMnJtmXlqqoqEaaSXnu0093zvbk+KBVKJ2senQ0jBCUPDg+aDYiYmBg6EAAdbmhoECtf59BTS4t1GbhM6diWCr5hPFytlYCFDBxw8Zc9DgIiOzub0vyqxVCgUeQfVKJyP4mHUwbODkOoZNDjKw2cr7TXg/Ow8HBJMihzcnJUf+OoeFcYuCo6Qty0kHK5gfOw8HBJMihTU1PpWsna2lqa1HSMjXhdrfm1wpchGLgTGQZl1oISgNAZRQAlu3ZULhgpLWJ6IcXUezePa7VSuwfXEwxpQQlAaAgks25JCaWgjdMEhEHvqHEASjZfqYBG393DHmpI8ZMj+rqdAV9pb5nMgXWrQMnfWlVdXa06sB80vapTK8m3Mg7sLAKVqMseJU4rMRamqV9+OsM5X6m6IAEoAAhLo8LKY4pyILy8vFau7N//iRiNX+cdwMKA6tq2XjobDLGt80x4f3//AWb6bsEj6CEb03Gem6RnjYGHMjo6Wjn1CygoaAVE/CqxOpTSYNU9d+6ccoIE8kMLGK/e9ofiq3q9bc3sZAN+Cw688GxtC9/S0Q8RoswTJ06kE6nQKVrCbL12QZwbrcJHRETIFrgAAn8LhNK6JdXDJqtWrQoLC2OBaF1dXVlZGX8Eim1mCwgImDdv3vnz5yVL35WdqwKTFhv9gjy8/Yze/vjv4ePv4eVt6enu6zFburssPWbrAYAHzT+cYFM1+C04sJbHf6TnzJnDNspf2ZkVuiBHZA607WZp191qyTqngAqzU5+oGxoGFWYnHa//2/qoFzZ5h0/xDAp/tBvL6AmHCN239PVarHV7VENr9Voqvmu7/kfJqpKRkZGMG5UFEGj/H8oCREJQwvR27NhBB/NOnz49a9YsvotAGWj56dOno7r19fUPL3+NP/HGR13xW3Cg865Im0ymmpoaMGy/WYo/cW5QZ4w62HlHxtDHxyc2NhZt88MPP0DNa3N3iXMDLVq0CDwZN/YEds1fEgtwVLeWG999913lU0RMBw8eZHvV4G5RUdk9OKzGAMVsNmvOffAE01u8eHFUVBS6HXY8XLJ6DGhBeHg4EroOkILb0qVLARwagz9sDvMEHLBKXdzwkxUrVsTFxVHDsOcXLlyAVrI0vj1w4IBq/64OJbJCsCNHjrCPiEvnzp1Lv2fVZXs0MAiFJBADuDu44AhIzZgxA0ygQWgAklwaGP8wbnBS8fHxrHOnjTeqMicmJqanp8OQ8RNITtwY4SO4ocGmTJkCbhgIOl5lQZXgc9LS0hB4gxvf50CTPv/8czpfs2/fPnsvBHD+aL3sQDs7Dw4llR2zAojs+Dpkg1TKg/FKbsoLBmQM2VY6hr69mwbYMWviBjSVdWPc4FvBkB2zZxEVz80FR+sl64UPFBihyE2bNik3CypvKVDyYWXLbntQJeJmjxXPUJybg7oxblQ3afAswcOHDz/88ENqgIKCAmcufGAETSSPCyVVjpbGNuXn59PhnMzMTGiog8waAfbu3buplUpLS69fv+5u6UaOICwdGQEIgMJxfg0o4YzXrFnD0jCQ3NxcNy77jCRBTAhLPgEgaF5Jr30nG7rv+fPn0+QSevYNGzaM7Quw0E3t37+fgjyEKBcvXtS8jF57BM3uYSfsUEBeXt7IvFrGLQTRICDhCMEhvsil/kKTEQsWLEAr0UcM7E+d0n2U4XEhiMZP4kBwwev8Red11q1bx9+khbG98q0lY4AgFD9tsW3bNvGL/HXc9Qsf/OKLL9LFqohmX3/99bF0seqdO3c++eQTWiDLyso6evSo+BX+49cm99PQr00ev8z7EbnhMm9G41fMq9L4iw/c+uIDRuOv45DR+Eti+smdL4lhNP7qIqLxF2qNmhdqEY2/5m385YOj7+WDROOvxHQxjb+o1ZU0/vpgF9P4S61dTD+FV63bFotHhoBIYWHhxo0baae2awlswRxFsFsTR5JGSCtVqaSkBHqKYS+tkTpNGF9lZ2dDB+3tQhkBcieURIhXysvLWb9RUVGBIKa5uZndOyOvrvWwdUhICIKqpKQk1mslJyfz52fcRaMCSlWyWO+deWglyer7QPwVAKONRi+Ujx0NV5D1E6T/BwkHUltwIapAAAAAAElFTkSuQmCC';
			this.element.find('#mergely-splash').css({
				position: 'absolute',
				zIndex: '100',
				backgroundColor: '#fff',
				border: '1px solid black',
				height: '70px',
				width: '300px',
				left: (parentw - 300) / 2,
				padding: '10px 10px 0 10px',
				fontFamily: 'arial',
				fontSize: '11px'
			}).append('<p><img width="36" height="36" alt="mergely" src="' + icon + '" style="float:left;padding-right:10px;" />This software is a Combined Work using Mergely and is covered by the ' + lic + ' license.  For the full license, see <a target="_blank" href="http://www.mergely.com">http://www.mergely.com/license.</a></p>');
			jQuery('body').one('click', function () {
				jQuery('#mergely-splash').fadeOut(100, 'linear', function () {
					this.remove();
				});
			});
		}

		// check initialization
		var rhstx;
		try {
			rhstx = this.element.find(`#${this.id}-rhs`).get(0);
		} catch (ex) {
		}
		if (!rhstx) {
			console.error('rhs textarea not defined - Mergely not initialized properly');
			return;
		}
		var lhstx;
		try {
			lhstx = this.element.find(`#${this.id}-lhs`).get(0);
		} catch (ex) {
		}
		if (!lhstx) {
			console.error('lhs textarea not defined - Mergely not initialized properly');
			return;
		}

		// get current diff border color
		var color = jQuery('<div style="display:none" class="mergely current start" />').appendTo('body').css('border-top-color');
		this.current_diff_color = color;

		// codemirror
		var cmstyle = `#${this.id} .CodeMirror-gutter-text { padding: 5px 0 0 0; }
			'#${this.id} .CodeMirror-lines pre, #${this.id} .CodeMirror-gutter-text pre { line-height: 18px; }
			'.CodeMirror-linewidget { overflow: hidden; };`;
		if (this.settings.autoresize) {
			cmstyle += `${this.id} .CodeMirror-scroll { height: 100%; overflow: auto; }`;
		}
		// adjust the margin line height
		cmstyle += '\n.CodeMirror { line-height: 18px; }';
		jQuery(`<style type="text/css">${cmstyle}</style>`).appendTo('head');

		// bind
		var self = this;
		this.editor = [];
		this.editor[this.id + '-lhs'] = CodeMirror.fromTextArea(lhstx, this.lhs_cmsettings);
		this.editor[this.id + '-rhs'] = CodeMirror.fromTextArea(rhstx, this.rhs_cmsettings);
		this.editor[this.id + '-lhs'].on('change', function(){ if (self.settings.autoupdate) self._changing(self.id + '-lhs', self.id + '-rhs'); });
		this.editor[this.id + '-lhs'].on('scroll', function(){ self._scrolling(self.id + '-lhs'); });
		this.editor[this.id + '-rhs'].on('change', function(){ if (self.settings.autoupdate) self._changing(self.id + '-lhs', self.id + '-rhs'); });
		this.editor[this.id + '-rhs'].on('scroll', function(){ self._scrolling(self.id + '-rhs'); });
		// resize
		if (this.settings.autoresize) {
			var sz_timeout1 = null;
			var sz = function(init) {
				if (self.settings.resize) self.settings.resize(init);
				self.editor[self.id + '-lhs'].refresh();
				self.editor[self.id + '-rhs'].refresh();
				if (self.settings.autoupdate) {
					self._changing(self.id + '-lhs', self.id + '-rhs');
				}
			};
			jQuery(window).on('resize.mergely',
				function () {
					if (sz_timeout1) clearTimeout(sz_timeout1);
					sz_timeout1 = setTimeout(sz, self.settings.resize_timeout);
				}
			);
			sz(true);
		}

		// scrollToDiff() from gutter
		function gutterClicked(side, line, ev) {
			// The "Merge left/right" buttons are also located in the gutter.
			// Don't interfere with them:
			if (ev.target && (jQuery(ev.target).closest('.merge-button').length > 0)) {
				return;
			}

			// See if the user clicked the line number of a difference:
			var i, change;
			for (i = 0; i < this.changes.length; i++) {
				change = this.changes[i];
				if (line >= change[side+'-line-from'] && line <= change[side+'-line-to']) {
					this._current_diff = i;
					// I really don't like this here - something about gutterClick does not
					// like mutating editor here.  Need to trigger the scroll to diff from
					// a timeout.
					setTimeout(function() { this.scrollToDiff(); }.bind(this), 10);
					break;
				}
			}
		}

		this.editor[this.id + '-lhs'].on('gutterClick', function(cm, n, gutterClass, ev) {
			gutterClicked.call(this, 'lhs', n, ev);
		}.bind(this));

		this.editor[this.id + '-rhs'].on('gutterClick', function(cm, n, gutterClass, ev) {
			gutterClicked.call(this, 'rhs', n, ev);
		}.bind(this));

		//bind
		var setv;
		if (this.settings.lhs) {
			setv = this.editor[this.id + '-lhs'].getDoc().setValue;
			this.settings.lhs(setv.bind(this.editor[this.id + '-lhs'].getDoc()));
		}
		if (this.settings.rhs) {
			setv = this.editor[this.id + '-rhs'].getDoc().setValue;
			this.settings.rhs(setv.bind(this.editor[this.id + '-rhs'].getDoc()));
		}
	}