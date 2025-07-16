#!/usr/bin/env node
const { readFileSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')

// $ node bin/changelog.js
// FIXME: Doesn't include the last release until tagged (catch 22)

function exec(...args) {
  const command = args.join(' ')
  console.log('$', command)
  return execSync(command)
}

function skipSomeLines() {
  const lines = readFileSync('CHANGELOG.md', 'utf8').split('\n').filter(line => (
    !/^(> |- Release \d)/.test(line)
  ))
  const out = lines.join('\n').replace(/\n{3,}/g, '\n\n')
  writeFileSync('CHANGELOG.md', out)
}

exec('./node_modules/.bin/auto-changelog', '--commit-limit', '10000', '--backfill-limit', '10000', '--sort-commits', 'date', '--hide-credit')
skipSomeLines()
