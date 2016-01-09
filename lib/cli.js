var
	fs = require('fs'),
	util = require('./util'),
	help = require('./help'),
	input = require('./input'),
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
		default: '\\n',// opts.lineSep,
		desc: 'Input items are terminated by delim',
		fn: function(value) { opts.lineSep = value; }
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
		default: opts.trim,
		desc: 'Trims the input of leading and trailing spaces and tabs',
		fn: function() { opts.trim = true; }
	},
	'arg-file': {
		alias: 'a',
		param: 'file',
		desc: 'Use file as input source instead of stdin',
		fn: function(value) { opts.src = fs.createReadStream(value); }
	},
	'pipe': {
		alias: 'p',
		desc: 'Spread input lines to jobs via their stdin',
		fn: function() { opts.pipeMode = true; }
	},
	'verbose': {
		alias: 'v',
		desc: 'Output additional information to stderr',
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
			processArg(arg.slice(2), arg);
		// Short-hand -*
		} else {
			for (var i = 1; i < arg.length; i++) {
				var opt = aliases[arg[i]];
				processArg(opt, '-'+arg[i]);
			}
		}
	}
	// Nothing piped in, show help
	if (!input.available()) {
		help.show(options);
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