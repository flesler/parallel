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
exports.prependInline = function(cols) {
	// TODO: node-shell-quote should used instead of join(' ')
	// Prepend to actual input stream so process doesn't hang if stdin is empty
	opts.src.unshift(cols.join(' ') + opts.lineSep);
};

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