var
	cp = require('child_process'),
	util = require('./util'),
	opts = require('./opts'),
	pss = [],
	buffer = [],
	closing = false,
	timer = util.timer();

const PLACEHOLDER = /\{([.\/]*)}/g;

function spawn(args) {
	if (opts.shell) {
		args = ['sh', '-c', args.join(' ')];
	}
	var ps = cp.spawn(args[0], args.slice(1), {
		stdio:['pipe', process.stdout, process.stderr]
	});
	pss.push(ps);

	if (opts.verbose) {
		ps.timer = util.timer();
		ps.on('exit', function() {
			util.error('Job '+ ps.pid + ': Handled ' + ps.handled + ' line(s) in '+ps.timer());
		});
	}
	return ps;
}

exports.spawnPiped = function() {
	// Spawn them in advance
	for (var i = 0; i < opts.jobs; i++) {
		var ps = spawn(opts._);
		ps.handled = 0;
		ps.stdin.on('drain', function() {
			this.writable = true;
			flushPiped();
		});
	}
};

function flushPiped() {
	while (buffer.length) {
		for (var i = 0; i < opts.jobs; i++) {
			var ps = pss[i];
			// Skip job if not writable unless all input was received
			if (!closing && ps.writable === false) {
				continue;
			}
			ps.writable = ps.stdin.write(buffer.shift() + opts.eol);
			ps.handled++;
			// Round-Robin
			pss.splice(i, 1);
			pss.push(ps);
			break;
		}
		// No job handled
		// TODO: pause input()
		if (i === opts.jobs) break;
	}
}

function flushWithArgs() {
	var max = opts.maxArgs;
	if (!max) {
		// Wait until all lines are buffered
		if (!closing) return;
		// Distribute lines evenly among expected # of jobs
		max = Math.ceil(buffer.length / opts.jobs);
	}
	var min = closing ? 1 : max;
	while (buffer.length >= min) {
		// TODO: pause input()
		if (pss.length === opts.jobs) return;

		var
			lines = buffer.splice(0, max),
			args = [], repld = false;

		opts._.forEach(function(arg) {
			if (PLACEHOLDER.test(arg)) {
				repld = true;
				// Replace placeholder(s) on command arguments	
				lines.forEach(function(line) {
					args.push(arg.replace(PLACEHOLDER, line));
				});
			} else {
				// No replacement needed
				args.push(arg);
			}
		});
		// No placeholder, append input to end
		if (!repld) args.push.apply(args, lines);

		var ps = spawn(args);
		ps.handled = lines.length;
		ps.on('exit', function() {
			pss.splice(pss.indexOf(this), 1);
			flushWithArgs();
		});
	}
}

function flush() {
	if (opts.pipeMode) {
		flushPiped();
	} else  {
		flushWithArgs();
	}
}

exports.processLine = function(line) {
	if (opts.quote) line = '"'+line+'"';
	buffer.push(line);
	flush();
};

exports.close = function() {
	closing = true;
	flush();

	pss.forEach(function(ps) {
		ps.stdin.end();
	});

	if (opts.verbose) {
		process.on('exit', function() {
			util.error('Elapsed time: '+timer());
		});
	}
};