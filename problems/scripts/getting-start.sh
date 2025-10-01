#!/bin/bash
set -e

# Write and then unset the flag
if [ -n "$FLAG" ]; then
  echo "flag{$FLAG}" > /home/player/flag.txt
fi

unset FLAG
unset SCRIPT

exec node index.js