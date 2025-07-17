const
  fs = require('fs'),
  util = require('./util'),
  help = require('./help'),
  input = require('./input'),
  opts = require('./opts')

const options = {
  'jobs': {
    alias: 'j',
    desc: 'Max processes to run in parallel (0 for ∞)',
    default: 'CPUs',
    fn: function (n) { opts.jobs = Math.max(parseInt(n, 10), 0) }
  },
  'max-args': {
    alias: 'n',
    desc: 'Number of input lines per command line',
    default: opts.maxArgs,
    fn: function (args) { opts.maxArgs = Math.max(parseInt(args, 10), 0) }
  },
  'xargs': {
    alias: 'X',
    desc: 'Multiple arguments with context replace',
    fn: function () { opts.maxArgs = 0 }
  },
  'delimiter': {
    alias: 'd',
    default: '\\n',
    desc: 'Input items are terminated by delim',
    fn: function (delim) { opts.delimiter = delim }
  },
  'null': {
    alias: '0',
    desc: 'Use NUL as delimiter',
    fn: function () { opts.delimiter = '\\0' }
  },
  'quote': {
    alias: 'q',
    desc: 'Quote each input line in case they contain special caracters',
    fn: function() { opts.quote = true; }
  },
  'quote-all': {
    desc: 'Quote each input line in case they contain special caracters (alias for --quote)',
    fn: function () { opts.quote = true }
  },
  'trim': {
    desc: 'Removes spaces, tabs and new lines around the input lines',
    fn: function() { opts.trim = true; }
  },
  'print-commands': {
    alias: 't',
    desc: 'Print the jobs which parallel is running to stderr',
    fn: function () { opts.printCommands = true }
  },
  'colsep': {
    alias: 'C',
    desc: 'Column separator for positional placeholders',
    default: '" "',
    fn: function (regex) { opts.colsep = regex }
  },
  'arg-file': {
    alias: 'a',
    desc: 'Use file as input source instead of stdin',
    fn: function (file) { opts.argFile = fs.createReadStream(file) }
  },
  'pipe': {
    alias: 'p',
    desc: 'Spread input lines to jobs via their stdin',
    fn: function () { opts.pipe = true }
  },
  'block': {
    desc: 'Size of each block in --pipe mode (e.g., 1M, 10K)',
    fn: function (size) {
      opts.block = parseSize(size)
      opts.pipe = true // --block automatically enables --pipe
    }
  },
  'dry-run': {
    alias: 'D',
    desc: 'Print commands to run without running them',
    fn: function () { opts.dryRun = true }
  },
  'tag': {
    desc: 'Prefix each line of output with the argument that generated it',
    fn: function () { opts.tag = true }
  },
  'shuf': {
    desc: 'Randomize the order of jobs',
    fn: function () { opts.shuf = true }
  },
  'keep-order': {
    alias: 'k',
    desc: 'Keep same order as input',
    fn: function () { opts.keepOrder = true }
  },
  'joblog': {
    desc: 'Log job details (start time, runtime, exit code, command) to file',
    fn: function (file) {
      opts.joblog = fs.createWriteStream(file)
      // Write header to explain the columns
      opts.joblog.write('Seq\tHost\tStarttime\tJobRuntime\tSend\tReceive\tExitval\tSignal\tCommand\n')
    }
  },
  'bg': {
    desc: 'Run commands in background and exit',
    fn: function () { opts.bg = true }
  },
  'delay': {
    desc: 'Wait before starting new jobs, secs can be less than 1',
    default: opts.delay,
    fn: function (secs) { opts.delay = parseFloat(secs) }
  },
  'timeout': {
    desc: 'If the command runs for longer than secs it will get killed with SIGTERM',
    default: opts.timeout,
    fn: function (secs) { opts.timeout = parseFloat(secs) }
  },
  'halt-on-error': {
    desc: 'Kill all jobs and exit if any job exits with a code other than 0',
    default: opts.haltOnError,
    fn: function() { opts.haltOnError = true; }
  },
  'verbose': {
    alias: 'v',
    desc: 'Print job commands and timing information to stderr',
    fn: function() { opts.verbose = true; }
  },
  'shell': {
    alias: 's',
    desc: 'Wrap command with shell (supports escaped pipes, redirection, etc.) [experimental]',
    fn: function() { opts.shell = true; }
  },
  'help': {
    desc: 'Print this message and exit',
    fn: function() { help.show(options); }
  },
  'version': {
    desc: 'Print the comand version and exit',
    fn: function() { help.version(); }
  }
}

