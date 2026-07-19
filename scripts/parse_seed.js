const fs = require('fs');
const content = fs.readFileSync('prisma/seed.ts', 'utf8');

const regex = /prisma\.([a-zA-Z0-9_]+)\.(create|update|upsert|updateMany|delete|deleteMany|findFirst|findMany|count)\(/g;
let match;
const operations = [];

while ((match = regex.exec(content)) !== null) {
  operations.push({ model: match[1], operation: match[2] });
}

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('console.log(')) {
    console.log(`Log [Line ${index + 1}]: ${line.trim()}`);
  }
});

console.log("=== DB Operations ===");
operations.forEach(op => console.log(`${op.model}.${op.operation}`));
