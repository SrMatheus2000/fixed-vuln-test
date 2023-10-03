function unique_name_230(editorUi, color, apply, cancelFn)
{
	this.editorUi = editorUi;
	
	var input = document.createElement('input');
	input.style.marginBottom = '10px';
	input.style.width = '216px';
	
	// Required for picker to render in IE
	if (mxClient.IS_IE)
	{
		input.style.marginTop = '10px';
		document.body.appendChild(input);
	}
	
	this.init = function()
	{
		if (!mxClient.IS_TOUCH)
		{
			input.focus();
		}
	};

	var picker = new jscolor.color(input);
	picker.pickerOnfocus = false;
	picker.showPicker();

	var div = document.createElement('div');
	jscolor.picker.box.style.position = 'relative';
	jscolor.picker.box.style.width = '230px';
	jscolor.picker.box.style.height = '100px';
	jscolor.picker.box.style.paddingBottom = '10px';
	div.appendChild(jscolor.picker.box);

	var center = document.createElement('center');
	
	function createRecentColorTable()
	{
		var table = addPresets((ColorDialog.recentColors.length == 0) ? ['FFFFFF'] :
					ColorDialog.recentColors, 11, 'FFFFFF', true);
		table.style.marginBottom = '8px';
		
		return table;
	};
	
	function addPresets(presets, rowLength, defaultColor, addResetOption)
	{
		rowLength = (rowLength != null) ? rowLength : 12;
		var table = document.createElement('table');
		table.style.borderCollapse = 'collapse';
		table.setAttribute('cellspacing', '0');
		table.style.marginBottom = '20px';
		table.style.cellSpacing = '0px';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var rows = presets.length / rowLength;
		
		for (var row = 0; row < rows; row++)
		{
			var tr = document.createElement('tr');
			
			for (var i = 0; i < rowLength; i++)
			{
				(function(clr)
				{
					var td = document.createElement('td');
					td.style.border = '1px solid black';
					td.style.padding = '0px';
					td.style.width = '16px';
					td.style.height = '16px';
					
					if (clr == null)
					{
						clr = defaultColor;
					}
					
					if (clr == 'none')
					{
						td.style.background = 'url(\'' + Dialog.prototype.noColorImage + '\')';
					}
					else
					{
						td.style.backgroundColor = '#' + clr;
					}
					
					tr.appendChild(td);

					if (clr != null)
					{
						td.style.cursor = 'pointer';
						
						mxEvent.addListener(td, 'click', function()
						{
							if (clr == 'none')
							{
								picker.fromString('ffffff');
								input.value = 'none';
							}
							else
							{
								picker.fromString(clr);
							}
						});
					}
				})(presets[row * rowLength + i]);
			}
			
			tbody.appendChild(tr);
		}
		
		if (addResetOption)
		{
			var td = document.createElement('td');
			td.setAttribute('title', mxResources.get('reset'));
			td.style.border = '1px solid black';
			td.style.padding = '0px';
			td.style.width = '16px';
			td.style.height = '16px';
			td.style.backgroundImage = 'url(\'' + Dialog.prototype.closeImage + '\')';
			td.style.backgroundPosition = 'center center';
			td.style.backgroundRepeat = 'no-repeat';
			td.style.cursor = 'pointer';
			
			tr.appendChild(td);

			mxEvent.addListener(td, 'click', function()
			{
				ColorDialog.resetRecentColors();
				table.parentNode.replaceChild(createRecentColorTable(), table);
			});
		}
		
		center.appendChild(table);
		
		return table;
	};

	div.appendChild(input);
	mxUtils.br(div);
	
	// Adds recent colors
	createRecentColorTable();
		
	// Adds presets
	var table = addPresets(this.presetColors);
	table.style.marginBottom = '8px';
	table = addPresets(this.defaultColors);
	table.style.marginBottom = '16px';

	div.appendChild(center);

	var buttons = document.createElement('div');
	buttons.style.textAlign = 'right';
	buttons.style.whiteSpace = 'nowrap';
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';

	if (editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	var applyFunction = (apply != null) ? apply : this.createApplyFunction();
	
	var applyBtn = mxUtils.button(mxResources.get('apply'), function()
	{
		var color = input.value;
		// https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation/8027444
		var colorValid  = /(^#?[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
		
		if (colorValid)
		{
			ColorDialog.addRecentColor(color, 12);
			
			if (color != 'none' && color.charAt(0) != '#')
			{
				color = '#' + color;
			}

			applyFunction(color);			
		}

		editorUi.hideDialog();
	});
	applyBtn.className = 'geBtn gePrimaryBtn';
	buttons.appendChild(applyBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	if (color != null)
	{
		if (color == 'none')
		{
			picker.fromString('ffffff');
			input.value = 'none';
		}
		else
		{
			picker.fromString(color);
		}
	}
	
	div.appendChild(buttons);
	this.picker = picker;
	this.colorInput = input;

	// LATER: Only fires if input if focused, should always
	// fire if this dialog is showing.
	mxEvent.addListener(div, 'keydown', function(e)
	{
		if (e.keyCode == 27)
		{
			editorUi.hideDialog();
			
			if (cancelFn != null)
			{
				cancelFn();
			}
			
			mxEvent.consume(e);
		}
	});
	
	this.container = div;
}