const aliases = {}
for (let opt in options) {
  aliases[options[opt].alias] = opt
}

exports.options = options

exports.parse = function(args) {
  const originalArgsLength = args.length
  opts._ = args
  while (args.length) {
    let arg = args[0]
    // Rest belongs to the command
    if (arg[0] !== '-') break

    args.shift()
    // Long version --*
    if (arg[1] === '-') {
      if (~arg.indexOf('=')) {
        // Support --abc=123
        const p = arg.split('=')
        args.unshift(p[1])
        arg = p[0]
      }
      processArg(arg.slice(2), arg)
    // Short-hand -*
    } else {
      for (let i = 1, l = arg.length; i < l;) {
        const chr = arg[i++]
        const opt = aliases[chr]
        // Support -j2 as an alternative to -j 2
        if (options[opt] && options[opt].param && i < l) {
          args.unshift(arg.slice(i))
          i = l
        }
        processArg(opt, `-${chr}`)
      }
    }
  }

  // Check for invalid combinations
  validateOpts()

  // Parse optional input provided with :::
  parseInlineInput()

  // If no command and no input, show help
  checkForHelpNeeded()
}

function processArg(opt, orig) {
  const option = options[opt]
  if (!option) util.fatal(`Unknown option ${orig}`)
  if (option.fn.length > 0) {
    option.fn(opts._.shift())
  } else {
    option.fn()
  }
}

function parseSize(sizeStr) {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)(k|m|g)?$/i)
  if (!match) {
    util.fatal(`Invalid block size: ${sizeStr}`)
  }

  const num = parseFloat(match[1])
  const unit = (match[2] || '').toLowerCase()

  const multipliers = { k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 }
  return Math.floor(num * (multipliers[unit] || 1))
}

function validateOpts() {
  if (opts.pipe) {
    if (!opts.jobs) {
      util.fatal('--jobs=0 and --pipe cannot be used together')
    }
    if (opts.shuf) {
      util.fatal('--pipe is incompatible with --eta/--bar/--shuf')
    }
    if (opts._.some(arg => arg.includes('{##}'))) {
      util.fatal('--pipe is incompatible with {##}')
    }
  }
  if (!opts.jobs && !opts.maxArgs) {
    util.fatal('--jobs=0 and --max-args=0 cannot be used together')
  }
}

const INLINE_INPUT_SEP = ':::'
const FILE_INPUT_SEP = '::::'

function parseInlineInput() {
  const args = opts._, inputs = []

  // Handle :::: file inputs first
  while (true) {
    let index = args.lastIndexOf(FILE_INPUT_SEP)
    if (index === -1) break
    const files = args.splice(index)
    files.slice(1).forEach(function (file) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const lines = content.trim().split(/\r?\n/).filter(Boolean)
        inputs.unshift(lines)
      } catch (err) {
        util.fatal(`Cannot read file ${file}: ${err.message}`)
      }
    })
  }

  // Handle ::: inline inputs
  while (true) {
    let index = args.lastIndexOf(INLINE_INPUT_SEP)
    if (index === -1) break
    const cols = args.splice(index)
    inputs.unshift(cols.slice(1))
  }

  if (inputs.length) {
    input.setInlineInput(inputs)
  }
}

function checkForHelpNeeded() {
  // Only show help if no arguments were passed at all
  const noArgs = !opts._ || opts._.length === 0

  // Check if input is coming from stdin (TTY means interactive/no piped input)
  const hasInput = !process.stdin.isTTY

  // If no arguments and no piped input, show help and exit
  if (noArgs && !hasInput) {
    help.show()
  }
}
