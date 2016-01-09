var
	util = require('./util'),
	opts = require('./opts'),
	jobs = require('./jobs');

const NEW_LINE = '\n';

exports.available = function() {
	// FIXME: isTTY always undefined when executed without `node `
	//return opts.src !== process.stdin || !opts.src.isTTY;
	return true;
};

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
	src.on('end', function() {
		if (buf) jobs.processLine(buf);
		src.removeAllListeners();
		jobs.close();
	});
};