const { Project } = require('ts-morph');
const fs = require('fs');

async function main() {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json',
  });

  const log = fs.readFileSync('typescript-errors.log', 'utf8').split('\n');
  const fixTS6133 = {};

  for (const line of log) {
      const match = line.match(/^([^:]+)\((\d+),(\d+)\): error TS(6133|6192|6196|6198): (.*)/);
      if (match) {
          const file = match[1];
          if (!file.startsWith('src/')) continue;
          if (!fixTS6133[file]) fixTS6133[file] = [];
          
          fixTS6133[file].push({
              row: parseInt(match[2]),
              col: parseInt(match[3]),
              errCode: match[4],
              msg: match[5]
          });
      }
  }

  const filesToProcess = Object.keys(fixTS6133);
  console.log(`Processing ${filesToProcess.length} files...`);

  let fileChanges = 0;

  for (const filePath of filesToProcess) {
      const sourceFile = project.getSourceFile(filePath);
      if (!sourceFile) continue;

      let changed = false;

      // 1. Process 6192 (All imports unused on this line)
      // AST approach: just `organizeImports()` on this specific file only!
      // Since it's only 47 files, `organizeImports` is very fast compared to 362 files!
      try {
          const oldText = sourceFile.getFullText();
          sourceFile.organizeImports();
          if (sourceFile.getFullText() !== oldText) changed = true;
      } catch (e) {
          console.error(`Error organizing imports in ${filePath}`);
      }

      // 2. We can try renaming `TS6133` using safe AST traversal or regex, but `organizeImports` fixes 90%
      // Actually, after `organizeImports`, the lines Shift! 
      // But we can check for common unused variables that are known (like prevState, formData)
      
      const text = sourceFile.getFullText();
      let newText = text;
      
      // Known variables we are safe to prefix with _
      const safeVars = ['prevState', 'formData', 'request', 'response', 'e', 'redirect'];
      
      for (const v of safeVars) {
        // Find them as function parameters or isolated declarations
        const regex = new RegExp(`\\b${v}\\b`, 'g');
        if (regex.test(newText) && fixTS6133[filePath].some(f => f.errCode === '6133')) {
             // To be absolutely safe without breaking props:
             // Only replace if the var is actually reported as unused in this file.
             const isReported = fixTS6133[filePath].some(f => f.errCode === '6133' && f.msg.includes(`'${v}' is declared`));
             if (isReported) {
                 newText = newText.replace(regex, `_${v}`);
                 changed = true;
             }
        }
      }

      if (changed) {
          fs.writeFileSync(filePath, newText);
          fileChanges++;
      }
  }

  console.log(`Fixed ${fileChanges} files!`);
}

main().catch(console.error);
