const pkg = require('../package.json')

const MIN_LENGTH = 23

exports.show = function(options) {
  console.log(exports.getText(options))
  process.exit()
}

exports.getText = function (options) {
  const lines = []

  function line(text) {
    lines.push(text || '')
  }

  line(`${pkg.name} ${pkg.version} - ${pkg.description}`)
  line()
  line('Usage:')
  line('  parallel [options] [command [arguments]] < list_of_arguments')
  line('  parallel [options] [command [arguments]] (::: arguments)...')
  line('  cat ... | parallel --pipe [options] [command [arguments]]')
  line()
  line('Options:')
  
  for (let opt in options) {
    const option = options[opt]
    const cols = [`--${opt}`]
    if (option.alias) cols.unshift(`-${option.alias},`)
    if (option.fn.length > 0) {
      // Extract parameter name from function signature
      const match = option.fn.toString().match(/function\s*\(\s*([^)]+)\s*\)/)
      const paramName = match && match[1] ? match[1].trim() : 'val'
      cols.push(`<${paramName}>`)
    }
    
    let str = cols.join(' ')
    // Align columns
    while (str.length < MIN_LENGTH) {
      str += ' '
    }
    
    let desc = option.desc
    let def = option.default
    if (def) {
      if (opt === 'jobs') {
        def = 'CPUs'
      }
      desc += ` [default ${def}]`
    }
    line(`  ${str} ${desc}`)
  }
  line()
  line('Placeholders:')
  line('  {}   the input line')
  line('  {.}  the input line without extension')
  line('  {/}  the basename of the input line')
  line('  {//} the dirname of the input line')
  line('  {/.} the basename of the input line without extension')
  line('  {n}  nth input column, followed by any operator above (f.e {2/.})')
  line('  {#}  the sequence number of the job to run, [1,]')
  line('  {%}  the job slot number [1, --jobs]')
  line('  {..} the input line without two extensions (e.g., file.tar.gz → file)')
  line('  {...} the input line without three extensions (e.g., file.tar.gz.backup → file)')
  line('  {/..} the basename without two extensions (e.g., path/file.tar.gz → file)')
  line('  {/...} the basename without three extensions (e.g., path/file.tar.gz.backup → file)')
  line()
  line('Non-GNU placeholders:')
  line('  {ext} the extension of the input line')
  line('  {v} lower case the value')
  line('  {^} upper case the value')
  line('  {t} current time as a number')
  line('  {T} current time in ISO as a string')
  line('  {d} current date in ISO format')
  line('  {r} random number between 100000 and 999999')
  line('  {md5} MD5 hash of the input line')
  line('  {len} the length of the input line in characters')
  line('  {wc} the word count of the input line')
  line()
  line(`Visit ${pkg.homepage}#examples to see examples`)

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