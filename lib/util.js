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
	process.exit(1);
};

exports.timer = function() {
	var start = Date.now();
	return function() {
		return ((Date.now() - start) / 1000).toFixed(2) + 's';
	};
};