const fs = require('fs');
const path = require('path');

// Find all TypeScript files in app/api/cesta directory
function findTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') && item === 'route.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Add dynamic export to file if it uses auth
function addDynamicExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses auth from @clerk
  if (!content.includes("import { auth } from '@clerk/nextjs/server'")) {
    return false;
  }
  
  // Check if dynamic export already exists
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    return false;
  }
  
  // Find the position after imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('export async function') || lines[i].startsWith('export function')) {
      insertIndex = i;
      break;
    }
  }
  
  // Insert dynamic export
  lines.splice(insertIndex, 0, '', '// Force dynamic rendering', "export const dynamic = 'force-dynamic'");
  
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent);
  return true;
}

// Main execution
const cestaApiDir = path.join(__dirname, '..', 'app', 'api', 'cesta');
const tsFiles = findTsFiles(cestaApiDir);

console.log(`Found ${tsFiles.length} route.ts files in app/api/cesta`);

let modifiedCount = 0;
for (const file of tsFiles) {
  if (addDynamicExport(file)) {
    console.log(`Added dynamic export to: ${file}`);
    modifiedCount++;
  }
}

console.log(`Modified ${modifiedCount} files`);
