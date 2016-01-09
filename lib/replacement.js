var opts = require('./opts');

// See https://www.gnu.org/software/parallel/man.html#OPTIONS
const OPS = {
	// {} input line
	'': function(line) { return line; },
	// {.} input line without extension
	'.': function(line) { return line.split('.').slice(0,-1).join('.'); },
	// {/} basename of the input line
	'/': function(line) { return line.split(/[\/\\]/).pop(); },
	// {//} dirname of the input line
	'//': function(line) { return line.split(/([\/\\])/).slice(0,-2).join(''); },
	// {/.} basename of the input line without extension
	'/.': function(line) { return OPS['.'](OPS['/'](line)); },
	// {#} sequence number of the job to run, [1, ]
	'#': function(_, jobId) { return jobId; },
	// {%} job slot number [1, --jobs]
	'%': function(_, jobId) { return ((jobId-1) % opts.jobs) + 1; }
};

const REGEX = new RegExp('\\{('+Object.keys(OPS).map(escape).join('|')+')}', 'g');

exports.parse = function(jobId, lines) {
	var any = false;
	var out = [];
	opts._.forEach(function(arg) {
		// No placeholder in this one
		if (!REGEX.test(arg)) {
			return out.push(arg);
		}
		any = true;
		lines.forEach(function(line) {
			out.push(replace(arg, line, jobId));
		});
	});
	// No placeholder, append input to end
	if (!any) out.push.apply(out, lines);
	return out;
};

function replace(arg, line, jobId) {
	return arg.replace(REGEX, function(_, op) {
		return OPS[op](line, jobId);
	});
}

function escape(op) {
	return op && '\\' + op.split('').join('\\');
}