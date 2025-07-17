#!/usr/bin/env node
const { readFileSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')

// $ node bin/changelog.js minor --dry-run

const BUMPS = ['major', 'minor', 'patch', 'none']

const bump = process.argv[2] || 'minor'
const dryRun = process.argv[3] === '--dry-run'

if (!BUMPS.includes(bump)) {
  throw new Error('First argument must be one of ' + BUMPS.join(', '))
}

function exec(...args) {
  const command = args.join(' ')
  console.log('$', command)
  if (!dryRun) {
    return execSync(command)
  }
}

function git(...args) {
  exec('git', ...args)
}

function npm(...args) {
  exec('npm', ...args)
}

function safe(fn, ...args) {
  try {
    return fn(...args)
  } catch (err) {
    // IGNORE
  }
}

git('pull', '--rebase', 'origin', 'master')
if (bump !== 'none') {
  npm('--no-git-tag-version', 'version', bump)
}

// After npm version updated the version
const pkg = require('../package.json')
const tag = `v${pkg.version}`
// If they exist remove them first
safe(git, 'tag', '-d', tag)
safe(git, 'push', 'origin', '--delete', tag)
// auto-changelog works with the online repo so all must be pushed
git('push', 'origin', 'master')

if (!dryRun) {
  require('./changelog')
  require('./readme')
}

git('add', 'CHANGELOG.md', 'README.md', 'package.json', 'package-lock.json')
git('commit', '-m', tag, '--no-verify')
git('tag', tag, '-m', tag)

git('push', 'origin', 'master')
git('push', 'origin', '--tags')
