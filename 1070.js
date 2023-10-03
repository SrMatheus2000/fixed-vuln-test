function unique_name_634(error) {
                that.events.trigger("file_load_failed.Editor", error);
                console.warn('Error loading: ', error);
                cm.setValue("Error! " + error.message +
                                "\nSaving disabled.\nSee Console for more details.");
                cm.setOption('readOnly','nocursor');
                that.save_enabled = false;
            }