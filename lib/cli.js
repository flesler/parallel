var
	fs = require('fs'),
	pkg = require('../package.json'),
	util = require('./util'),
	help = require('./help'),
	opts = require('./opts');

var options = {
	'jobs': {
		alias: 'j',
		param: 'n',
		default: 'CPUs('+opts.jobs+')',
		desc: 'Number of processes to spawn',
		fn: function(value) { opts.jobs = parseInt(value, 10); }
	},
	'max-args': {
		alias: 'n',
		param: 'args',
		default: opts.maxArgs,
		desc: 'Number of input lines per command line',
		fn: function(value) { opts.maxArgs = parseInt(value, 10); }
	},
	'delimiter': {
		alias: 'd',
		param: 'delim',
		default: '\\n',
		desc: 'Input items are terminated by delim',
		fn: function(value) { opts.lineSep = new RegExp(value); }
	},
	'null': {
		alias: '0',
		desc: "Use NUL as delimiter, alias for -d $'\\0'",
		fn: function() { opts.lineSep = /\0/; }
	},
	'quote': {
		alias: 'q',
		desc: 'Quote each input line in case they contain special caracters',
		fn: function() { opts.quote = true; }
	},
	'arg-file': {
		alias: 'a',
		param: 'file',
		desc: 'Use file as input source instead of stdin',
		fn: function(value) { opts.src = fs.createReadStream(value); }
	},
	'pipe': {
		alias: 'p',
		desc: 'Spread input to jobs on stdin',
		fn: function() { opts.pipeMode = true; }
	},
	'verbose': {
		alias: 'v',
		desc: 'Output additional information to stderr',
		fn: function() { opts.verbose = true; }
	},
	'shell': {
		alias: 's',
		desc: 'Wrap command with shell (supports escaped pipes, redirection, etc)(experimental)',
		fn: function() { opts.shell = true; }
	},
	'help': {
		alias: 'h',
		desc: 'Print this message and exit',
		fn: function() { help.show(pkg, options); }
	},
	'version': {
		alias: 'V',
		desc: 'Print the comand version and exit',
		fn: function() { util.end(pkg.version); }
	}
	//-m,--xargs Multiple arguments. Insert as many arguments as the command line length permits. If multiple jobs are being run in parallel: distribute the arguments evenly among the jobs. 
	//--round,--round-robin Normally --pipe will give a single block to each instance of the command. With --round-robin all blocks will at random be written to commands already running
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
			processArg(arg.slice(2), arg);
		// Short-hand -*
		} else {
			for (var i = 1; i < arg.length; i++) {
				var opt = aliases[arg[i]];
				processArg(opt, '-'+arg[i]);
			}
		}
	}
};

function processArg(opt, orig) {
	var option = options[opt];
	if (!option) util.fatal('Unknown option '+orig);
	if (option.param) {
		option.fn(opts._.shift());
	} else {
		option.fn();
	}
}