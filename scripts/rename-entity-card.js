/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');

const file = 'src/features/business/components/business-card.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/EntityCardProps/g, 'BusinessCardProps');
content = content.replace(/EntityCard/g, 'BusinessCard');
content = content.replace(/entity:/g, 'business:');
content = content.replace(/entity,/g, 'business,');
content = content.replace(/entity\./g, 'business.');

fs.writeFileSync(file, content, 'utf8');
console.log('Renamed EntityCard to BusinessCard');
