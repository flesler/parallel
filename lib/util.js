exports.end = function(msg) {
	console.log(msg);
	process.exit();
};

exports.error = function(msg) {
	console.error('parallel:', msg);
};

exports.fatal = function(err) {
	var msg = /*err.stack || */err.message || err;
	if (msg.indexOf('EPIPE') === -1) {
		exports.error('parallel:', msg);
	}
	process.exit(1);
};

exports.timer = function() {
	var start = Date.now();
	return function() {
		return ((Date.now() - start) / 1000).toFixed(2) + 's';
	};
};