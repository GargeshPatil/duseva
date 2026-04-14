function smartSplit(text, delimiter = '|') {
    const result = [];
    let current = '';

    const lexerRegex = /(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g;
    const parts = text.split(lexerRegex);

    parts.forEach(part => {
        if (!part) return;
        
        if (part.startsWith('$$') && part.endsWith('$$')) {
            current += part;
        } else if (part.startsWith('$') && part.endsWith('$')) {
            current += part;
        } else {
            // Normal text, safe to split
            const splitParts = part.split(delimiter);
            if (splitParts.length === 1) {
                current += part;
            } else {
                current += splitParts[0];
                result.push(current);
                
                for (let i = 1; i < splitParts.length - 1; i++) {
                    result.push(splitParts[i]);
                }
                
                current = splitParts[splitParts.length - 1];
            }
        }
    });

    if (current || text.endsWith(delimiter)) {
        result.push(current);
    }
    
    return result;
}

const txt1 = 'A: $A^T = A$ | B: $A^T = -A$ | C: $|A| = 0$ | D: $|A| \\ne 0$';
console.log(txt1);
console.log(smartSplit(txt1));
