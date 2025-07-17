#!/bin/bash

parallel_path=parallel-gnu

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
    $parallel_path --plus "$@" < "$input_file"
else
    $parallel_path --plus "$@"
fi

echo ""
echo "=================================================="
echo "OUR IMPLEMENTATION OUTPUT:"
echo "=================================================="
if [ -n "$input_file" ]; then
    node bin/parallel.js "$@" < "$input_file"
else
    node bin/parallel.js "$@"
fi

# Clean up temporary file
if [ -n "$input_file" ]; then
    rm -f "$input_file"
fi 