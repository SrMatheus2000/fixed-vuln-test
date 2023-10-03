(file, i) => (
          `<li>
            <a
              download="${escapeHtml(file.name)}"
              href="/${escapeHtml(i)}/${escapeHtml(file.name)}"
            >
              ${escapeHtml(file.path)}
            </a>
            (${escapeHtml(file.length)} bytes)
          </li>`
        );