const fs = require('fs');
const path = require('path');

const files = {
  'scripts/orqo/prompt.md': 'scripts/orqo/prompt.md',
  'scripts/orqo/once.sh': 'scripts/orqo/once.sh',
  'scripts/orqo/afk.sh': 'scripts/orqo/afk.sh',
  'scripts/init-llm.sh': 'scripts/init-llm.sh',
  '.gemini/skills/tdd/SKILL.md': '.gemini/skills/tdd/SKILL.md',
  '.gemini/skills/diagnose/SKILL.md': '.gemini/skills/diagnose/SKILL.md',
  '.gemini/skills/to-prd/SKILL.md': '.gemini/skills/to-prd/SKILL.md',
  '.gemini/skills/grill-with-docs/SKILL.md': '.gemini/skills/grill-with-docs/SKILL.md',
};

let output = '#!/bin/bash\n';
output += 'echo "Initializing Orqo Workflow and Engineering Skills in $(pwd)..."\n\n';

for (const [dest, src] of Object.entries(files)) {
  const content = fs.readFileSync(path.join(__dirname, src), 'utf8');
  output += `mkdir -p $(dirname "${dest}")\n`;
  output += `cat << 'ORQO_EOF' > "${dest}"\n`;
  output += content;
  if (!content.endsWith('\n')) output += '\n';
  output += `ORQO_EOF\n\n`;
}

output += 'chmod +x scripts/orqo/*.sh scripts/init-llm.sh\n\n';

output += `
if [ ! -f "GEMINI.md" ]; then
cat << 'GEMINI_EOF' > GEMINI.md
# Local Agent Instructions

## Autonomous Workflows
- **Orqo AFK Workflow:** You can run the agent autonomously using \\\`scripts/orqo/afk.sh <iterations>\\\`. The agent will pick up Markdown issues from the \\\`issues/\\\` directory, process them using \\\`/tdd\\\`, run feedback loops (\\\`npm run test\\\` and \\\`npm run build\\\`), and commit changes iteratively until all issues are moved to \\\`issues/done/\\\`.

## Active Skills
- **\\\`tdd\\\`**: Enforce a strict Red-Green-Refactor loop.
- **\\\`diagnose\\\`**: Track down hard-to-find bugs.
- **\\\`to-prd\\\`**: Turn brainstorms into structured requirements.
- **\\\`grill-with-docs\\\`**: Stress-test plans against documentation.

## Context Routing
- Memory: \\\`.agent/memory/\\\`
- Roster: \\\`agents/AGENTS.md\\\`
GEMINI_EOF
else
  echo "GEMINI.md already exists. Skipping creation."
fi
`;

output += `
if [ -f "package.json" ]; then
  if grep -q '"init-llm"' package.json; then
    echo "init-llm already in package.json scripts."
  else
    echo "Adding init-llm to package.json scripts..."
    node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json')); pkg.scripts = pkg.scripts || {}; pkg.scripts['init-llm'] = 'bash scripts/init-llm.sh'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
  fi
fi
`;

output += 'echo "Orqo initialization complete! Run npm run init-llm to finish setup."\n';

fs.writeFileSync(path.join(__dirname, 'orqo-init.sh'), output);
fs.chmodSync(path.join(__dirname, 'orqo-init.sh'), 0o755);
console.log('Successfully generated orqo-init.sh');
