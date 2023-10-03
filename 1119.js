function unique_name_672(data) {
            $("#mainContent legend").html(data.legendText);
            $("#mainContent h4").html(data.headText);
            $("#mainContent p").html(data.subText);
            $("#mainContent #extra").html(data.extra);
            $("#mainContent #newCols").html('');
            $('.tblFooters').html('');
            primary_key = $.parseJSON(data.primary_key);
            for(var pk in primary_key) {
                $("#extra input[value='" + escapeJsString(primary_key[pk]) + "']").attr("disabled","disabled");
            }
        }