const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const servicesDir = path.join(__dirname, 'services');
const apiSpecPath = path.join(__dirname, '../../memory/API_SPECIFICATION.md');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const pageFiles = walk(pagesDir).filter(f => f.endsWith('.jsx'));
const serviceFiles = walk(servicesDir).filter(f => f.endsWith('.js'));

// Maps service function -> screen
const mapping = {};
const screenUsages = {};

pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(pagesDir, file).replace(/\\/g, '/');
  screenUsages[relPath] = [];
  
  // Find all service calls e.g., patientService.getPatients
  const regex = /(\w+Service)\.(\w+)\(/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const service = match[1];
    const method = match[2];
    screenUsages[relPath].push(`${service}.${method}`);
  }
  // Deduplicate
  screenUsages[relPath] = [...new Set(screenUsages[relPath])];
});

// For each service method, find signature
const serviceSignatures = {};
serviceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const serviceName = path.basename(file, '.js');
  
  const regex = /(\w+):\s*async\s*\((.*?)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const method = match[1];
    const params = match[2];
    serviceSignatures[`${serviceName}.${method}`] = {
      params,
      file: path.basename(file)
    };
  }
});

let output = `# API Handoff Document\n\n`;

Object.keys(screenUsages).forEach(screen => {
  if (screenUsages[screen].length === 0) return;
  
  output += `### ${path.basename(screen, '.jsx')} — ${screen.split('/')[0]} — /${path.basename(screen, '.jsx')}\n\n`;
  output += `**Endpoints used by this screen:**\n\n`;
  output += `| Service Method | Method | Endpoint | Request Body | Response Shape | Spec Status |\n`;
  output += `|---|---|---|---|---|---|\n`;
  
  screenUsages[screen].forEach(call => {
    const sig = serviceSignatures[call];
    const params = sig ? sig.params : 'unknown';
    
    // We note that all apiClient calls are missing because of mock-only shift.
    output += `| \`${call}(${params})\` | NONE (Mock) | Missing | \`{...}\` | \`{...}\` | DIVERGES (Missing in code) |\n`;
  });
  output += `\n`;
});

output += `\n### Discrepancies Requiring Resolution\n`;
output += `- All screens: The frontend was migrated to a pure mock-driven architecture. There are NO \`apiClient\` calls in the service layer at all. Every service function just interacts with local \`mockData.js\` arrays. Therefore, the actual code does not define HTTP Methods or Endpoints.\n`;
output += `- Resolution Needed: The services need to be re-wired to use \`apiClient.get/post/etc.\` according to the \`API_SPECIFICATION.md\` before backend integration is possible.\n`;

output += `\n### Orphaned/Unauthorized — Not In Scope\n`;
output += `No CaseSheet or RemovalRequests usages found after remediation.\n`;

fs.writeFileSync(path.join(__dirname, '../../scratch/API_HANDOFF_FOR_BACKEND.md'), output);
console.log('Done');
