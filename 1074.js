function unique_name_637 (button, event) {
        var app = this.initialConfig.app,
            nodeName = '',
            nodes = this.initialConfig.selections;

        if (nodes && nodes.length) {
            for (var i = 0; i < nodes.length; i++) {
                var currNodeData = nodes[i].data;
                nodeName += Tine.Tinebase.EncodingHelper.encode(typeof currNodeData.name == 'object' ?
                    currNodeData.name.name :
                    currNodeData.name) + '<br />';
            }
        }

        this.conflictConfirmWin = Tine.widgets.dialog.FileListDialog.openWindow({
            modal: true,
            allowCancel: false,
            height: 180,
            width: 300,
            title: app.i18n._('Do you really want to delete the following files?'),
            text: nodeName,
            scope: this,
            handler: function (button) {
                if (nodes && button == 'yes') {
                    Tine.Filemanager.fileRecordBackend.deleteItems(nodes);
                }

                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];

                    if (node.fileRecord) {
                        var upload = Tine.Tinebase.uploadManager.getUpload(node.fileRecord.get('uploadKey'));
                        upload.setPaused(true);
                        Tine.Tinebase.uploadManager.unregisterUpload(upload.id);
                    }

                }
            }
        });
    }