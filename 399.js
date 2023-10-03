function unique_name_203 (column, path) {
    let paths = _.toPath(path);
    let pathStr;
    const quotedColumn = this.isIdentifierQuoted(column)
      ? column
      : this.quoteIdentifier(column);

    switch (this.dialect) {
      case 'mysql':
      case 'mariadb':
      case 'sqlite':
        /**
         * Non digit sub paths need to be quoted as ECMAScript identifiers
         * https://bugs.mysql.com/bug.php?id=81896
         */
        if (this.dialect === 'mysql') {
          paths = paths.map(subPath => {
            return /\D/.test(subPath)
              ? Utils.addTicks(subPath, '"')
              : subPath;
          });
        }

        pathStr = this.escape(['$']
          .concat(paths)
          .join('.')
          .replace(/\.(\d+)(?:(?=\.)|$)/g, (__, digit) => `[${digit}]`));

        if (this.dialect === 'sqlite') {
          return `json_extract(${quotedColumn},${pathStr})`;
        }

        return `json_unquote(json_extract(${quotedColumn},${pathStr}))`;

      case 'postgres':
        pathStr = this.escape(`{${paths.join(',')}}`);
        return `(${quotedColumn}#>>${pathStr})`;

      default:
        throw new Error(`Unsupported ${this.dialect} for JSON operations`);
    }
  }