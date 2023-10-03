function buildLogTable(data) {
        var rows = data.rows;
        var cols = [];
        var $table = $('<table class="sortable"></table>');
        var $tBody, $tRow, $tCell;

        $('#logTable').html($table);

        var formatValue = function (name, value) {
            if (name == 'user_host') {
                return value.replace(/(\[.*?\])+/g, '');
            }
            return escapeHtml(value);
        };

        for (var i = 0, l = rows.length; i < l; i++) {
            if (i === 0) {
                $.each(rows[0], function (key, value) {
                    cols.push(key);
                });
                $table.append('<thead>' +
                              '<tr><th class="nowrap">' + cols.join('</th><th class="nowrap">') + '</th></tr>' +
                              '</thead>'
                );

                $table.append($tBody = $('<tbody></tbody>'));
            }

            $tBody.append($tRow = $('<tr class="noclick"></tr>'));
            var cl = '';
            for (var j = 0, ll = cols.length; j < ll; j++) {
                // Assuming the query column is the second last
                if (j == cols.length - 2 && rows[i][cols[j]].match(/^SELECT/i)) {
                    $tRow.append($tCell = $('<td class="linkElem">' + formatValue(cols[j], rows[i][cols[j]]) + '</td>'));
                    $tCell.click(openQueryAnalyzer);
                } else {
                    $tRow.append('<td>' + formatValue(cols[j], rows[i][cols[j]]) + '</td>');
                }

                $tRow.data('query', rows[i]);
            }
        }

        $table.append('<tfoot>' +
                    '<tr><th colspan="' + (cols.length - 1) + '">' + PMA_messages.strSumRows +
                    ' ' + data.numRows + '<span style="float:right">' + PMA_messages.strTotal +
                    '</span></th><th class="right">' + data.sum.TOTAL + '</th></tr></tfoot>');

        // Append a tooltip to the count column, if there exist one
        if ($('#logTable th:last').html() == '#') {
            $('#logTable th:last').append('&nbsp;' + PMA_getImage('b_docs.png', '', {'class': 'qroupedQueryInfoIcon'}));

            var tooltipContent = PMA_messages.strCountColumnExplanation;
            if (groupInserts) {
                tooltipContent += '<p>' + PMA_messages.strMoreCountColumnExplanation + '</p>';
            }

            PMA_tooltip(
                $('img.qroupedQueryInfoIcon'),
                'img',
                tooltipContent
            );
        }

        $('#logTable table').tablesorter({
            sortList: [[cols.length - 1, 1]],
            widgets: ['fast-zebra']
        });

        $('#logTable table thead th')
            .append('<img class="icon sortableIcon" src="themes/dot.gif" alt="">');

        return cols;
    }