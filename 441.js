function unique_name_229()
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
	}