var
	util = require('./util'),
	opts = require('./opts'),
	jobs = require('./jobs');

const NEW_LINE = '\n';

exports.open = function() {
	// If new line, support with and without carriage return
	var sep = opts.lineSep === NEW_LINE ? /\r?\n/ : new RegExp(opts.lineSep);

	var src = opts.src, buf = '';
	src.setEncoding('utf8');
	src.on('error', util.fatal);
	src.on('data', function(chunk) {
		if (sep.test(chunk)) {
			var buffer = (buf+chunk).split(sep);
			buf = buffer.pop();
			buffer.forEach(jobs.processLine);
		} else {
			buf += chunk;
		}
	});
	src.once('end', function() {
		if (buf) {
			jobs.processLine(buf);
			buf = '';
		}
		jobs.close();
	});
	
	if (src === process.stdin) {
		handleNoInput();
	}
};

// Input provided through command-line with ::: is placed first
exports.setInlineInput = function(inputs) {
	var perms = generatePermutations(inputs);
	perms.push('');
	// TODO: How do these interact with stdin/-a input(s)
	opts.src.unshift(perms.join(opts.lineSep));
};

function generatePermutations(inputs) {
	var perms = [];
	var max = inputs.reduce(function(m, input) {
		return m * input.length; 
	}, 1);

	while (max--) {
		var rest = max;
		var cols = [];
		var i = inputs.length;
		while (i--) {
			var input = inputs[i];
			var l = input.length;
			cols.unshift(input[rest % l]);
			rest = Math.floor(rest / l);
		}
		perms.unshift(cols.join(opts.colSep));
	}
	return perms;
}

function handleNoInput() {
	/**
	 * NOTE: When nothing is piped, process.stdin.isTTY SHOULD be true
	 * When js is executed as a binary, for some reason, it is never true
	 * This is an alternative way to solve this using a timeout
	 */
	var src = opts.src;
	var id = setTimeout(function() {
		// Force it to end
		src.push(null);
	}, 200);
	src.once('readable', function() {
		clearTimeout(id);
	});
}