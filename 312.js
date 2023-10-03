function ffprobe(file) {
    return new Promise((resolve, reject) => {
        if (!file)
            throw new Error('no file provided');
        fs_1.stat(file, (err, stats) => {
            if (err)
                return reject(new Error('wrong file provided'));
            child_process_1.exec('ffprobe -v quiet -print_format json -show_format -show_streams ' + file, (error, stdout, stderr) => {
                if (error)
                    return reject(error);
                if (!stdout)
                    return reject(new Error("can't probe file " + file));
                let ffprobed;
                try {
                    ffprobed = JSON.parse(stdout);
                }
                catch (err) {
                    return reject(err);
                }
                for (let i = 0; i < ffprobed.streams.length; i++) {
                    if (ffprobed.streams[i].codec_type === 'video')
                        ffprobed.video = ffprobed.streams[i];
                    if (ffprobed.streams[i].codec_type === 'audio' && ffprobed.streams[i].channels)
                        ffprobed.audio = ffprobed.streams[i];
                }
                resolve(ffprobed);
            });
        });
    });
}