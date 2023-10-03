function goToFinish1NF()
{
    if (normalizeto !== '1nf') {
        goTo2NFStep1();
        return true;
    }
    $("#mainContent legend").html(PMA_messages.strEndStep);
    $("#mainContent h4").html(
        "<h3>" + PMA_sprintf(PMA_messages.strFinishMsg, escapeHtml(PMA_commonParams.get('table'))) + "</h3>"
    );
    $("#mainContent p").html('');
    $("#mainContent #extra").html('');
    $("#mainContent #newCols").html('');
    $('.tblFooters').html('');
}