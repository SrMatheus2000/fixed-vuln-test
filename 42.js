function loadProject(name) {
    let fullPath = fspath.resolve(fspath.join(projectsDir,name));
    var projectPath = name;
    if (projectPath.indexOf(fspath.sep) === -1) {
        projectPath = fullPath;
    } else {
        // Ensure this project dir is under projectsDir;
        let relativePath = fspath.relative(projectsDir,fullPath);
        if (/^\.\./.test(relativePath)) {
            throw new Error("Invalid project name")
        }
    }
    return Projects.load(projectPath).then(function(project) {
        activeProject = project;
        flowsFullPath = project.getFlowFile();
        flowsFileBackup = project.getFlowFileBackup();
        credentialsFile = project.getCredentialsFile();
        credentialsFileBackup = project.getCredentialsFileBackup();
        return project;
    })
}