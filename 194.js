function execTag (newVersion, pkgPrivate, args) {
  let tagOption
  if (args.sign) {
    tagOption = '-s'
  } else {
    tagOption = '-a'
  }
  checkpoint(args, 'tagging release %s%s', [args.tagPrefix, newVersion])
  return runExecFile(args, 'git', ['tag', tagOption, args.tagPrefix + newVersion, '-m', `"${formatCommitMessage(args.releaseCommitMessageFormat, newVersion)}"`])
    .then(() => runExecFile('', 'git', ['rev-parse', '--abbrev-ref', 'HEAD']))
    .then((currentBranch) => {
      let message = 'git push --follow-tags origin ' + currentBranch.trim()
      if (pkgPrivate !== true && bump.getUpdatedConfigs()['package.json']) {
        message += ' && npm publish'
        if (args.prerelease !== undefined) {
          if (args.prerelease === '') {
            message += ' --tag prerelease'
          } else {
            message += ' --tag ' + args.prerelease
          }
        }
      }

      checkpoint(args, 'Run `%s` to publish', [message], chalk.blue(figures.info))
    })
}