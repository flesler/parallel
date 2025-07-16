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

## Basic Parallel Processing

```bash
# (1) Download multiple files simultaneously
echo -e "https://example.com/file1.zip\nhttps://example.com/file2.zip\nhttps://example.com/file3.zip" | \
  parallel curl -L {} -o downloads/{/}
# Output: Downloads file1.zip, file2.zip, file3.zip to downloads/ folder

# (2) Convert video files using all CPU cores
parallel ffmpeg -i {} -c:v libx264 converted/{.}.mp4 ::: *.avi
# Input: movie1.avi, movie2.avi → Output: converted/movie1.mp4, converted/movie2.mp4

# (3) Compress log files efficiently 
find /var/log -name "*.log" -size +100M | parallel gzip {}
# Compresses large log files in parallel, saving disk space
```

## Placeholders & File Processing

```bash
# (4) Showcase path manipulation placeholders
echo -e "/home/user/document.pdf\n/tmp/archive.tar.gz\n/data/backup.tar.gz.enc" | \
  parallel echo "Full: {} | Dir: {//} | File: {/} | Name: {/.} | Ext: {ext}"
# Output demonstrates all path components for each file

# (5) Multi-extension handling (GNU --plus compatibility)
echo -e "project.tar.gz\nbackup.tar.gz.old" | \
  parallel echo "File: {} | Remove 1 ext: {.} | Remove 2 ext: {..} | Remove 3 ext: {...}"
# Shows: project.tar.gz → project.tar → project → project

# (6) Count path separators and extensions
echo -e "/deep/nested/path/file.min.js\nshallow.txt" | \
  parallel echo "File: {} | Slashes: {+/} | Dots: {+.} | Length: {len} chars"
# Demonstrates counting placeholders with real examples
```

## Column Processing & Data Manipulation

```bash
# (7) Process CSV data with column placeholders
echo -e "John,28,Engineer,San Francisco\nSarah,32,Designer,New York\nMike,25,Developer,Seattle" | \
  parallel -C ',' echo "Employee: {1} ({2} years old) works as {3} in {4}"
# Output: Employee: John (28 years old) works as Engineer in San Francisco

# (8) Handle messy input with trimming
printf "  Alice  \n\t  Bob\t\n   Charlie   \n" | \
  parallel echo "Original: '{}' ({len} chars) | Cleaned: '{trim}'"
# Shows whitespace removal: '  Alice  ' (8 chars) | Cleaned: 'Alice'

# (9) Text transformations
echo -e "Hello World\nFOO BAR\nmixed CaSe" | \
  parallel echo "Original: {} | Lower: {v} | Upper: {^} | Words: {wc}"
# Demonstrates case conversion and word counting
```

## Job Management & Control

```bash
# (10) Keep output order for reports (jobs finish at different times)
seq 5 | parallel -k "echo 'Starting job {}'; sleep $((6 - {})); echo 'Job {} completed'"
# Output appears in order 1,2,3,4,5 despite job 5 finishing first

# (11) Process with limited concurrency and job tracking
parallel -j 2 --joblog build.log "echo 'Building {}'; sleep 2; echo 'Built {}'" ::: app1 app2 app3 app4
# Limits to 2 concurrent jobs, logs timing and exit codes to build.log

# (12) Tag output to identify source
echo -e "server1\nserver2\nserver3" | parallel --tag "ping -c 1 {} | grep 'time='"
# Each output line prefixed with server name for identification
```

## Advanced Features

```bash
# (13) Process large files in chunks (pipe mode)
cat huge_dataset.csv | parallel --pipe --block 10M "wc -l | xargs echo 'Chunk has {} lines'"
# Splits large file into 10MB chunks, processes each in parallel

# (14) Multiple argument processing with context
echo -e "file1.txt\nfile2.txt\nfile3.txt\nfile4.txt" | parallel -X echo "Batch processing:" {}
# Groups multiple files per command: "Batch processing: file1.txt file2.txt ..."

# (15) Randomize job order and dry-run
seq 10 | parallel --shuf --dry-run "echo 'Processing item {}'"
# Shows commands in random order without executing (useful for testing)

# (16) File permutations from multiple sources
echo -e "backup\narchive" > operations.txt
echo -e "database.sql\nconfig.json" > files.txt
parallel echo "Operation: {} on file: {}" :::: operations.txt :::: files.txt
# Creates all combinations: backup+database.sql, backup+config.json, etc.

# (17) Safe handling of files with special characters
find . -name "*[[:space:]]*" | parallel -q mv {} "cleaned_files/{/}"
# Safely renames files containing spaces or special characters

# (18) Time-based operations with built-in placeholders
parallel "echo 'Job {} started at {T} (timestamp: {t}) with random ID: {r}'" ::: task1 task2
# Uses current time, timestamp, and random number placeholders
```

## Database & Network Operations

```bash
# (19) Parallel database updates with progress
seq 1000 | parallel -j 10 "psql -c \"UPDATE users SET last_seen='{T}' WHERE id={}\""
# Updates 1000 user records with current timestamp, 10 concurrent connections

# (20) Network testing with detailed output
echo -e "google.com\ngithub.com\nstackoverflow.com" | \
  parallel --tag "curl -w 'Response time: %{time_total}s\n' -o /dev/null -s {}"
# Tests response times for multiple sites with tagged output
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
