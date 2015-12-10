// TODO: Explain {} somehow
const MIN_LENGTH = 23;

exports.show = function(pkg, options) {
	console.log(' ', pkg.description);
	console.log('');
	console.log('  Usage:');
	console.log('    input | parallel [options] cmd [cmd-options] {} > output');
	console.log('    input | parallel [options] --pipe cmd [cmd-options] > output');
	console.log('');
	console.log('  Options:');
	
	for (var opt in options) {
		var option = options[opt];
		var cols = ['-'+option.alias+',', '--'+opt];
		if (option.param) cols.push('<'+option.param+'>');
		
		var str = cols.join(' ');
		while (str.length < MIN_LENGTH) {
			str += ' ';
		}
		
		var desc = option.desc;
		if ('default' in option) {
			desc += ' [default '+option.default+']';
		}
		console.log('   ', str, desc);
	}
	console.log('');
	console.log('  Examples:');
	console.log('    cat data | parallel -pj 3 grep pattern > out');
	console.log('    find . -name "*.gz" -print0 | parallel -0n 10 gzip -dc {} > out');
	console.log('    echo {000..100} | parallel -vn 0 -d " " echo file{}.png');
	console.log('    seq 20 | parallel.js -svj 2 -n 2 sleep 1 \\; echo -{}-');
	process.exit();
};