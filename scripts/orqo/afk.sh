#!/bin/bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "======================================"
  echo " Orqo Iteration $i of $1"
  echo "======================================"
  
  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  issues=$(cat issues/*.md 2>/dev/null || echo "No issues found")
  prompt=$(cat scripts/orqo/prompt.md)

  # Run gemini and capture output directly
  output=$(gemini "Previous commits: $commits Issues: $issues $prompt")
  echo "$output"

  if [[ "$output" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Orqo complete after $i iterations."
    exit 0
  fi
done

echo "Finished $1 iterations."
