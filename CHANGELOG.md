# 1.0.6
- Fixed ps.writable wasn't being restored when stdin is drained, would hang all until all input has been loaded
- Added support for `--dry-run` option, resulting commands are printed to stdout within runnning. Incompatible with `--pipe`

# 1.0.5
- Implemented positional placeholders to split input line in columns
- Fixed {/.} would yield empty string when line had no dot after the last slash

# 1.0.4
- Added support for `--timeout <sec>` option, kill jobs with SIGTERM if they take too long

# 1.0.3
- Added support for `--delay <sec>` option, wait sec seconds before running a new job

# 1.0.2
- Added support for `--bg` option, jobs are run detached and main process can exit

# 1.0.1
- Reworded `replacement` as `placeholder` across the board, it's a more suitable name

# 1.0.0
- First release