const pkg = require('../package.json')

const MIN_LENGTH = 23

exports.show = () => {
  console.log(exports.getText())
  process.exit()
}

exports.getText = () => {
  const lines = []

  function log(text) {
    lines.push(text || '')
  }

  log(`${pkg.name} ${pkg.version} - ${pkg.description}`)
  log()
  log('Usage:')
  log('  parallel [options] [command [arguments]] < list_of_arguments')
  log('  parallel [options] [command [arguments]] (::: arguments)...')
  log('  cat ... | parallel --pipe [options] [command [arguments]]')
  log()
  log('Options:')

  const options = require('./cli').options
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
    if (option.default) {
      desc += ` [default ${option.default}]`
    }
    log(`  ${str} ${desc}`)
  }
  log()

  // Auto-generate placeholders section
  const placeholders = require('./placeholders').placeholders
  const pad = maxLength()

  // GNU-compatible placeholders
  log('Placeholders:')
  Object.keys(placeholders).forEach(key => {
    const placeholder = placeholders[key]
    if (placeholder.gnu) {
      log(format(key, placeholder, pad))
    }
  })
  // Add the special {n} placeholder documentation
  log(format('n', { desc: 'nth input column, followed by any operator above (f.e {2/.})' }, pad))

  // Non-GNU placeholders
  log()
  log('Non-GNU placeholders:')
  Object.keys(placeholders).forEach(key => {
    const placeholder = placeholders[key]
    if (!placeholder.gnu) {
      log(format(key, placeholder, pad))
    }
  })
  log()
  log(`Visit ${pkg.homepage}#examples to see examples`)

  return lines.join('\n')
}

function format(key, placeholder, pad) {
  const name = key === '' ? '{}' : `{${key}}`
  const paddedName = `  ${name}`.padEnd(pad)
  return `${paddedName} ${placeholder.desc}`
}

function maxLength() {
  const placeholders = require('./placeholders').placeholders
  const lengths = Object.keys(placeholders).map(k => {
    const name = k === '' ? '{}' : `{${k}}`
    return name.length
  })
  return Math.max(...lengths) + 2
}

exports.version = () => {
  console.log(pkg.version)
  process.exit()
}