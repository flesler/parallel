const os = require('os')

module.exports = {
  maxJobs: os.cpus().length,
  maxArgs: 1,
  lineSep: '\n',
  quote: false,
  trim: false,
  colSep: ' ',
  pipeMode: false,
  bgMode: false,
  delay: 0,
  timeout: 0,
  src: process.stdin,
  eol: '\n'/*os.EOL*/,
  verbose: false,
  shell: false,
  haltOnError: false,
  tag: false,
  joblog: null,
  shuf: false,
// Remaining arguments (the command)
  _: null,
}
