const pkg = require('../package.json')

const MIN_LENGTH = 23

exports.show = function(options) {
  console.log(exports.getText(options))
  process.exit()
}

exports.getText = function (options) {
  const lines = []

  function addLine(text) {
    if (text) {
      lines.push('  ' + text)
    } else {
      lines.push('')
    }
  }

  addLine(pkg.description)
  addLine()
  addLine('Usage:')
  addLine('  # Pass input lines as command-line arguments')
  addLine('  input | parallel [options] cmd [cmd-options] {} > output')
  addLine('  # Pipe input lines through the jobs stdin')
  addLine('  input | parallel [options] --pipe cmd [cmd-options] > output')
  addLine()
  addLine('Options:')
  
  for (let opt in options) {
    const option = options[opt]
    const cols = ['--' + opt]
    if (option.alias) cols.unshift('-'+option.alias+',')
    if (option.fn.length > 0) {
      // Extract parameter name from function signature
      const match = option.fn.toString().match(/function\s*\(\s*([^)]+)\s*\)/)
      const paramName = match && match[1] ? match[1].trim() : 'val'
      cols.push('<' + paramName + '>')
    }
    
    let str = cols.join(' ')
    // Align columns
    while (str.length < MIN_LENGTH) {
      str += ' '
    }
    
    let desc = option.desc
    if ('default' in option) {
      desc += ' [default '+option.default+']'
    }
    addLine('  ' + str + ' ' + desc)
  }
  addLine()
  addLine('Placeholders:')
  addLine('  {}   the input line')
  addLine('  {.}  the input line without extension')
  addLine('  {/}  the basename of the input line')
  addLine('  {//} the dirname of the input line')
  addLine('  {/.} the basename of the input line without extension')
  addLine('  {n}  nth input column, followed by any operator above (f.e {2/.})')
  addLine('  {#}  the sequence number of the job to run, [1,]')
  addLine('  {%}  the job slot number [1, --jobs]')
  addLine()
  addLine('Non-GNU placeholders:')
  addLine('  {..} the input line without two extensions (e.g., file.tar.gz → file)')
  addLine('  {...} the input line without three extensions (e.g., file.tar.gz.backup → file)')
  addLine('  {ext} the extension of the input line')
  addLine('  {/..} the basename without two extensions (e.g., path/file.tar.gz → file)')
  addLine('  {/...} the basename without three extensions (e.g., path/file.tar.gz.backup → file)')
  addLine('  {v} lower case the value')
  addLine('  {^} upper case the value')
  addLine('  {t} current time as a number')
  addLine('  {T} current time in ISO as a string')
  addLine('  {d} current date in ISO format')
  addLine('  {r} random number between 100000 and 999999')
  addLine('  {md5} MD5 hash of the input line')
  addLine('  {len} the length of the input line in characters')
  addLine('  {wc} the word count of the input line')
  addLine()
  addLine('Visit ' + pkg.homepage + '#examples to see examples')

  return lines.join('\n')
}

function line(text) {
  if (text) {
    console.log('  ' + text)
  } else {
    console.log()
  }
}

exports.version = function() {
  console.log(pkg.version)
  process.exit()
}