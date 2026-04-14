const katex = require('katex');

try {
  console.log('Rendering single backslashes:');
  // `A=\\begin...` in a JS string literal represents `A=\begin...` in memory.
  console.log(katex.renderToString('A=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}', {throwOnError: true}));
  console.log('Success single!');
} catch(e) { console.error('Error single:', e.message); }

try {
  console.log('\\nRendering literal double backslashes:');
  // `A=\\\\begin...` in a JS string literal represents `A=\\begin...` in memory.
  const dbl = 'A=\\\\begin{bmatrix}1&0\\\\\\\\0&-1\\\\end{bmatrix}'; 
  console.log(katex.renderToString(dbl, {throwOnError: true}));
  console.log('Success double!');
} catch(e) { console.error('Error double:', e.message); }
