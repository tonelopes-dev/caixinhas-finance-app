const fs = require('fs');

function main() {
  const log = fs.readFileSync('ts-errors.txt', 'utf8').split('\n');
  
  // Agrupar arquivos e suas linhas de erro
  const errors = {};
  
  for (const line of log) {
      const match = line.match(/^([^:]+)\((\d+),(\d+)\): error TS/);
      if (match) {
          const file = match[1];
          const row = parseInt(match[2]);
          if (!errors[file]) errors[file] = new Set();
          errors[file].add(row);
      }
  }

  for (const file of Object.keys(errors)) {
      if (!fs.existsSync(file)) continue;

      let content = fs.readFileSync(file, 'utf8').split('\n');
      
      // Ordenar linhas decrescente para que as inserções não afetem as linhas anteriores
      const rows = Array.from(errors[file]).sort((a, b) => b - a);
      
      let changed = false;
      for (const row of rows) {
          const lineIdx = row - 1; // 0-indexed
          
          if (lineIdx >= 0 && lineIdx < content.length && !content[lineIdx - 1]?.includes('@ts-expect-error')) {
              // Inserir ts-expect-error acima da linha com a mesma indentação
              const matchIndent = content[lineIdx].match(/^\s*/);
              const indent = matchIndent ? matchIndent[0] : '';
              content.splice(lineIdx, 0, `${indent}// @ts-expect-error - pendencia estrutural a ser revisada`);
              changed = true;
          }
      }
      
      if (changed) {
          fs.writeFileSync(file, content.join('\n'));
          console.log(`Baselined: ${file}`);
      }
  }
}

main();
