const
  util = require('./util'),
  opts = require('./opts'),
  jobs = require('./jobs'),
  stream = require('stream')

const NEW_LINE = '\n'

exports.open = function() {
  // Check if command contains {##} placeholder
  const hasTotal = opts._.some(arg => arg.includes('{##}'))
  const needsBuffering = opts.shuf || hasTotal
  // If new line, support with and without carriage return
  const sep = opts.delimiter === NEW_LINE ? /\r?\n/ : new RegExp(opts.delimiter)
  let lines = needsBuffering ? [] : null // Buffer when shuffling or when {##} is used

  let src = opts.argFile, buf = ''
  src.setEncoding('utf8')
  src.on('error', util.fatal)

  // Handle block-based input for pipe mode
  if (opts.block) {
    let blockBuffer = ''
    src.on('data', function (chunk) {
      blockBuffer += chunk
      while (blockBuffer.length >= opts.block) {
        const block = blockBuffer.slice(0, opts.block)
        blockBuffer = blockBuffer.slice(opts.block)
        jobs.processLine(block)
      }
    })
    src.on('end', function () {
      if (blockBuffer) {
        jobs.processLine(blockBuffer)
      }
      jobs.close()
    })
    return
  }

  src.on('data', function(chunk) {
    if (sep.test(chunk)) {
      const buffer = (buf + chunk).split(sep)
      buf = buffer.pop()
      if (lines) {
        // Collect lines for shuffling
        lines.push.apply(lines, buffer)
      } else {
        // Process lines immediately
        buffer.forEach(jobs.processLine)
      }
    } else {
      buf += chunk
    }
  })
  src.once('end', function() {
    if (buf) {
      if (lines) {
        lines.push(buf)
      } else {
        jobs.processLine(buf)
      }
      buf = ''
    }

    if (lines) {
      // Calculate total jobs when we have all buffered lines
      if (lines.length > 0) {
        const jobs = opts.maxArgs || opts.jobs
        opts._totalJobs = Math.ceil(lines.length / jobs)
      }
      if (opts.shuf) {
        lines.sort(() => Math.random() - 0.5)
      }
      lines.forEach(jobs.processLine)
    }

    jobs.close()
  })

  // When nothing is piped, stdin needs end() closed to be released
  if (src === process.stdin && process.stdin.isTTY) {
    src.end()
  }
}

// Input provided through command-line with ::: is placed first
exports.setInlineInput = function(inputs) {
  const perms = generatePermutations(inputs)
  const data = perms.join(opts.delimiter) + opts.delimiter

  // Create a readable stream from the inline input data
  const inputStream = new stream.Readable()
  inputStream.push(data)
  inputStream.push(null) // End the stream

  // Replace the input source
  opts.argFile = inputStream
}

function generatePermutations(inputs) {
  const perms = []
  let max = inputs.reduce((m, input) => m * input.length, 1)

  while (max--) {
    let rest = max
    const cols = []
    let i = inputs.length
    while (i--) {
      const input = inputs[i]
      const l = input.length
      cols.unshift(input[rest % l])
      rest = Math.floor(rest / l)
    }
    perms.unshift(cols.join(opts.colsep))
  }
  return perms
}
