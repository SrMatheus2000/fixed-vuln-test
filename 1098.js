function unique_name_654(options) {
    return this.each(function() {
        $(this)
            .autocomplete({
                formatItem: function(data) {
                    var s = data[options.nameKey],
                        desc;

                    if (options.descKey) {
                        desc = $('<div/>').text(data[options.descKey]).html();
                        s += " <span>(" + desc + ")</span>";
                    }

                    return s;
                },
                matchCase: false,
                multiple: true,
                parse: function(data) {
                    var jsonData = eval("(" + data + ")");
                    var items = jsonData[options.fieldName];
                    var parsed = [];

                    for (var i = 0; i < items.length; i++) {
                        var value = items[i];

                        parsed.push({
                            data: value,
                            value: value[options.nameKey],
                            result: value[options.nameKey]
                        });
                    }

                    return parsed;
                },
                url: SITE_ROOT + gReviewRequestSitePrefix + "api/" + options.fieldName + "/",
                extraParams: options.extraParams
            })
            .bind("autocompleteshow", function() {
                /*
                 * Add the footer to the bottom of the results pane the
                 * first time it's created.
                 *
                 * Note that we may have multiple .ui-autocomplete-results
                 * elements, and we don't necessarily know which is tied to
                 * this. So, we'll look for all instances that don't contain
                 * a footer.
                 */
                var resultsPane = $(".ui-autocomplete-results:not(" +
                                    ":has(.ui-autocomplete-footer))");

                if (resultsPane.length > 0) {
                    $("<div/>")
                        .addClass("ui-autocomplete-footer")
                        .text("Press Tab to auto-complete.")
                        .appendTo(resultsPane);
                }
            });
    });
}