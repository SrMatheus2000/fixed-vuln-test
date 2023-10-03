function parseFileHeader(index) {
    const fileHeader = (/^(---|\+\+\+)\s+(.*)$/).exec(diffstr[i]);
    if (fileHeader) {
      let keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
      const data = fileHeader[2].split('\t', 2);
      let fileName = data[0].replace(/\\\\/g, '\\');
      if (/^".*"$/.test(fileName)) {
        fileName = fileName.substr(1, fileName.length - 2);
      }
      index[keyPrefix + 'FileName'] = fileName;
      index[keyPrefix + 'Header'] = (data[1] || '').trim();

      i++;
    }
  }