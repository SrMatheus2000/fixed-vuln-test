function tileLevel(inPath, outPath, zoom, tileSize, pattern, quality) {
    var dotExtension = pattern.replace(/.*(\.[^.]+)$/, '$1');
    var patternedFilename = pattern.replace(/\{z\}/, '' + zoom)
        .replace(/\{x\}/, '%[fx:page.x/' + tileSize + ']')
        .replace(/\{y\}/, '%[fx:page.y/' + tileSize + ']')
        .replace(/\.[^.]+$/, '');
    var patternedFilenameWithoutTheFilename = '';
    if (pattern.indexOf(path.sep) > 0) {
        patternedFilenameWithoutTheFilename = pattern.replace(new RegExp(path.sep + '[^' + path.sep + ']*$'), '')
            .replace(/\{z\}/, '' + zoom);
    }
    return mkdirp(outPath + path.sep + patternedFilenameWithoutTheFilename)
        .then(() => {
            var args = [inPath,
                '-crop', tileSize + 'x' + tileSize,
                '-set', 'filename:tile', patternedFilename,
                '-quality', quality, '+repage', '+adjoin',
                outPath + '/%[filename:tile]' + dotExtension];
            execFileSync('convert', args);
        });
}