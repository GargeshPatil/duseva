const text1 = 'A: $|x|$ | B: $|x+2|$ | C: $|x^2-4|$ | D: $|x-2|$';
const lexerRegex = /(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g;
function smart(text) {
  const parts = text.split(lexerRegex);
  const result = []; let current = '';
  parts.forEach(part => {
      if (!part) return;
      if (part.startsWith('$$') && part.endsWith('$$')) { current += part; } 
      else if (part.startsWith('$') && part.endsWith('$')) { current += part; } 
      else {
          const splitParts = part.split('|');
          if (splitParts.length === 1) { current += part; } 
          else {
              current += splitParts[0]; result.push(current);
              for (let i = 1; i < splitParts.length - 1; i++) { result.push(splitParts[i]); }
              current = splitParts[splitParts.length - 1];
          }
      }
  });
  if (current || text.endsWith('|')) result.push(current);
  return result;
}
console.log(smart(text1).length);
console.log(smart(text1));
