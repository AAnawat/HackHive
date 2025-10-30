#!/bin/bash
set -euo pipefail

# Write and then unset the flag
if [ -n "${FLAG:-}" ]; then
  echo -n "flag{$FLAG}" | base64 > /home/player/cipher.txt
fi

unset FLAG
unset SCRIPT

exec node index.js