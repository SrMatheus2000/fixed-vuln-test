function unique_name_682() {
	var cortex_data = $(this).data('cortex-json');
	cortex_data = htmlEncode(JSON.stringify(cortex_data, null, 2));
	var popupHtml = '<pre class="simplepre">' + cortex_data + '</pre>';
	popupHtml += '<div class="close-icon useCursorPointer" onClick="closeScreenshot();"></div>';
	$('#screenshot_box').html(popupHtml);
	$('#screenshot_box').show();
	$('#screenshot_box').css({'padding': '5px'});
	left = ($(window).width() / 2) - ($('#screenshot_box').width() / 2);
	if (($('#screenshot_box').height() + 250) > $(window).height()) {
		$('#screenshot_box').height($(window).height() - 250);
		$('#screenshot_box').css("overflow-y", "scroll");
		$('#screenshot_box').css("overflow-x", "hidden");
	}
	$('#screenshot_box').css({'left': left + 'px'});
	$("#gray_out").fadeIn();
}