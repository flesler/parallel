var os = require('os');

//- Defaults
exports.maxJobs = os.cpus().length;
exports.maxArgs = 1;
exports.lineSep = '\n';
exports.quote = false;
exports.trim = false;
exports.colSep = ' ';
exports.pipeMode = false;
exports.bgMode = false;
exports.delay = 0;
exports.timeout = 0;
exports.src = process.stdin;
exports.eol = '\n';/*os.EOL*/
exports.verbose = false;
exports.shell = false;
exports.haltOnError = false;
// Remaining arguments (the command)
exports._ = null;
