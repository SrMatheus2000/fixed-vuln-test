async error => {
  log.warn(error.message);
  log.warn('dwebp pre-build test failed');
  log.info('compiling from source');

  try {
    await binBuild.file(path.resolve(__dirname, '../vendor/source/libwebp-1.1.0.tar.gz'), [
      `./configure --disable-shared --prefix="${bin.dest()}" --bindir="${bin.dest()}"`,
      'make && make install'
    ]);

    log.success('dwebp built successfully');
  } catch (error) {
    log.error(error.stack);

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}