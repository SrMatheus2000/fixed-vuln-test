function unique_name_653()
    {
        var u = $('upload');
        this.uniqueSubmit('addAttachment');
        u.up().hide();
        $('upload_wait').update(DimpCore.text.uploading + ' (' + $F(u).escapeHTML() + ')').show();
    }