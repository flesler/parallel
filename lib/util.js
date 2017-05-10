exports.error = function(/*...args*/) {
	var a = arguments;
	a[0] = 'parallel: ' + a[0];
	console.error.apply(console, a);
};

exports.fatal = function(err) {
	var msg = err.stack || err.message || err;
	if (msg.indexOf('EPIPE') === -1) {
		exports.error(msg);
	}
	process.exit(process.exitCode || 1);
};

exports.timer = function() {
	var start = process.hrtime();
	return function() {
		var elapsed = process.hrtime(start);
		return (elapsed[0] + elapsed[1] / 1e9).toFixed(2) + 's';
	};
};
