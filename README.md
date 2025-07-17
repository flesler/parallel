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
{##}   total number of jobs to be run
{..}   the input line without two extensions (e.g., file.tar.gz → file)
{...}  the input line without up to three extensions (e.g., file.tar.gz.backup → file)
{/..}  the basename without two extensions (e.g., path/file.tar.gz → file)
{/...} the basename without three extensions (e.g., path/file.tar.gz.backup → file)
{+/}   the number of "/" in the input line
{+.}   the number of "." in the input line
{+..}  the extensions removed by {..} (e.g., file.tar.gz → .tar.gz)
{+...} the extensions removed by {...} (e.g., file.tar.gz.bak → .tar.gz.bak)
{n}    nth input column, followed by any operator above (f.e {2/.})
```

# Non-GNU placeholders

```bash
{ext}  the extension of the input line
{trim} the input line with leading/trailing whitespace removed
{v}    lower case the value
{^}    upper case the value
{t}    current date-time as a number
{T}    current date-time in ISO format
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

## Basic Operations

(1) Download files simultaneously 
```bash
cat urls.txt | parallel curl -L {} -o downloads/{/}
```

(2) Convert video files using all CPU cores
```bash
parallel ffmpeg -i {} -c:v libx264 converted/{.}.mp4 ::: *.avi
```

(3) Compress large log files efficiently
```bash
find /var/log -name "*.log" -size +100M | parallel gzip {}
```

## Placeholders & File Processing

(4) Demonstrate path manipulation placeholders
```bash
echo -e "/home/user/document.pdf\n/tmp/archive.tar.gz" | \
  parallel echo "Full: {} | Dir: {//} | File: {/} | Name: {/.} | Ext: {ext}"
```

(5) Multi-extension removal (GNU --plus compatibility)
```bash
echo -e "project.tar.gz\nfile.min.js.map" | \
  parallel echo "File: {} | Remove 1: {.} | Remove 2: {..} | Remove 3: {...}"
```

(6) Count characters in paths and filenames
```bash
echo -e "/deep/nested/path/file.min.js\nshallow.txt" | \
  parallel echo "File: {} | Slashes: {+/} | Dots: {+.} | Length: {len}"
```

## Column Processing & Data Manipulation

(7) Process CSV data with column placeholders
```bash
echo -e "John,28,Engineer\nSarah,32,Designer" | \
  parallel -C ',' echo "Employee: {1} ({2} years old) works as {3}"
```

(8) Clean whitespace from messy input
```bash
printf "  Alice  \n\t  Bob\t\n" | parallel echo "Original: '{}' | Cleaned: '{trim}'"
# Or
printf "  Alice  \n\t  Bob\t\n" | parallel --trim echo Cleaned: {}
```

(9) Transform text case and count words
```bash
echo -e "Hello World\nFOO BAR" | parallel echo "Text: {} | Lower: {v} | Upper: {^} | Words: {wc}"
```

## Job Management & Control

(10) Preserve output order despite varying job times
```bash
seq 5 | parallel --keep-order --shell "sleep \$((6 - {})); echo 'Job {} done'"
```

(11) Limit concurrency and log job details
```bash
parallel -j 2 --joblog build.log echo 'Built {}' ::: app1 app2 app3
```

(12) Tag output lines with their input source
```bash
echo -e "google.com\namazon.com" | parallel --tag ping -c 1 {}
```

## Advanced Features

(13) Process large files in manageable chunks
```bash
cat huge_dataset.csv | parallel --pipe --block 10M wc -c
```

(14) Group multiple arguments per command  
```bash
echo -e "file1\nfile2\nfile3\nfile4" | parallel -X -j 1 echo "Processing batch:"
```

(15) Randomize execution order for testing
```bash
seq 10 | parallel --shuf --dry-run echo 'Processing {}'
```

(16) Generate combinations using structured input
```bash
echo -e "backup:database\narchive:config\nclone:source" | \
  parallel -C ':' echo "Operation {1} on {2}"
```

(17) Use built-in time and random placeholders
```bash
parallel echo 'Job {} at {T} (ID: {r})' ::: task1 task2
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

## ✅ **GNU Parallel Compatible Features**
- Full placeholder compatibility: `{..}`, `{...}`, `{/..}`, `{/...}`, `{+/}`, `{+.}`, etc.
- Standard options: `-t/--print-commands`, `--tag`, `--joblog`, `-k/--keep-order`, `--shuf`, `--block`
- File input: `::::` file syntax and `-a/--arg-file`
- Job control: `-X/--xargs`, `--halt-on-error`, `-p/--pipe`, `-D/--dry-run`

## 🔧 **Enhanced Features** 
- **Better defaults**: Default jobs = CPU count (not unlimited)
- **Input flexibility**: Supports piped input + `:::` arguments together (GNU doesn't)
- **Additional placeholders**: `{ext}`, `{v}`, `{^}`, `{t}`, `{T}`, `{d}`, `{r}`, `{md5}`, `{len}`, `{wc}`, `{trim}`
- **Simplified usage**: `--plus` not needed (features auto-enabled)

## ⚠️ **Simplified Behaviors**
- `--round-robin` is implicit when `--pipe` is used
- `--trim` only does full trim (no `<n|l|r|lr|rl>` options)
- `--halt-on-error` is binary (no complex exit condition options)
- No input permutation between `:::` and stdin/`--arg-file`

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
