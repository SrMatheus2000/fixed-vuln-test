function unique_name_650() {
    $('#rep').text(conf_prefix);
    $('#db_type').change(update_config);
    $('#db_select').change(update_config);

    $('#master_status_href').click(function() {
        $('#replication_master_section').toggle(); 
        });
    $('#master_slaves_href').click(function() {
        $('#replication_slaves_section').toggle(); 
        });
    $('#slave_status_href').click(function() {
        $('#replication_slave_section').toggle(); 
        });
    $('#slave_control_href').click(function() {
        $('#slave_control_gui').toggle(); 
        });
    $('#slave_errormanagement_href').click(function() {
        $('#slave_errormanagement_gui').toggle(); 
        });
    $('#slave_synchronization_href').click(function() {
        $('#slave_synchronization_gui').toggle(); 
        });
    $('#db_reset_href').click(function() {
        $('#db_select option:selected').attr('selected', false); 
        });
}