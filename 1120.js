function goToStep4()
{
    $.post(
        "normalization.php",
        {
            "token": PMA_commonParams.get('token'),
            "ajax_request": true,
            "db": PMA_commonParams.get('db'),
            "table": PMA_commonParams.get('table'),
            "step4": true
        }, function(data) {
            $("#mainContent legend").html(data.legendText);
            $("#mainContent h4").html(data.headText);
            $("#mainContent p").html(data.subText);
            $("#mainContent #extra").html(data.extra);
            $("#mainContent #newCols").html('');
            $('.tblFooters').html('');
            for(var pk in primary_key) {
                $("#extra input[value='" + escapeJsString(primary_key[pk]) + "']").attr("disabled","disabled");
            }
        }
    );
}