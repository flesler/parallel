parallel
=======

CLI tool to execute shell commands in parallel.

Loosely based on [GNU parallel command](https://www.gnu.org/software/parallel/man.html).

# Installation

Using [npm](https://www.npmjs.com/package/parallel):
```bash
$ npm install -g parallel
```

# Usage

```bash
# Pass input lines as command-line arguments
input | parallel [options] cmd [cmd-options] {} > output

# Pipe input lines through the jobs stdin
input | parallel [options] --pipe cmd [cmd-options] > output
```

# Options

```bash
-j, --jobs <n>          Max processes to run in parallel (0 for ∞) [default CPUs]
-n, --max-args <args>   Number of input lines per command line [default 1]
-d, --delimiter <delim> Input items are terminated by delim [default \n]
-0, --null              Use NUL as delimiter, alias for -d $'\\0'
-q, --quote             Quote each input line in case they contain special caracters
-t, --trim              Removes spaces, tabs and new lines around the input lines
-C, --colsep <regex>    Column separator for positional placeholders [default " "]
-a, --arg-file <file>   Use file as input source instead of stdin
-p, --pipe              Spread input lines to jobs via their stdin
-D, --dry-run           Print commands to run without running them
--bg                    Run commands in background and exit
--delay <secs>          Wait before starting new jobs, secs can be less than 1 [default 0]
--timeout <secs>        If the command runs longer than secs it gets killed with SIGTERM [default 0]
--halt-on-error         Kill all jobs and exit if any job exits with a code other than 0 [default false]
-v, --verbose           Output timing information to stderr
-s, --shell             Wrap command with shell (supports escaped pipes, redirection, etc.) [experimental]
--help                  Print this message and exit
--version               Print the comand version and exit
```

# Arguments placeholders

Unless `--pipe` is used, the input lines will be sent to jobs as command-line arguments. You can include placeholders and they will be replaced with each input line.
If no placeholder is found, input lines will be appended to the end as last arguments.
Everything around each placeholder will be repeated for each input line. Use quotes to include spaces or escape them with backslashes.

```
{}   input line
{.}  input line without extension
{/}  basename of the input line
{//} dirname of the input line
{/.} basename of the input line without extension
{n}  nth input column, followed by any operator above (f.e {2/.})
{#}  sequence number of the job to run [1, ∞]
{%}  job slot number [1, --jobs]
```

These are not in the original GNU parallel, but were implemented here:

```
{..} extension of the input line
{v} lower case the value
{^} upper case the value
{t} current time as a number
{T} current time in ISO as a string
{d} current date in ISO format
{r} random number between 100000 and 999999
{md5} MD5 hash of the input line
```

# Input from command-line arguments

Input can be provided as command-line arguments preceeded by a `:::`.
Each argument will be considered a separate input line.
If you include several `:::`, parallel will use all the permutations between them as input lines.
While GNU´s version also permutates stdin and input files, this version won't.
Check examples (6) and (7) to see this in action.

# Examples

```bash
# (1) Use all CPUs to grep a file
cat data.txt | parallel -p grep pattern > out.txt
```
```bash
# (2) Use all CPUs to gunzip and concat files to a single file, 10 per process at a time
find . -name '*.gz' | parallel -n10 gzip -dc {} > out.txt
```
```bash
# (3) Download files from a list, 10 at a time with all CPUs, use the URL basename as file name
cat urls.txt | parallel -j10 curl {} -o images/{/}
```
```bash
# (4) Generate 100 URLs and download them with `curl` (uses experimental --shell option)
seq 100 | parallel -s curl http://xyz.com/image_{}.png \> image_{}.png
```
```bash
# (5) Move each file to a subdir relative to their current dir
find . -type f | parallel mkdir -p {//}/sub && mv {} {//}/sub/{/}
```
```bash
# (6) Show how to provide input as command-line arguments and what the order is
echo 4 | parallel -j1 echo ::: 1 2 3
```
```bash
# (7) Rename extension from all txt to log
parallel mv {} {.}.log ::: *.txt
```
```bash
# (8) Showcase non-positional placeholders
find . -type f | parallel echo "file={} noext={.} base={/} base_noext={/.} dir={//} jobid={#} jobslot={%} ext={..} lower={v} upper={^} time={t} timeiso={T} date={d} random={r} md5={md5}"
```
```bash
# (9) Showcase positional placeholders
echo A~B.ext~C~D | parallel -C '~' echo {4}+{3}+{2.}+{1}
```

# Command-line options
Once a command-line parameter that is not an option is found, then the "command" starts.
parallel supports command-line options in all these formats (all equivalent):
- `--trim --jobs 2`
- `--trim --jobs=2`
- `-t -j 2`
- `-tj 2`
- `-tj2`

# Exit code
Just like [GNU parallel](https://www.gnu.org/software/parallel/man.html#EXIT-STATUS) does, the exit code will be the amount of jobs that failed (up to 101). It means that if any job fails, "global" exit code will be non-zero as well. You can add `--halt-on-error` to abort as soon as one job fails.

# Differences with [GNU parallel](https://www.gnu.org/software/parallel/man.html)
- Added aliases to some options: `-p` -> `--pipe`, `-D` -> `--dry-run`
- `--round-robin` is implicit when `--pipe` is used
- This module does support piped input and `:::` arguments together unlike GNU's
- This module won't permutate input from `:::` and from stdin or `--arg-file`
- GNU's `-m` can be achieved here with `--max-args=0` to distribute all input lines evenly among `--jobs`
- `--shell` was added to allow pipes, redirection, etc
- `--trim` doesn't support `<n|l|r|lr|rl>`, it trims all spaces, tabs and newlines from both sides
- `--halt-on-error` doesn't support any option, it exits as soon as one job fails
- A ton of missing options that I consider less useful
- `--plus` placeholders are not supported
- Many more

# ToDo
- Implement backpressure to pause input if output is overwhelmed
- Support `--header` for working with CSV-like files
- Should it permutate lines from stdin and `--arg-file` ?
- Could implement `--keep-order`
- Use [node-shell-quote](https://github.com/substack/node-shell-quote) for `--dry-run` and `--shell`?
- Clean up `jobs` module, maybe create a `job` module with some of its logic
- Maybe avoid pre-spawning jobs when piping. Spawn on demand when overwhelmed, support `--delay` there too
- Support multiple `-a`? can be achieved with `cat a b c` though, maybe it's pointless

# License

Copyright (c) 2016, Ariel Flesler
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the organization nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
