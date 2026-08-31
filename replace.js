const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else if (fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = findFiles(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('console.log') || content.includes('console.error')) {
    // Add import
    const relativePath = path.relative(path.dirname(file), path.join(srcDir, 'utils', 'logger.js')).replace(/\\/g, '/');
    let importStmt = `import { logger } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';\n`;
    
    // Avoid double import
    if (!content.includes('logger.js')) {
      content = importStmt + content;
    }
    
    content = content.replace(/console\.log/g, 'logger.info');
    content = content.replace(/console\.error/g, 'logger.error');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
