#!/usr/bin/env node
const fs = require('fs')
const help = require('../lib/help')
const util = require('../lib/util')

// Get the help output directly from the help module
const output = help.getText()

const markdown = output
  .replace(/^(.+):\n/gm, '# $1\n\n```bash\n')
  .replace(/^( {2}.*\n)\n/gm, '$1```\n\n')
  .replace(/^ {2}/gm, '')
  .split('\n').slice(2, -2).join('\n').trim()

const readmePath = 'README.md'
const readme = fs.readFileSync(readmePath, 'utf8')

const firstLine = util.escapeRegex(markdown.split('\n')[0])
const lastLine = util.escapeRegex('# Input from command-line arguments')

const pattern = new RegExp(`${firstLine}[\\s\\S]*?(?=\n+${lastLine})`)
const updatedReadme = readme.replace(pattern, () => markdown)

if (updatedReadme === readme) {
  console.log('No changes needed in README.md')
} else {
  fs.writeFileSync(readmePath, updatedReadme)
  console.log('Updated README.md with current --help output')
}