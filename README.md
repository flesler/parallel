parallel
=======

Execute shell command lines from standard input in parallel.

Loosely based on [GNU parallel command](https://www.gnu.org/software/parallel/man.html).

# Installation

Using npm:
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
-j, --jobs <n>          Number of processes to spawn [default CPUs]
-n, --max-args <args>   Number of input lines per command line [default 1]
-d, --delimiter <delim> Input items are terminated by delim [default \n]
-0, --null              Use NUL as delimiter, alias for -d $'\\0'
-q, --quote             Quote each input line in case they contain special caracters
-t, --trim              Trims the input of leading and trailing spaces and tabs [default false]
-a, --arg-file <file>   Use file as input source instead of stdin
-p, --pipe              Spread input lines to jobs via their stdin
-v, --verbose           Output additional information to stderr
-s, --shell             Wrap command with shell (supports escaped pipes, redirection, etc.) [experimental]
--help              Print this message and exit
--version           Print the comand version and exit
```

# Arguments placeholders

Unless `--pipe` is used, the input lines will be sent to jobs as command-line arguments. You can include placeholders and they will be replaced with each input line.
If no placeholder is found, input lines will be appended to the end as last arguments.
Everything around each placeholder will be repeated for each line. Use quotes to include spaces.

```
{}   the input line
{.}  the input line without extension
{/}  the basename of the input line
{//} the dirname of the input line
{/.} the basename of the input line without extension
{#}  the sequence number of the job to run, [1, ]
{%}  the job slot number [1, --jobs]
```

# Examples

```bash
# Use all CPUs to grep a file
cat data.txt | parallel -p grep pattern > out.txt
```
```bash
# Use all CPUs to gunzip and concat files to a single file, 10 per process at a time
find . -name "*.gz" -print0 | parallel -0n 10 gzip -dc {} > out.txt
```
```bash
# Generate 100 URLs and download them with `curl` (uses experimental --shell option)
echo {001..100} | parallel -tsd " " curl http://xyz.com/image_{}.png \> image_{}.png
```
```bash
# Rename extension from all txt to log
find . -name '*.txt' | parallel mv {} {.}.log
```
```bash
# Move each file to a subdir relative to their current dir
find . -type f | parallel mkdir -p {//}/sub && mv {} {//}/sub/{/}
```
```bash
# Showcase all placeholders
find . -type f | parallel echo "file={} noext={.} base={/} base_noext={/.} dir={//} jobid={#} jobslot={%}"
```

# Differences with [GNU parallel](https://www.gnu.org/software/parallel/man.html)
- `-p` added as an alias of `--pipe`
- `--round-robin` is implicit when `--pipe` is used
- `--max-args 0` here means distribute all input lines evenly among `--jobs`
- `--shell` was added to allow pipes, redirection, etc
- `--trim` doesn't support `<n|l|r|lr|rl>`, it trims all spaces, tabs and newlines from both sides
- A ton of missing options that I consider less useful
- Some placeholders aren't supported
- Many more

# ToDo
- Support more options from [GNU parallel](https://www.gnu.org/software/parallel/man.html)
- Support more [placeholders](https://www.gnu.org/software/parallel/man.html#OPTIONS)
- Maybe support `:::`
- Implement backpressure to pause input if output is overwhelmed
- Change option parser to support this format: `-j2` ?
- Show help when nothing is piped in, `process.stdin.isTTY` not working as expected

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