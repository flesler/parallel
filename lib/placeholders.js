const opts = require('./opts')
const crypto = require('crypto')
const util = require('./util')

// Placeholder definitions with description and GNU compatibility info
const placeholders = {
  // GNU parallel basic placeholders
  '': {
    handler: (val) => val,
    desc: 'the input line',
    gnu: true
  },
  '.': {
    handler: (val) => val.replace(/\.[^.]*$/, ''),
    desc: 'the input line without extension',
    gnu: true
  },
  '/': {
    handler: (val) => val.split(/[\/\\]/).pop(),
    desc: 'the basename of the input line',
    gnu: true
  },
  '//': {
    handler: (val) => val.split(/([\/\\])/).slice(0, -2).join(''),
    desc: 'the dirname of the input line',
    gnu: true
  },
  '/.': {
    handler: (val) => placeholders['.'].handler(placeholders['/'].handler(val)),
    desc: 'the basename of the input line without extension',
    gnu: true
  },
  '#': {
    handler: (_, jobId) => jobId,
    desc: 'the sequence number of the job to run, [1,]',
    gnu: true
  },
  '%': {
    handler: (_, jobId) => opts.jobs ? ((jobId - 1) % opts.jobs) + 1 : jobId,
    desc: 'the job slot number [1, --jobs]',
    gnu: true
  },
  '##': {
    handler: () => opts._totalJobs,
    desc: 'total number of jobs to be run',
    gnu: true
  },

  // GNU parallel --plus placeholders
  '..': {
    handler: (val) => val.replace(/\.[^.]*\.[^.]*$/, ''),
    desc: 'the input line without two extensions (e.g., file.tar.gz → file)',
    gnu: true
  },
  '...': {
    handler: (val) => val.replace(/(\.[^.]*){1,3}$/, ''),
    desc: 'the input line without up to three extensions (e.g., file.tar.gz.backup → file)',
    gnu: true
  },
  '/..': {
    handler: (val) => placeholders['..'].handler(placeholders['/'].handler(val)),
    desc: 'the basename without two extensions (e.g., path/file.tar.gz → file)',
    gnu: true
  },
  '/...': {
    handler: (val) => placeholders['...'].handler(placeholders['/'].handler(val)),
    desc: 'the basename without three extensions (e.g., path/file.tar.gz.backup → file)',
    gnu: true
  },
  '+/': {
    handler: (val) => (val.match(/\//g) || []).length,
    desc: 'the number of "/" in the input line',
    gnu: true
  },
  '+.': {
    handler: (val) => (val.match(/\./g) || []).length,
    desc: 'the number of "." in the input line',
    gnu: true
  },
  '+..': {
    handler: (val) => {
      const match = val.match(/(\.[^.]*\.[^.]*)$/)
      return match ? match[1] : ''
    },
    desc: 'the extensions removed by {..} (e.g., file.tar.gz → .tar.gz)',
    gnu: true
  },
  '+...': {
    handler: (val) => {
      const match = val.match(/((\.[^.]*){1,3})$/)
      return match ? match[1] : ''
    },
    desc: 'the extensions removed by {...} (e.g., file.tar.gz.bak → .tar.gz.bak)',
    gnu: true
  },

  // Non-GNU extensions
  'ext': {
    handler: (val) => val.split('.').pop(),
    desc: 'the extension of the input line',
    gnu: false
  },
  'trim': {
    handler: (val) => val.trim(),
    desc: 'the input line with leading/trailing whitespace removed',
    gnu: false
  },
  'v': {
    handler: (val) => val.toLowerCase(),
    desc: 'lower case the value',
    gnu: false
  },
  '^': {
    handler: (val) => val.toUpperCase(),
    desc: 'upper case the value',
    gnu: false
  },
  't': {
    handler: () => Date.now(),
    desc: 'current date-time as a number',
    gnu: false
  },
  'T': {
    handler: () => new Date().toISOString(),
    desc: 'current date-time in ISO format',
    gnu: false
  },
  'd': {
    handler: () => new Date().toISOString().split('T')[0],
    desc: 'current date in ISO format',
    gnu: false
  },
  'r': {
    handler: () => 1e5 + Math.floor(Math.random() * 9e5),
    desc: 'random number between 100000 and 999999',
    gnu: false
  },
  'md5': {
    handler: (val) => crypto.createHash('md5').update(val).digest('hex'),
    desc: 'MD5 hash of the input line',
    gnu: false
  },
  'len': {
    handler: (val) => val.length,
    desc: 'the length of the input line in characters',
    gnu: false
  },
  'wc': {
    handler: (val) => val.trim().split(/\s+/).filter(Boolean).length,
    desc: 'the word count of the input line',
    gnu: false
  },
}

// Matches any operator above, optionally preceeded by a number, enclosed in curly brackets
const REGEX = new RegExp('\\{(-?\\d+)?(' + Object.keys(placeholders).map(util.escapeRegex).join('|') + ')}', 'g')

exports.parse = function(jobId, lines) {
  let any = false
  const out = []
  opts._.forEach(function(arg) {
    // No placeholder in this one
    if (!REGEX.test(arg)) {
      return out.push(arg)
    }
    any = true
    lines.forEach(function(line) {
      out.push(replace(arg, line, jobId))
    })
  })
  // No placeholder, append input to end
  if (!any) out.push.apply(out, lines)
  return out
}

function replace(arg, line, jobId) {
  return arg.replace(REGEX, function(_, num, op) {
    const val = extract(line, num)
    return placeholders[op].handler(val, jobId)
  })
}

function extract(line, num) {
  num = parseInt(num, 10)
  if (!num) return line
  const cols = split(line)
  if (num < 0) {
    num = cols.length + num
  } else {
    // They are 1-based
    num--
  }
  return cols[num] || ''
}

let sep
function split(line) {
  sep = sep || new RegExp(opts.colsep)
  return line.replace(/^"|"$/g, '').split(sep)
}

// Export the placeholders object for help generation
exports.placeholders = placeholders