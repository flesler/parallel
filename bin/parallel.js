#!/usr/bin/env node
const
  opts = require('../lib/opts'),
  jobs = require('../lib/jobs'),
  util = require('../lib/util'),
  input = require('../lib/input'),
  cli = require('../lib/cli')

process.on('uncaughtException', util.fatal)
process.setMaxListeners(Infinity)

cli.parse(process.argv.slice(2))

if (opts.pipe) {
  jobs.spawnPiped()
}

input.open()
