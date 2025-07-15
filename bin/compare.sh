#!/bin/bash

# Capture stdin to a temporary file if it's being piped
if [ ! -t 0 ]; then
    input_file=$(mktemp)
    cat > "$input_file"
    exec < "$input_file"
fi

echo "=================================================="
echo "GNU PARALLEL OUTPUT:"
echo "=================================================="
if [ -n "$input_file" ]; then
    parallel "$@" < "$input_file"
else
    parallel "$@"
fi
gnu_exit=$?

echo ""
echo "=================================================="
echo "OUR IMPLEMENTATION OUTPUT:"
echo "=================================================="
if [ -n "$input_file" ]; then
    node bin/parallel.js "$@" < "$input_file"
else
    node bin/parallel.js "$@"
fi
our_exit=$?

echo ""
echo "=================================================="
echo "EXIT CODES: GNU=$gnu_exit, OURS=$our_exit"
echo "=================================================="

# Clean up temporary file
if [ -n "$input_file" ]; then
    rm -f "$input_file"
fi 