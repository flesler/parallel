var
  util = require('./util'),
  opts = require('./opts'),
  jobs = require('./jobs'),
  stream = require('stream')

const NEW_LINE = '\n'

exports.open = function() {
  // If new line, support with and without carriage return
  var sep = opts.lineSep === NEW_LINE ? /\r?\n/ : new RegExp(opts.lineSep)
  var lines = opts.shuf ? [] : null // Only buffer when shuffling

  var src = opts.src, buf = ''
  src.setEncoding('utf8')
  src.on('error', util.fatal)
  src.on('data', function(chunk) {
    if (sep.test(chunk)) {
      var buffer = (buf+chunk).split(sep)
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
      // Shuffle and process all lines
      lines.sort(function () { return Math.random() - 0.5 })
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
  var perms = generatePermutations(inputs)
  var data = perms.join(opts.lineSep) + opts.lineSep

  // Create a readable stream from the inline input data
  var inputStream = new stream.Readable()
  inputStream.push(data)
  inputStream.push(null) // End the stream

  // Replace the input source
  opts.src = inputStream
}

function generatePermutations(inputs) {
  var perms = []
  var max = inputs.reduce(function(m, input) {
    return m * input.length
  }, 1)

  while (max--) {
    var rest = max
    var cols = []
    var i = inputs.length
    while (i--) {
      var input = inputs[i]
      var l = input.length
      cols.unshift(input[rest % l])
      rest = Math.floor(rest / l)
    }
    perms.unshift(cols.join(opts.colSep))
  }
  return perms
}
