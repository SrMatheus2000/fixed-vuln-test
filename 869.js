function unique_name_486(pdf, element, x, y, settings, callback) {
    if (!element) return false;
    if (!element.parentNode) element = '' + element.innerHTML;
    if (typeof element === "string") {
      element = (function(element) {
        var $frame, $hiddendiv, framename, visuallyhidden;
        framename = "jsPDFhtmlText" + Date.now().toString() + (Math.random() * 1000).toFixed(0);
        visuallyhidden = "position: absolute !important;" + "clip: rect(1px 1px 1px 1px); /* IE6, IE7 */" + "clip: rect(1px, 1px, 1px, 1px);" + "padding:0 !important;" + "border:0 !important;" + "height: 1px !important;" + "width: 1px !important; " + "top:auto;" + "left:-100px;" + "overflow: hidden;";
        $hiddendiv = $("<div style=\"" + visuallyhidden + "\">" + "<iframe style=\"height:1px;width:1px\" name=\"" + framename + "\" />" + "</div>").appendTo(document.body);
        $frame = window.frames[framename];
        return $($frame.document.body).html(element)[0];
      })(element.replace(/<\/?script[^>]*?>/gi,''));
    }
    var r = new Renderer(pdf, x, y, settings);
    loadImgs.call(this, element, r, settings.elementHandlers, callback);
    return r.dispose();
  }