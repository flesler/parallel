# 1.3.0
- Add various new useful placeholders, that are not in the GNU version

# 1.2.0
- Added support for `--halt-on-error` option, if any job exits with non-zero code. Parallel will exit immediately
- Parallel exit code now reflects the amount of failed jobs up to 101

# 1.1.1
- Fixed {%} was NaN when `--jobs=0`
- Changed the workaround to handle stdin not being piped in
- Improved some cryptic variable names

# 1.0.10
- Each argument after a `:::` is now a separate line
- Including several `:::` permutates the arguments instead of just concatenating them
- `--verbose` also logs complete command line contents for each job that starts

# 1.0.9
- Workaround from 1.0.8 didn't work once process is run as bin, implemented another solution based on a timeout

# 1.0.8
- `--jobs=0` is now supported for an unlimited amount of parallel jobs
- Invalid options combinations are now validated and explicitely reported
- Added support for input being passed on command-line arguments using the `:::` operator
- Worked around the long standing issue where process won't close when stdin is not provided
- Time measurement now uses `process.hrtime()` which is more accurate than `Date.now()`

# 1.0.7
- Command-line options now support `--key=value` format in addition to `--key value`
- Command-line options now support `-j2` format in addition to `-j 2`
- Added `-D` as alias for `--dry-run`. GNU's parallel doesn't have any and I think it's a useful option and deserves one.

# 1.0.6
- Fixed job.writable wasn't being restored when stdin is drained, would hang all until all input has been loaded
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
