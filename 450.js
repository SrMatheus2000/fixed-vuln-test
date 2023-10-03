function jsonPathExtractionQuery(column, path) {
    let paths = _.toPath(path);
    let pathStr;
    const quotedColumn = this.isIdentifierQuoted(column)
      ? column
      : this.quoteIdentifier(column);

    switch (this.dialect) {
      case 'mysql':
        /**
         * Sub paths need to be quoted as ECMAScript identifiers
         * https://bugs.mysql.com/bug.php?id=81896
         */
        paths = paths.map(subPath => Utils.addTicks(subPath, '"'));
        pathStr = this.escape(['$'].concat(paths).join('.'));
        return `(${quotedColumn}->>${pathStr})`;

      case 'mariadb':
        pathStr = this.escape(['$'].concat(paths).join('.'));
        return `json_unquote(json_extract(${quotedColumn},${pathStr}))`;

      case 'sqlite':
        pathStr = this.escape(['$']
          .concat(paths)
          .join('.')
          .replace(/\.(\d+)(?:(?=\.)|$)/g, (_, digit) => `[${digit}]`));
        return `json_extract(${quotedColumn}, ${pathStr})`;

      case 'postgres':
        pathStr = this.escape(`{${paths.join(',')}}`);
        return `(${quotedColumn}#>>${pathStr})`;

      default:
        throw new Error(`Unsupported ${this.dialect} for JSON operations`);
    }
  }