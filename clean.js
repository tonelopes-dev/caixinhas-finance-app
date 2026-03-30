const { Project } = require('ts-morph');
const fs = require('fs');

async function main() {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json',
  });

  const files = project.getSourceFiles();
  console.log(`Analyzing ${files.length} files...`);

  let modified = 0;

  for (const sourceFile of files) {
    if (sourceFile.getFilePath().includes('node_modules')) continue;
    if (sourceFile.getFilePath().includes('tests')) continue;
    if (sourceFile.getFilePath().includes('__tests__')) continue;
    if (sourceFile.getFilePath().includes('scripts')) continue;
    
    // Check if it's in src
    if (!sourceFile.getFilePath().includes('/src/')) continue;

    let changed = false;

    // 1. Remove completely unused imports
    const declarations = sourceFile.getImportDeclarations();
    for (const dec of declarations) {
        // Find if this entire import is unused or if specific specifiers are unused
       // For now, let's just use the built-in organizeImports which removes unused imports!
    }

    // Actually, `organizeImports` does not just sort, it removes unused!
    try {
        const oldText = sourceFile.getFullText();
        sourceFile.organizeImports();
        if (sourceFile.getFullText() !== oldText) changed = true;
    } catch (e) {
        console.error(`Error organizing imports in ${sourceFile.getFilePath()}`);
    }

    // 2. We can read `typescript-errors.log` and rename parameters reported as TS6133
    
    if (changed) {
        sourceFile.saveSync();
        modified++;
    }
  }

  console.log(`Modified imports in ${modified} files.`);

  // Now, let's read the log and fix TS6133
  const log = fs.readFileSync('typescript-errors.log', 'utf8').split('\n');
  const fixTS6133 = {};

  for (const line of log) {
      // Example: src/app/(private)/accounts/actions.ts(182,38): error TS6133: 'prevState' is declared but its value is never read.
      const match = line.match(/^([^:]+)\((\d+),(\d+)\): error TS(6133|6196): '([^']+)' is declared but/);
      if (match) {
          const file = match[1];
          const row = parseInt(match[2]);
          const col = parseInt(match[3]);
          const varName = match[5];
          
          if (!file.includes('src/')) continue;

          if (!fixTS6133[file]) fixTS6133[file] = [];
          fixTS6133[file].push({ row, col, varName });
      }
  }

  for (const file in fixTS6133) {
      if (!fs.existsSync(file)) continue;
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      
      // Sort fixes by row DESCENDING so we don't mess up row offsets for a single file
      fixTS6133[file].sort((a,b) => b.row - a.row);

      for (const fix of fixTS6133[file]) {
          const l = fix.row - 1; // 0-indexed
          const lineStr = lines[l];
          
          // If it's a parameter in a server action or arrow function, we can just prefix with _
          // But what if it's a destructured property?
          // We will just do a simple replacement if the variable name is exact word:
          const regex = new RegExp(`\\b${fix.varName}\\b`);
          if (regex.test(lineStr)) {
              // Be very careful - if it's an import, it was already handled.
              // If it's `const User =`, we might comment it, but let's just prefix all TS6133 with `_` to silence `noUnusedLocals`/`noUnusedParameters`
              lines[l] = lineStr.replace(regex, `_${fix.varName}`);
          }
      }

      fs.writeFileSync(file, lines.join('\n'));
      console.log(`Patched ${fixTS6133[file].length} unused vars in ${file}`);
  }
}

main().catch(console.error);
