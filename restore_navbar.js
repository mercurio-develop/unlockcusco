const fs = require('fs');

let navbar = fs.readFileSync('src/components/layout/navbar.tsx', 'utf8');

navbar = navbar.replace(
  'className="space-y-5 text-sm text-slate-700 py-2"',
  'className="space-y-5 text-sm text-slate-300 hover:text-white py-2"'
);

fs.writeFileSync('src/components/layout/navbar.tsx', navbar);
console.log('Restored remaining piece!');
