function coverQuery (context, coverage, statMode) {
  coverage = parseFloat(coverage)
  var usage = browserslist.usage.global
  if (statMode) {
    if (statMode.match(/^my\s+stats$/)) {
      if (!context.customUsage) {
        throw new BrowserslistError(
          'Custom usage statistics was not provided'
        )
      }
      usage = context.customUsage
    } else {
      var place
      if (statMode.length === 2) {
        place = statMode.toUpperCase()
      } else {
        place = statMode.toLowerCase()
      }
      env.loadCountry(browserslist.usage, place, browserslist.data)
      usage = browserslist.usage[place]
    }
  }
  var versions = Object.keys(usage).sort(function (a, b) {
    return usage[b] - usage[a]
  })
  var coveraged = 0
  var result = []
  var version
  for (var i = 0; i <= versions.length; i++) {
    version = versions[i]
    if (usage[version] === 0) break
    coveraged += usage[version]
    result.push(version)
    if (coveraged >= coverage) break
  }
  return result
}