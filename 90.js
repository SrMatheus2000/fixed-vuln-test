function tileRec(inPath, outPath, zoom, tileSize, tempDir, pattern, zoomToDisplay, invertZoom, quality) {
    var inPathMpc = tempDir + '/temp_level_' + zoom + '.mpc';
    var inPathCache = tempDir + '/temp_level_' + zoom + '.cache';
    execFileSync('convert', [inPath, inPathMpc]);
    return tileLevel(inPathMpc, outPath, zoomToDisplay, tileSize, pattern, quality)
        .then(function () {
            if (imageBiggerThanTile(inPath, tileSize)) {
                var newZoom = zoom + 1;
                var newZoomToDisplay = zoomToDisplay + 1;
                if (!invertZoom) {
                    newZoomToDisplay = zoomToDisplay - 1;
                }
                var newInPath = tempDir + '/temp_level_' + zoom + '.png';
                execFileSync('convert', [inPathMpc, '-resize', '50%', '-quality', quality, newInPath]);
                fs.unlinkSync(inPathMpc);
                fs.unlinkSync(inPathCache);
                return tileRec(newInPath, outPath, newZoom, tileSize, tempDir, pattern, newZoomToDisplay, invertZoom, quality);
            } else {
                fs.unlinkSync(inPathMpc);
                fs.unlinkSync(inPathCache);
            }
        });
}