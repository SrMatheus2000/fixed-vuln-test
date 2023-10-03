function unique_name_16() {
            gitTools.init(_settings).then(function(gitConfig) {
                if (!gitConfig || /^1\./.test(gitConfig.version)) {
                    if (!gitConfig) {
                        projectLogMessages.push(log._("storage.localfilesystem.projects.git-not-found"))
                    } else {
                        projectLogMessages.push(log._("storage.localfilesystem.projects.git-version-old",{version:gitConfig.version}))
                    }
                    projectsEnabled = false;
                    try {
                        // As projects have to be turned on, we know this property
                        // must exist at this point, so turn it off.
                        // TODO: when on-by-default, this will need to do more
                        // work to disable.
                        settings.editorTheme.projects.enabled = false;
                    } catch(err) {
                    }
                } else {
                    globalGitUser = gitConfig.user;
                    Projects.init(settings,runtime);
                    sshTools.init(settings);
                    projectsDir = fspath.resolve(fspath.join(settings.userDir,"projects"));
                    if (!settings.readOnly) {
                        return fs.ensureDir(projectsDir)
                        //TODO: this is accessing settings from storage directly as settings
                        //      has not yet been initialised. That isn't ideal - can this be deferred?
                        .then(storageSettings.getSettings)
                        .then(function(globalSettings) {
                            var saveSettings = false;
                            if (!globalSettings.projects) {
                                globalSettings.projects = {
                                    projects: {}
                                }
                                saveSettings = true;
                            } else {
                                activeProject = globalSettings.projects.activeProject;
                            }
                            if (!globalSettings.projects.projects) {
                                globalSettings.projects.projects = {};
                                saveSettings = true;
                            }
                            if (settings.flowFile) {
                                // if flowFile is a known project name - use it
                                if (globalSettings.projects.projects.hasOwnProperty(settings.flowFile)) {
                                    activeProject = settings.flowFile;
                                    globalSettings.projects.activeProject = settings.flowFile;
                                    saveSettings = true;
                                } else {
                                    // if it resolves to a dir - use it
                                    try {
                                        var stat = fs.statSync(fspath.join(projectsDir,settings.flowFile));
                                        if (stat && stat.isDirectory()) {
                                            activeProject = settings.flowFile;
                                            globalSettings.projects.activeProject = activeProject;
                                            // Now check for a credentialSecret
                                            if (settings.credentialSecret !== undefined) {
                                                globalSettings.projects.projects[settings.flowFile] = {
                                                    credentialSecret: settings.credentialSecret
                                                }
                                                saveSettings = true;
                                            }
                                        }
                                    } catch(err) {
                                        // Doesn't exist, handle as a flow file to be created
                                    }
                                }
                            }
                            if (!activeProject) {
                                projectLogMessages.push(log._("storage.localfilesystem.no-active-project"))
                            }
                            if (saveSettings) {
                                return storageSettings.saveSettings(globalSettings);
                            }
                        });
                    }
                }
            });
        }