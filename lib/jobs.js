var
	cp = require('child_process'),
	util = require('./util'),
	opts = require('./opts'),
	placeholders = require('./placeholders'),
	procs = [],
	buffer = [],
	closing = false,
	jobId = 0,
	timer = util.timer();

function spawn(args) {
	if (opts.shell) {
		// This is still experimental
		args = ['sh', '-c', args.join(' ')];
	}

	var proc = cp.spawn(args[0], args.slice(1), {
		stdio:['pipe', process.stdout, process.stderr],
		detached: opts.bgMode,
		timeout: opts.timeout * 1e3
	});
	proc.id = jobId;
	procs.push(proc);

	if (opts.verbose) {
		proc.timer = util.timer();
		// TODO: Kind of point-less when --pipe, maybe don't print in that case
		util.error('Job %d (%d) command: "%s"', proc.id, proc.pid, args.join(' '));
		proc.on('exit', function(code) {
			util.error('Job %d (%d) handled %d line(s) in %s and exited with code %d', proc.id, proc.pid, proc.handled, timer(), code);
		});
	}
	proc.on('close', function(code) {
		if (!code) return;
		// Exit code will include the amount of failed jobs (up to 101) like GNU version does
		process.exitCode = Math.min(100, process.exitCode || 0) + 1;
		if (opts.haltOnError) {
			process.exit();
		}
	});
	return proc;
}

exports.spawnPiped = function() {
	// Spawn them in advance
	while (jobId++ < opts.maxJobs) {
		var proc = spawn(opts._);
		proc.handled = 0;
		proc.stdin.on('drain', function() {
			this.writable = true;
			flush();
		}.bind(proc));
	}
};

function flushPiped() {
	while (buffer.length) {
		for (var i = 0; i < opts.maxJobs; i++) {
			var proc = procs[i];
			// Skip job if not writable unless all input was received
			if (!closing && proc.writable === false) {
				continue;
			}
			proc.writable = proc.stdin.write(buffer.shift() + opts.eol);
			proc.handled++;
			// Round-Robin the input between the jobs
			procs.splice(i, 1);
			procs.push(proc);
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
		if (opts.maxJobs && procs.length === opts.maxJobs) {
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

		var proc = spawn(args);
		proc.handled = lines.length;
		proc.on('exit', function() {
			procs.splice(procs.indexOf(this), 1);
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
		// TODO: Is this working for all cases? alternative is proc.unref()
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

	procs.forEach(function(proc) {
		proc.stdin.end();
	});

	if (opts.verbose) {
		process.on('exit', function() {
			util.error('Elapsed time:', timer());
		});
	}
};
