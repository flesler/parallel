#!/usr/bin/env node

const fs = require('fs')
const help = require('../lib/help')
const cli = require('../lib/cli')

// Get the help output directly from the help module
const helpOutput = help.getText(cli.options)

let markdown = helpOutput
  .replace(/^(.+):\n/gm, '# $1\n\n```bash\n')
  .replace(/^( {2}.*\n)\n/gm, '$1```\n\n')
  .replace(/^ {2}/gm, '')

const lines = markdown.split('\n').slice(2, -2)
const firstLine = lines[0].trim()
const lastLine = lines.slice(-2).join('\n').trim()

const readmePath = 'README.md'
const readme = fs.readFileSync(readmePath, 'utf8')

const pattern = new RegExp(`${escape(firstLine)}[\\s\\S]*?${escape(lastLine)}`)
markdown = lines.join('\n').trim()
const updatedReadme = readme.replace(pattern, () => markdown)

if (updatedReadme === readme) {
  console.log('No changes needed in README.md')
} else {
  fs.writeFileSync(readmePath, updatedReadme)
  console.log('Updated README.md with current --help output')
}

function escape(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}