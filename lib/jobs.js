const
  cp = require('child_process'),
  util = require('./util'),
  opts = require('./opts'),
  placeholders = require('./placeholders')

let
  procs = [],
  buffer = [],
  closing = false,
  jobId = 0,
  outputBuffer = {},
  nextOutputId = 1

const timer = util.timer()

function prepareCommand(args) {
  if (opts.shell) {
    // This is still experimental
    return ['sh', '-c', args.join(' ')]
  }
  return args
}

function spawn(args, tag) {
  args = prepareCommand(args)

  const stdio = ['pipe', process.stdout, process.stderr]
  if (opts.tag || opts.keepOrder) {
  // Capture stdout to add tags or buffer for ordering
    stdio[1] = 'pipe'
  }

  const proc = cp.spawn(args[0], args.slice(1), {
    stdio: stdio,
    detached: opts.bg,
    timeout: opts.timeout * 1e3
  })

  // Handle stdout capture for tagging or ordering
  if (opts.tag || opts.keepOrder) {
    let output = ''
    proc.stdout.on('data', function (chunk) {
      output += chunk.toString()
    })

    proc.stdout.on('end', function () {
      if (opts.keepOrder) {
        // Buffer output for ordered release
        outputBuffer[proc.id] = output
        flushOrderedOutput()
      } else if (opts.tag && tag) {
        // Apply tags and output immediately
        const lines = output.split('\n')
        const taggedLines = lines.map(function (line, i) {
          // Don't tag the final empty line that split creates
          if (line === '' && i === lines.length - 1) return ''
          return `${tag}\t${line}`
        })
        process.stdout.write(taggedLines.join('\n'))
      } else {
        process.stdout.write(output)
      }
    })
  }
  proc.id = jobId
  procs.push(proc)

  if (opts.printCommands) {
    // Print command being run (GNU parallel -t behavior)
    util.error(args.join(' '))
  }

  if (opts.verbose) {
    proc.timer = util.timer()
    // In pipe mode, don't print command for every job since it's always the same
    if (!opts.pipe) {
      util.error('Job %d (%d) command: "%s"', proc.id, proc.pid, args.join(' '))
    }
    proc.on('exit', function(code) {
      util.error('Job %d (%d) handled %d line(s) in %s and exited with code %d', proc.id, proc.pid, proc.handled, timer(), code)
    })
  }

  // Log job details if --joblog is enabled
  if (opts.joblog) {
    proc.startTime = Date.now()
    proc.timer = proc.timer || util.timer()
    // Store the command, removing newlines and tabs that would break TSV format
    proc.command = args.join(' ').replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim()

    proc.on('exit', function (code, signal) {
      // Ensure minimum precision for very fast jobs
      const runtime = parseFloat(proc.timer().replace('s', '')) || 0.01
      const signalnum = signal ? (typeof signal === 'string' ? 0 : signal) : 0

      // Format: Seq Host Starttime JobRuntime Send Receive Exitval Signal Command
      const logLine = [
        proc.id,                    // Seq
        'localhost',                // Host
        Math.floor(proc.startTime / 1000), // Starttime (epoch)
        runtime,                    // JobRuntime
        0,                          // Send (bytes sent)
        0,                          // Receive (bytes received)
        code || 0,                  // Exitval
        signalnum,                  // Signal
        proc.command                // Command
      ].join('\t') + '\n'

      opts.joblog.write(logLine)
    })
  }

  proc.on('close', function(code) {
    if (!code) return
    // Exit code will include the amount of failed jobs (up to 101) like GNU version does
    process.exitCode = Math.min(100, process.exitCode || 0) + 1
    if (opts.haltOnError) {
      process.exit()
    }
  })
  return proc
}

exports.spawnPiped = function() {
  // Print command once in verbose or print-commands mode since all jobs use the same command
  if (opts.verbose) {
    util.error('Pipe command: "%s"', opts._.join(' '))
  } else if (opts.printCommands) {
    util.error(opts._.join(' '))
  }

  // Spawn them in advance
  while (jobId++ < opts.jobs) {
    const proc = spawn(opts._, null) // No specific tag for piped mode
    proc.handled = 0
    proc.stdin.on('drain', function() {
      this.writable = true
      flush()
    }.bind(proc))
  }
}

function flushPiped() {
  while (buffer.length) {
    let i
    for (i = 0; i < opts.jobs; i++) {
      const proc = procs[i]
      // Skip job if not writable unless all input was received
      if (!closing && proc.writable === false) {
        continue
      }
      proc.writable = proc.stdin.write(buffer.shift() + opts.eol)
      proc.handled++
      // Round-Robin the input between the jobs
      procs.splice(i, 1)
      procs.push(proc)
      break
    }
    // No job handled
    if (i === opts.jobs) break
  }
}

function flushWithArgs() {
  let max = opts.maxArgs
  if (!max) {
    // Wait until all lines are buffered
    if (!closing) return
    // Distribute lines evenly among expected # of jobs
    max = Math.ceil(buffer.length / opts.jobs)
  }
  const min = closing ? 1 : max
  while (buffer.length >= min) {
    if (opts.jobs && procs.length === opts.jobs) {
      return
    }

    const lines = buffer.splice(0, max)
    // Send the jobId that would be assigned to this job
    let args = placeholders.parse(++jobId, lines)
    // Job doesn't really run
    if (opts.dryRun) {
      args = prepareCommand(args)
      console.log(args.join(' '))
      continue
    }

    const tag = lines.length === 1 ? lines[0] : lines.join(',')
    const proc = spawn(args, tag)
    proc.handled = lines.length
    proc.on('exit', function() {
      procs.splice(procs.indexOf(this), 1)
      // Check if all jobs are done and close joblog if needed
      checkAllJobsDone()
      // Wait `delay` seconds before starting a new job
      setTimeout(flush, opts.delay * 1e3)
    })
  }
}

function flush() {
  if (opts.pipe) {
    flushPiped()
  } else  {
    flushWithArgs()
  }
  if (closing && opts.bg && !buffer.length) {
    // If --bg, don't wait for jobs to exit
    process.nextTick(process.exit)
  }
}

exports.processLine = function(line) {
  if (opts.trim) line = line.trim()
  // Ignore empty lines
  if (!line) return
  if (opts.quote) line = `"${line}"`
  buffer.push(line)
  flush()
}

exports.close = function() {
  closing = true
  flush()

  procs.forEach(function(proc) {
    proc.stdin.end()
  })

  if (opts.verbose) {
    process.on('exit', function() {
      util.error('Elapsed time:', timer())
    })
  }

  // Check if all jobs are done and close joblog if needed
  checkAllJobsDone()
}

function flushOrderedOutput() {
  while (outputBuffer[nextOutputId]) {
    process.stdout.write(outputBuffer[nextOutputId])
    delete outputBuffer[nextOutputId]
    nextOutputId++
  }
}

function checkAllJobsDone() {
  // If we're closing and no jobs are running, close the joblog
  if (closing && procs.length === 0 && opts.joblog) {
    opts.joblog.end()
    opts.joblog = null // Prevent double-closing
  }
}
