parallel
=======

Execute shell command lines from standard input in parallel.

Loosely based on [GNU parallel command](https://www.gnu.org/software/parallel/man.html).

# Installation

Using npm:

	$ npm install parallel-cli -g

# Usage

```bash
input | parallel [options] cmd [cmd-options] {} > output
input | parallel [options] --pipe cmd [cmd-options] > output
```

# Options

```bash
-j, --jobs <n>          Number of processes to spawn [default CPUs(4)]
-n, --max-args <args>   Number of input lines per command line [default 1]
-d, --delimiter <delim> Input items are terminated by delim [default \n]
-0, --null              Use NUL as delimiter, alias for -d $'\0'
-q, --quote             Quote each input line in case they contain special caracters
-a, --arg-file <file>   Use file as input source instead of stdin
-p, --pipe              Spread input to jobs on stdin
-v, --verbose           Output additional information to stderr
-s, --shell             Wrap command with shell (supports escaped pipes, redirection, etc)(experimental)
-h, --help              Print this message and exit
-V, --version           Print the comand version and exit
```
# Examples

```bash
cat data | parallel -pj 3 grep pattern > out
```
```bash
find . -name "*.gz" -print0 | parallel -0n 10 gzip -dc {} > out
```
```bash
echo {000..100} | parallel -vn 0 -d " " echo file{}.png
```
```bash
seq 20 | parallel.js -svj 2 -n 2 sleep 1 ; echo -{}-
```

# Replacements

- When `--pipe` is omitted, the input lines will replace each `{}` found in the command
- If no `{}` is found, lines will be appended to the end
- If `{}` is within other parameters, all lines will be placed between them
- Any characters before or after `{}` will be used for each line, use quotes for spaces

# Differences with [GNU parallel](https://www.gnu.org/software/parallel/man.html)
- `-p` added as an alias of `--pipe`
- `--round-robin` is implicit when `--pipe` is used
- `--max-args 0` here means distribute input evenly among `--jobs`
- `--shell` was added to allow pipes, redirection, etc
- A ton of missing options that I consider less useful
- Many more

# ToDo
- Support more replacements: `{.}`, `{/}`, etc
- Use streams2 way with `readable` to support input backpressure
- Change option parser to support this format: `-j2` ?
- Add support for more options from [GNU parallel](https://www.gnu.org/software/parallel/man.html)

# License

Copyright (c) 2015, Ariel Flesler
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the {organization} nor the names of its
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