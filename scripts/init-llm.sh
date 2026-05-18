#!/bin/bash
# init-llm.sh
# Initializes the LLM workspace and autonomous workflow setup for UnlockCusco

echo "Initializing LLM Workspace..."

# 1. Create necessary directories for Orqo AFK workflow
mkdir -p issues/done

# 2. Ensure scripts are executable
chmod +x scripts/orqo/*.sh

echo "Orqo autonomous workflow is ready."
echo "To start Orqo, create an issue in the 'issues/' directory and run: ./scripts/orqo/afk.sh <iterations>"
