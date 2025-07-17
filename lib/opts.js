const os = require('os')

module.exports = {
  jobs: os.cpus().length,
  maxArgs: 1,
  delimiter: '\n',
  quote: false,
  trim: false,
  colsep: ' ',
  pipe: false,
  bg: false,
  delay: 0,
  timeout: 0,
  argFile: process.stdin,
  eol: '\n',
  verbose: false,
  shell: false,
  haltOnError: false,
  tag: false,
  joblog: null,
  shuf: false,
  keepOrder: false,
  printCommands: false,
  block: null,
// Remaining arguments (the command)
  _: null,
  _totalJobs: 'N/A',
}
