self.addEventListener('message', async function(e) {
  const { text, keywords, isProMode } = e.data;
  
  try {
    if (isProMode) {
      const results = await proSearch(text, keywords);
      self.postMessage({ type: 'success', results });
    } else {
      const results = normalSearch(text, keywords);
      self.postMessage({ type: 'success', results });
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
});

async function proSearch(text, keywordsWithContext) {
  const lines = text.split('\n');
  const processedLines = new Map();

  function validateKeyword(keyword) {
    const dangerousPatterns = [
      /(\*+|\++|\{.+\})\?/,
      /\(.+\)\+/,
      /\{,\d+\}/
    ];
    return !dangerousPatterns.some(pattern => pattern.test(keyword));
  }

  for (const { keyword, nBefore, nAfter } of keywordsWithContext) {
    if (!validateKeyword(keyword)) {
      continue;
    }

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'i');

    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        const start = Math.max(0, i - nBefore);
        const end = Math.min(lines.length, i + nAfter + 1);
        
        for (let j = start; j < end; j++) {
          if (!processedLines.has(j)) {
            processedLines.set(j, lines[j]);
          }
        }
      }
    }
  }

  return Array.from(processedLines.entries())
    .sort(([a], [b]) => a - b)
    .map(([_, line]) => line);
}

function normalSearch(text, searchQuery) {
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'i');
  return text.split('\n').filter(line => regex.test(line));
}
