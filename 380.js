function serveIndexPage () {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')

      const listHtml = torrent.files
        .map((file, i) => (
          `<li>
            <a
              download="${escapeHtml(file.name)}"
              href="/${escapeHtml(i)}/${escapeHtml(file.name)}"
            >
              ${escapeHtml(file.path)}
            </a>
            (${escapeHtml(file.length)} bytes)
          </li>`
        ))
        .join('<br>')

      const html = getPageHTML(
        `${escapeHtml(torrent.name)} - WebTorrent`,
        `
          <h1>${escapeHtml(torrent.name)}</h1>
          <ol>${listHtml}</ol>
        `
      )
      res.end(html)
    }