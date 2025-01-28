var opts = require('./opts');
var crypto = require('crypto');

// See https://www.gnu.org/software/parallel/man.html#OPTIONS
const OPS = {
	// {} input line
	'': function(val) { return val; },
	// {.} input line without extension
	'.': function(val) { return val.replace(/\.[^.]*$/,''); },
	// {/} basename of the input line
	'/': function(val) { return val.split(/[\/\\]/).pop(); },
	// {//} dirname of the input line
	'//': function(val) { return val.split(/([\/\\])/).slice(0,-2).join(''); },
	// {/.} basename of the input line without extension
	'/.': function(val) { return OPS['.'](OPS['/'](val)); },
	// {#} sequence number of the job to run, [1, ]
	'#': function(_, jobId) { return jobId; },
	// {%} job slot number [1, --jobs]
  '%': function (_, jobId) { return opts.maxJobs ? ((jobId - 1) % opts.maxJobs) + 1 : jobId },

  // These are not from the original

  // {..} extension of the input line
  '..': function (val) { return val.split('.').pop() },
  // {v} lower case the value
  'v': function (val) { return val.toLowerCase() },
  // {^} upper case the value
  '^': function (val) { return val.toUpperCase() },
  // {t} current time as a number
  't': function () { return Date.now() },
  // {T} current time in ISO as a string
  'T': function () { return new Date().toISOString().replace(/\D+/g, '_').replace(/_$/, '') },
  // {d} current date in ISO format
  'd': function () { return new Date().toISOString().split('T')[0].replace(/\D+/g, '_') },
  // {r} random number between 100000 and 999999
  'r': function () { return 1e5 + Math.floor(Math.random() * 9e5) },
  // {md5} MD5 hash of the input line
  'md5': function (val) { return crypto.createHash('md5').update(val).digest('hex') },
};

// Matches any operator above, optionally preceeded by a number, enclosed in curly brackets
const REGEX = new RegExp('\\{(-?\\d+)?('+Object.keys(OPS).map(escape).join('|')+')}', 'g');

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
	return arg.replace(REGEX, function(_, num, op) {
		var val = extract(line, num);
		return OPS[op](val, jobId);
	});
}

function escape(op) {
  return op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extract(line, num) {
	num = parseInt(num, 10);
	if (!num) return line;
	var cols = split(line);
	if (num < 0) {
		num = cols.length + num;
	} else {
		// They are 1-based
		num--;
	}
	return cols[num] || '';
}

var sep;
function split(line) {
	sep = sep || new RegExp(opts.colSep);
	// TODO: Support quoted columns and that kind of thing
	return line.replace(/^"|"$/g, '').split(sep);
}