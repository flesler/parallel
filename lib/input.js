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

	// When nothing is piped, stdin needs end() closed to be released
	if (src === process.stdin && process.stdin.isTTY) {
		src.end();
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
