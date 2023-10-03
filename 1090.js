function update_config() {
    var conf_ignore = "binlog_ignore_db=";
    var conf_do = "binlog_do_db=";
    var database_list = $('#db_select option:selected:first').val();
    $('#db_select option:selected:not(:first)').each(function() {
        database_list += ',' + $(this).val();
    });

    if ($('#db_select option:selected').size() == 0) {
        $('#rep').text(conf_prefix);
    } else if ($('#db_type option:selected').val() == 'all') {
        $('#rep').text(conf_prefix + conf_ignore + database_list);
    } else {
        $('#rep').text(conf_prefix + conf_do + database_list);
    }
}