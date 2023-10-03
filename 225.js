function Markdown({ source, className = "", getConfigs }) {
  if (typeof source !== "string") {
    return null
  }

  const md = new Remarkable({
    html: true,
    typographer: true,
    breaks: true,
    linkTarget: "_blank"
  }).use(linkify)

  md.core.ruler.disable(["replacements", "smartquotes"])

  const { useUnsafeMarkdown } = getConfigs()
  const html = md.render(source)
  const sanitized = sanitizer(html, { useUnsafeMarkdown })

  if (!source || !html || !sanitized) {
    return null
  }

  return (
    <div className={cx(className, "markdown")} dangerouslySetInnerHTML={{ __html: sanitized }}></div>
  )
}