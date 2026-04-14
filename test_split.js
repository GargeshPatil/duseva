const text = 'A: $A^T = A$ | B: $A^T = -A$ | C: $|A| = 0$ | D: $|A| \\ne 0$';
const lexerRegex = /(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g;
const parts = text.split(lexerRegex);
const result = [];
let current = '';
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
console.log(result.length);
console.log(result);
