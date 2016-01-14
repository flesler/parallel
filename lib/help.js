var	pkg = require('../package.json');

const MIN_LENGTH = 23;

exports.show = function(options) {
	line(pkg.description);
	line();
	line('Usage:');
	line('  # Pass input lines as command-line arguments');
	line('  input | parallel [options] cmd [cmd-options] {} > output');
	line('  # Pipe input lines through the jobs stdin');
	line('  input | parallel [options] --pipe cmd [cmd-options] > output');
	line();
	line('Options:');
	
	for (var opt in options) {
		var option = options[opt];
		var cols = ['--'+opt];
		if (option.alias) cols.unshift('-'+option.alias+',');
		if (option.param) cols.push('<'+option.param+'>');
		
		var str = cols.join(' ');
		// Align columns
		while (str.length < MIN_LENGTH) {
			str += ' ';
		}
		
		var desc = option.desc;
		if ('default' in option) {
			desc += ' [default '+option.default+']';
		}
		line('  ' + str + ' ' + desc);
	}
	line();
	line('Placeholders:');
	line('  {}   the input line');
	line('  {.}  the input line without extension');
	line('  {/}  the basename of the input line');
	line('  {//} the dirname of the input line');
	line('  {/.} the basename of the input line without extension');
	line('  {n}  nth input column, followed by any operator above (f.e {2/.})');
	line('  {#}  the sequence number of the job to run, [1,]');
	line('  {%}  the job slot number [1, --jobs]');
	line();
	line('Visit '+pkg.homepage+'#examples to see examples');

	process.exit();
};

function line(text/*?*/) {
	if (text) {
		console.log('  ' + text);
	} else {
		console.log();
	}
}

exports.version = function() {
	console.log(pkg.version);
	process.exit();
};