var
  fs = require('fs'),
  util = require('./util'),
  help = require('./help'),
  input = require('./input'),
  opts = require('./opts');

var options = {
  'jobs': {
    alias: 'j',
    desc: 'Max processes to run in parallel (0 for ∞)',
    default: opts.maxJobs,
    fn: function (n) { opts.maxJobs = Math.max(parseInt(n, 10), 0) }
  },
  'max-args': {
    alias: 'n',
    desc: 'Number of input lines per command line',
    default: opts.maxArgs,
    fn: function (args) { opts.maxArgs = Math.max(parseInt(args, 10), 0) }
  },
  'delimiter': {
    alias: 'd',
    default: '\\n',// opts.lineSep,
    desc: 'Input items are terminated by delim',
    fn: function (delim) { opts.lineSep = delim }
  },
  'null': {
    alias: '0',
    desc: 'Use NUL as delimiter, alias for -d $\'\\\\0\'',
    fn: function() { opts.lineSep = '\\0'; }
  },
  'quote': {
    alias: 'q',
    desc: 'Quote each input line in case they contain special caracters',
    fn: function() { opts.quote = true; }
  },
  'trim': {
    alias: 't',
    desc: 'Removes spaces, tabs and new lines around the input lines',
    fn: function() { opts.trim = true; }
  },
  'colsep': {
    alias: 'C',
    desc: 'Column separator for positional placeholders',
    default: '" "',
    fn: function (regex) { opts.colSep = regex }
  },
  'arg-file': {
    alias: 'a',
    desc: 'Use file as input source instead of stdin',
    fn: function (file) { opts.src = fs.createReadStream(file) }
  },
  'pipe': {
    alias: 'p',
    desc: 'Spread input lines to jobs via their stdin',
    fn: function() { opts.pipeMode = true; }
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
    fn: function() { opts.bgMode = true; }
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
    desc: 'Output timing information to stderr',
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
};

var aliases = {};
for (var opt in options) {
  aliases[options[opt].alias] = opt;
}

exports.parse = function(args) {
  opts._ = args;
  while (args.length) {
    var arg = args[0];
    // Rest belongs to the command
    if (arg[0] !== '-') break;

    args.shift();
    // Long version --*
    if (arg[1] === '-') {
      if (~arg.indexOf('=')) {
        // Support --abc=123
        var p = arg.split('=');
        args.unshift(p[1]);
        arg = p[0];
      }
      processArg(arg.slice(2), arg);
    // Short-hand -*
    } else {
      for (var i = 1, l = arg.length; i < l;) {
        var chr = arg[i++];
        var opt = aliases[chr];
        // Support -j2 as an alternative to -j 2
        if (options[opt] && options[opt].param && i < l) {
          args.unshift(arg.slice(i));
          i = l;
        }
        processArg(opt, '-'+chr);
      }
    }
  }

  // Check for invalid combinations
  validateOpts();

  // Parse optional input provided with :::
  parseInlineInput();
};

function processArg(opt, orig) {
  var option = options[opt];
  if (!option) util.fatal('Unknown option '+orig);
  if (option.fn.length > 0) {
    option.fn(opts._.shift());
  } else {
    option.fn();
  }
}

function validateOpts() {
  if (!opts.maxJobs && opts.pipeMode) {
    util.fatal('--jobs=0 and --pipe cannot be used together');
  }
  if (!opts.maxJobs && !opts.maxArgs) {
    util.fatal('--jobs=0 and --max-args=0 cannot be used together');
  }
  if (opts.dryRun && opts.pipeMode) {
    util.fatal('--dry-run and --pipe are pointless together');
  }
}

const INLINE_INPUT_SEP = ':::';

function parseInlineInput() {
  // TODO: If several ::: GNU yields the combination of all
  var args = opts._, inputs = [];
  while (true) {
    var index = args.lastIndexOf(INLINE_INPUT_SEP);
    if (index === -1) break;
    var cols = args.splice(index);
    inputs.unshift(cols.slice(1));
  }

  if (inputs.length) {
    input.setInlineInput(inputs);
  }
}
