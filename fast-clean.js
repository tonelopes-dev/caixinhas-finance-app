const fs = require('fs');

async function main() {
  const log = fs.readFileSync('typescript-errors.log', 'utf8').split('\n');
  const filesMap = {};

  // Group line modifications by file
  for (const line of log) {
    // 1. Unused completely: "All imports in import declaration are unused." TS6192
    // 2. Unused Variable: "X is declared but its value is never read." TS6133
    // 3. Unused destructured: "All destructured elements are unused." TS6198

    let match = line.match(/^([^:]+)\((\d+),(\d+)\): error TS(6133|6192|6196|6198): (.*)/);
    if (!match) continue;
    
    const file = match[1];
    if (!file.includes('src/')) continue;
    
    const row = parseInt(match[2]);
    const errCode = match[4];
    const msg = match[5];

    if (!filesMap[file]) filesMap[file] = { deletes: new Set(), blocks: new Set(), renames: [] };

    // TS6192 => Delete entire line
    if (errCode === '6192' || errCode === '6198') {
      filesMap[file].deletes.add(row - 1); // 0-indexed line number
    } 
    // TS6133 => Rename 'varName' to '_varName'
    else if (errCode === '6133' || errCode === '6196') {
      const varMatch = msg.match(/'([^']+)' is declared/);
      if (varMatch) {
         filesMap[file].renames.push({ row: row - 1, varName: varMatch[1] });
      }
    }
  }

  let totalFiles = Object.keys(filesMap).length;
  console.log(`Processing ${totalFiles} files from log...`);

  for (const file in filesMap) {
      if (!fs.existsSync(file)) continue;
      let lines = fs.readFileSync(file, 'utf8').split('\n');
      const mod = filesMap[file];
      
      // Delete lines first (actually we should empty them to keep row indices correct)
      for (const lineIdx of mod.deletes) {
         if (lines[lineIdx].trim().startsWith('import ') || lines[lineIdx].trim().startsWith('const {')) {
             lines[lineIdx] = ''; 
         }
      }

      // Renames
      for (const { row, varName } of mod.renames) {
          if (!lines[row]) continue;
          
          // Using regex with word boundary. But be careful not to replace things inside strings or methods wrongly.
          // Since it's TS's reported exact line, the var is likely exactly here.
          // e.g., `import { A, B }` -> delete A? No, wait! If it's an import, replacing A with _A breaks the import!
          // BUT if we prefix it with _, TS will say "_A is not exported" or something.
          // Actually, if it's an import we should remove it from `{ X }`.
          // If the line has 'import ', let's safely remove the word.
          const isImport = lines[row].trim().startsWith('import ');
          if (isImport) {
              lines[row] = lines[row].replace(new RegExp(`\\b${varName}\\b,?\\s*`), '');
              // Clean up empty braces `{  }` -> ``
              lines[row] = lines[row].replace(/{\s*}/, '');
              // if import is just `import from` -> empty
              if (lines[row].match(/import\s+from/)) lines[row] = '';
          } else {
             // Prefix with `_` to silence TS compiler
             const regex = new RegExp(`\\b${varName}\\b`);
             lines[row] = lines[row].replace(regex, `_${varName}`);
          }
      }

      fs.writeFileSync(file, lines.join('\n'));
      console.log(`Fixed ${file}`);
  }
}

main().catch(console.error);
