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
  const lines = text.split('\n');
  const keywordsWithContext = window.getKeywordsWithContext();
  let results = [];

  keywordsWithContext.forEach(({ keyword, nBefore, nAfter }) => {
    const regex = new RegExp(keyword, 'i');
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        const start = Math.max(0, index - nBefore);
        const end = Math.min(lines.length, index + nAfter + 1);
        results = results.concat(lines.slice(start, end));
      }
    });
  });

  return results;
}

window.proSearch = proSearch;
