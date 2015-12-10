var
	util = require('./util'),
	opts = require('./opts'),
	jobs = require('./jobs');

exports.open = function(src) {
	src.on('error', util.fatal);
	src.setEncoding('utf8');
	var buf = '';
	src.on('data', function(chunk) {
		if (opts.lineSep.test(chunk)) {
			var buffer = (buf+chunk).split(opts.lineSep);
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