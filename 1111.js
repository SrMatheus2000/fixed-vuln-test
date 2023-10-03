function loadQueryAnalysis(rowData) {
        var db = rowData.db || '';

        $('#queryAnalyzerDialog div.placeHolder').html(
            PMA_messages.strAnalyzing + ' <img class="ajaxIcon" src="' +
            pmaThemeImage + 'ajax_clock_small.gif" alt="">');

        $.post('server_status_monitor.php?' + PMA_commonParams.get('common_query'), {
            ajax_request: true,
            query_analyzer: true,
            query: codemirror_editor ? codemirror_editor.getValue() : $('#sqlquery').val(),
            database: db
        }, function (data) {
            var i;
            if (typeof data !== 'undefined' && data.success === true) {
                data = data.message;
            }
            if (data.error) {
                if (data.error.indexOf('1146') != -1 || data.error.indexOf('1046') != -1) {
                    data.error = PMA_messages['strServerLogError'];
                }
                $('#queryAnalyzerDialog div.placeHolder').html('<div class="error">' + data.error + '</div>');
                return;
            }
            var totalTime = 0;
            // Float sux, I'll use table :(
            $('#queryAnalyzerDialog div.placeHolder')
                .html('<table width="100%" border="0"><tr><td class="explain"></td><td class="chart"></td></tr></table>');

            var explain = '<b>' + PMA_messages.strExplainOutput + '</b> ' + $('#explain_docu').html();
            if (data.explain.length > 1) {
                explain += ' (';
                for (i = 0; i < data.explain.length; i++) {
                    if (i > 0) {
                        explain += ', ';
                    }
                    explain += '<a href="#showExplain-' + i + '">' + i + '</a>';
                }
                explain += ')';
            }
            explain += '<p></p>';
            for (i = 0, l = data.explain.length; i < l; i++) {
                explain += '<div class="explain-' + i + '"' + (i > 0 ?  'style="display:none;"' : '') + '>';
                $.each(data.explain[i], function (key, value) {
                    value = (value === null) ? 'null' : escapeHtml(value);

                    if (key == 'type' && value.toLowerCase() == 'all') {
                        value = '<span class="attention">' + value + '</span>';
                    }
                    if (key == 'Extra') {
                        value = value.replace(/(using (temporary|filesort))/gi, '<span class="attention">$1</span>');
                    }
                    explain += key + ': ' + value + '<br />';
                });
                explain += '</div>';
            }

            explain += '<p><b>' + PMA_messages.strAffectedRows + '</b> ' + data.affectedRows;

            $('#queryAnalyzerDialog div.placeHolder td.explain').append(explain);

            $('#queryAnalyzerDialog div.placeHolder a[href*="#showExplain"]').click(function () {
                var id = $(this).attr('href').split('-')[1];
                $(this).parent().find('div[class*="explain"]').hide();
                $(this).parent().find('div[class*="explain-' + id + '"]').show();
            });

            if (data.profiling) {
                var chartData = [];
                var numberTable = '<table class="queryNums"><thead><tr><th>' + PMA_messages.strStatus + '</th><th>' + PMA_messages.strTime + '</th></tr></thead><tbody>';
                var duration;
                var otherTime = 0;

                for (i = 0, l = data.profiling.length; i < l; i++) {
                    duration = parseFloat(data.profiling[i].duration);

                    totalTime += duration;

                    numberTable += '<tr><td>' + data.profiling[i].state + ' </td><td> ' + PMA_prettyProfilingNum(duration, 2) + '</td></tr>';
                }

                // Only put those values in the pie which are > 2%
                for (i = 0, l = data.profiling.length; i < l; i++) {
                    duration = parseFloat(data.profiling[i].duration);

                    if (duration / totalTime > 0.02) {
                        chartData.push([PMA_prettyProfilingNum(duration, 2) + ' ' + data.profiling[i].state, duration]);
                    } else {
                        otherTime += duration;
                    }
                }

                if (otherTime > 0) {
                    chartData.push([PMA_prettyProfilingNum(otherTime, 2) + ' ' + PMA_messages.strOther, otherTime]);
                }

                numberTable += '<tr><td><b>' + PMA_messages.strTotalTime + '</b></td><td>' + PMA_prettyProfilingNum(totalTime, 2) + '</td></tr>';
                numberTable += '</tbody></table>';

                $('#queryAnalyzerDialog div.placeHolder td.chart').append(
                    '<b>' + PMA_messages.strProfilingResults + ' ' + $('#profiling_docu').html() + '</b> ' +
                    '(<a href="#showNums">' + PMA_messages.strTable + '</a>, <a href="#showChart">' + PMA_messages.strChart + '</a>)<br/>' +
                    numberTable + ' <div id="queryProfiling"></div>');

                $('#queryAnalyzerDialog div.placeHolder a[href="#showNums"]').click(function () {
                    $('#queryAnalyzerDialog #queryProfiling').hide();
                    $('#queryAnalyzerDialog table.queryNums').show();
                    return false;
                });

                $('#queryAnalyzerDialog div.placeHolder a[href="#showChart"]').click(function () {
                    $('#queryAnalyzerDialog #queryProfiling').show();
                    $('#queryAnalyzerDialog table.queryNums').hide();
                    return false;
                });

                profilingChart = PMA_createProfilingChartJqplot(
                        'queryProfiling',
                        chartData
                );

                //$('#queryProfiling').resizable();
            }
        });
    }