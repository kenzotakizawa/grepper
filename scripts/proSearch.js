// proSearch.js
document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const searchQueryInput = document.getElementById('search-query');

  function addKeyword() {
    const keyword = searchQueryInput.value.trim();
    if (keyword !== '' && window.isProMode) {
      window.addKeywordTag(keyword);
      searchQueryInput.value = '';
    }
  }

  addButton.addEventListener('click', addKeyword);
  searchQueryInput.addEventListener('keypress', function(event) {
    window.handleEnterKey(event);
  });
});

function proSearch(text) {
  try {
    const lines = text.split('\n');
    const keywordsWithContext = window.getKeywordsWithContext();
    let processedLines = new Map(); // 行番号と行の内容を紐付けて管理

    if (keywordsWithContext.length === 0) {
      console.warn('No keywords found');
      return [];
    }

    // キーワードごとにマッチする行とその前後のコンテキストを処理
    keywordsWithContext.forEach(({ keyword, nBefore, nAfter }) => {
      const regex = new RegExp(keyword, 'i');
      
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          // マッチした行の前後のコンテキスト範囲を計算
          const start = Math.max(0, index - nBefore);
          const end = Math.min(lines.length, index + nAfter + 1);
          
          // この範囲の各行を処理
          for (let i = start; i < end; i++) {
            // まだ処理されていない行のみを追加
            if (!processedLines.has(i)) {
              processedLines.set(i, lines[i]);
            }
          }
        }
      });
    });

    // 行番号でソートして結果を返す
    return Array.from(processedLines.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, line]) => line);

  } catch (error) {
    console.error('Error in proSearch:', error);
    return [];
  }
}

window.proSearch = proSearch;
