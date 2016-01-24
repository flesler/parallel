var
	cp = require('child_process'),
	util = require('./util'),
	opts = require('./opts'),
	placeholders = require('./placeholders'),
	pss = [],
	buffer = [],
	closing = false,
	jobId = 0,
	timer = util.timer();

function spawn(args) {
	if (opts.shell) {
		// This is still experimental
		args = ['sh', '-c', args.join(' ')];
	}

	var ps = cp.spawn(args[0], args.slice(1), {
		stdio:['pipe', process.stdout, process.stderr],
		detached: opts.bgMode,
		timeout: opts.timeout * 1e3
	});
	ps.id = jobId;
	pss.push(ps);

	if (opts.verbose) {
		ps.timer = util.timer();
		// TODO: Kind of point-less when --pipe, maybe don't print in that case
		util.error('Job %d (%d) command: "%s"', ps.id, ps.pid, args.join(' '));
		ps.on('exit', function() {
			util.error('Job %d (%d) handled %d line(s) in %s', ps.id, ps.pid, ps.handled, ps.timer());
		});
	}
	return ps;
}

exports.spawnPiped = function() {
	// Spawn them in advance
	while (jobId++ < opts.maxJobs) {
		var ps = spawn(opts._);
		ps.handled = 0;
		ps.stdin.on('drain', function() {
			this.writable = true;
			flush();
		}.bind(ps));
	}
};

function flushPiped() {
	while (buffer.length) {
		for (var i = 0; i < opts.maxJobs; i++) {
			var ps = pss[i];
			// Skip job if not writable unless all input was received
			if (!closing && ps.writable === false) {
				continue;
			}
			ps.writable = ps.stdin.write(buffer.shift() + opts.eol);
			ps.handled++;
			// Round-Robin the input between the jobs
			pss.splice(i, 1);
			pss.push(ps);
			break;
		}
		// No job handled
		// TODO: pause input()
		if (i === opts.maxJobs) break;
	}
}

function flushWithArgs() {
	var max = opts.maxArgs;
	if (!max) {
		// Wait until all lines are buffered
		if (!closing) return;
		// Distribute lines evenly among expected # of jobs
		max = Math.ceil(buffer.length / opts.maxJobs);
	}
	var min = closing ? 1 : max;
	while (buffer.length >= min) {
		// TODO: pause input()
		if (opts.maxJobs && pss.length === opts.maxJobs) {
			return;
		}

		var lines = buffer.splice(0, max);
		// Send the jobId that would be assigned to this job
		var args = placeholders.parse(++jobId, lines);
		// Job doesn't really run
		if (opts.dryRun) {
			// It's not exactly the same as above, must be quoted
			// TODO: Still, there's a lot of repetition between this and jobId, refactor
			if (opts.shell) args = ['sh', '-c', '"'+args.join(' ')+'"'];
			console.log(args.join(' '));
			continue;
		}

		var ps = spawn(args);
		ps.handled = lines.length;
		ps.on('exit', function() {
			pss.splice(pss.indexOf(this), 1);
			// Wait `delay` seconds before starting a new job
			setTimeout(flush, opts.delay * 1e3);
		});
	}
}

function flush() {
	if (opts.pipeMode) {
		flushPiped();
	} else  {
		flushWithArgs();
	}
	if (closing && opts.bgMode && !buffer.length) {
		// If --bg, don't wait for jobs to exit
		// TODO: Is this working for all cases? alternative is ps.unref()
		process.nextTick(process.exit);
	}
}

exports.processLine = function(line) {
	if (opts.trim) line = line.trim();
	// Ignore empty lines
	if (!line) return;
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
			util.error('Elapsed time:', timer());
		});
	}
};