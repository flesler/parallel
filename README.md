parallel
=======

[![npm version](https://badge.fury.io/js/parallel.svg)](https://badge.fury.io/js/parallel)
[![npm downloads](https://img.shields.io/npm/dm/parallel.svg)](https://www.npmjs.com/package/parallel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Support](https://img.shields.io/badge/node-%3E%3D8.0.0-brightgreen.svg)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/flesler/parallel.svg)](https://github.com/flesler/parallel/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/flesler/parallel.svg)](https://github.com/flesler/parallel/issues)

CLI tool to execute shell commands in parallel.

Loosely based on [GNU parallel command](https://www.gnu.org/software/parallel/man.html).

# Installation

Using [npm](https://www.npmjs.com/package/parallel):
```bash
$ npm install -g parallel
```

# Usage

```bash
parallel [options] [command [arguments]] < list_of_arguments
parallel [options] [command [arguments]] (::: arguments)...
cat ... | parallel --pipe [options] [command [arguments]]
```

# Options

```bash
-j, --jobs <n>          Max processes to run in parallel (0 for ∞) [default CPUs]
-n, --max-args <args>   Number of input lines per command line [default 1]
-X, --xargs             Multiple arguments with context replace
-d, --delimiter <delim> Input items are terminated by delim [default \n]
-0, --null              Use NUL as delimiter
-q, --quote             Quote each input line in case they contain special caracters
--quote-all             Quote each input line in case they contain special caracters (alias for --quote)
--trim                  Removes spaces, tabs and new lines around the input lines
-t, --print-commands    Print the jobs which parallel is running to stderr
-C, --colsep <regex>    Column separator for positional placeholders [default " "]
-a, --arg-file <file>   Use file as input source instead of stdin
-p, --pipe              Spread input lines to jobs via their stdin
--block <size>          Size of each block in --pipe mode (e.g., 1M, 10K)
-D, --dry-run           Print commands to run without running them
--tag                   Prefix each line of output with the argument that generated it
--shuf                  Randomize the order of jobs
-k, --keep-order        Keep same order as input
--joblog <file>         Log job details (start time, runtime, exit code, command) to file
--bg                    Run commands in background and exit
--delay <secs>          Wait before starting new jobs, secs can be less than 1
--timeout <secs>        If the command runs for longer than secs it will get killed with SIGTERM
--halt-on-error         Kill all jobs and exit if any job exits with a code other than 0
-v, --verbose           Print job commands and timing information to stderr
-s, --shell             Wrap command with shell (supports escaped pipes, redirection, etc.) [experimental]
--help                  Print this message and exit
--version               Print the comand version and exit
```

# Placeholders

```bash
{}     the input line
{.}    the input line without extension
{/}    the basename of the input line
{//}   the dirname of the input line
{/.}   the basename of the input line without extension
{#}    the sequence number of the job to run, [1,]
{%}    the job slot number [1, --jobs]
{..}   the input line without two extensions (e.g., file.tar.gz → file)
{...}  the input line without three extensions (e.g., file.tar.gz.backup → file)
{/..}  the basename without two extensions (e.g., path/file.tar.gz → file)
{/...} the basename without three extensions (e.g., path/file.tar.gz.backup → file)
{+/}   the number of "/" in the input line
{+.}   the number of "." in the input line
{n}    nth input column, followed by any operator above (f.e {2/.})
```

# Non-GNU placeholders

```bash
{ext}  the extension of the input line
{trim} the input line with leading/trailing whitespace removed
{v}    lower case the value
{^}    upper case the value
{t}    current time as a number
{T}    current time in ISO as a string
{d}    current date in ISO format
{r}    random number between 100000 and 999999
{md5}  MD5 hash of the input line
{len}  the length of the input line in characters
{wc}   the word count of the input line
```

# Input from command-line arguments

Input can be provided as command-line arguments preceeded by a `:::`.
Each argument will be considered a separate input line.
If you include several `:::`, parallel will use all the permutations between them as input lines.

You can also read arguments from files using `::::` followed by filenames.
This allows you to combine multiple input sources.

While GNU´s version also permutates stdin and input files, this version won't.
You can also combine multiple input files with `::::` to create permutations.

Check examples (8), (10), (11), and (12) to see command-line input in action.

# Examples

```bash
# (1) Process large datasets with all CPUs
cat big_data.csv | parallel --pipe --block 1M process_chunk.py

# (2) Convert images with preserved order (slow jobs finish out of order)  
echo -e "slow.jpg\nfast.jpg\nmedium.jpg" | parallel -k -s "sleep {#}; echo Converting {} to {.}.webp"

# (3) Download files from a list  
cat urls.txt | parallel curl -L {} -o downloads/{/}

# (4) Run tests in parallel with verbose output  
find tests -name "*.test.js" | parallel -t npm test {}

# (5) Compress files efficiently using all CPUs
find . -name '*.log' | parallel gzip {}

# (6) Process data with multiple arguments per job
echo -e "file1\nfile2\nfile3\nfile4" | parallel -X echo "Processing batch:" {}

# (7) Generate thumbnails with progress tracking
find photos -name "*.jpg" | parallel --tag convert {} thumbs/{/}

# (8) Batch process with job tracking
parallel --joblog processing.log ffmpeg -i {} {.}.mp4 ::: *.avi

# (9) Modern file operations with advanced placeholders  
echo -e "archive.tar.gz\nbackup.tar.gz" | parallel echo "Original: {} | Name: {/..} | Length: {len} chars"

# (10) Database operations in parallel
parallel -j 4 "psql -c \"UPDATE table SET status='processed' WHERE id={}\"" ::: {1..1000}

# (11) Rename files using transformation placeholders
parallel mv {} backup_{d}_{/} ::: *.txt

# (12) Process with column data
echo -e "John,25,Engineer\nJane,30,Designer" | parallel -C ',' echo "Name: {1}, Age: {2}, Job: {3}"

# (13) Keep output order for report generation
seq 10 | parallel -k "echo 'Processing item {}'; sleep $((RANDOM % 3)); echo 'Result: {}'"

# (14) Read arguments from multiple files (creates permutations)
parallel echo "Processing {} from {}" :::: servers.txt :::: tasks.txt

# (15) Handle special characters safely  
find . -name "* *" | parallel -q mv {} "cleaned/{/}"
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
- Supports GNU parallel's `-X/--xargs` for multiple arguments
- `--shell` was added to allow pipes, redirection, etc
- `--trim` doesn't support `<n|l|r|lr|rl>`, it trims all spaces, tabs and newlines from both sides (note: `-t` aliases to `--print-commands`, not `--trim`)
- `--halt-on-error` doesn't support any option, it exits as soon as one job fails
- Supports many GNU parallel features: `--block`, `-t/--print-commands`, `--tag`, `--joblog`, `-k/--keep-order`, `--shuf`, `::::` file syntax
- Some GNU parallel options are still missing but major functionality is compatible
- `--plus` is not needed and it supports most of those placeholders
- This supports various placeholders that GNU's parallel doesn't (see above)

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
