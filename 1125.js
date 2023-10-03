function drawChart() {
    currentSettings.width = $('#resizer').width() - 20;
    currentSettings.height = $('#resizer').height() - 20;

    // TODO: a better way using .redraw() ?
    if (currentChart !== null) {
        currentChart.destroy();
    }

    var columnNames = [];
    $('select[name="chartXAxis"] option').each(function () {
        columnNames.push(escapeHtml($(this).text()));
    });
    try {
        currentChart = PMA_queryChart(chart_data, columnNames, currentSettings);
        if (currentChart != null) {
            $('#saveChart').attr('href', currentChart.toImageString());
        }
    } catch (err) {
        PMA_ajaxShowMessage(err.message, false);
    }
}