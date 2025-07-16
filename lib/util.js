exports.error = (...args) => {
  args[0] = `parallel: ${args[0]}`
  console.error.apply(console, args)
}

exports.fatal = (err) => {
  const msg = err.stack || err.message || err
  if (msg.indexOf('EPIPE') === -1) {
    exports.error(msg)
  }
  process.exit(process.exitCode || 1)
}

exports.timer = () => {
  const start = process.hrtime()
  return () => {
    const elapsed = process.hrtime(start)
    return `${(elapsed[0] + elapsed[1] / 1e9).toFixed(2)}s`
  }
}

exports.escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}