document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const searchQueryInput = document.getElementById('search-query');
  const keywordsContainer = document.getElementById('keywords-container');

  // キーワードをタグとして追加する関数
  function addKeywordTag(keyword) {
    const keywordTag = document.createElement('div');
    keywordTag.className = 'keyword-tag';
    keywordTag.textContent = keyword;

    const removeButton = document.createElement('button');
    removeButton.textContent = '×';
    removeButton.addEventListener('click', function() {
      keywordsContainer.removeChild(keywordTag);
    });

    keywordTag.appendChild(removeButton);
    keywordsContainer.appendChild(keywordTag);
  }

  // +ボタンのクリックイベント
  addButton.addEventListener('click', function() {
    const keyword = searchQueryInput.value.trim();
    if (keyword !== '') {
      addKeywordTag(keyword);
      searchQueryInput.value = ''; // 検索キーワードをクリア
    }
  });

  // Enterキーの押下イベント
  searchQueryInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // フォームの送信を防ぐ
      const keyword = searchQueryInput.value.trim();
      if (keyword !== '') {
        addKeywordTag(keyword);
        searchQueryInput.value = ''; // 検索キーワードをクリア
      }
    }
  });
});
