// proSearch.js
document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const searchQueryInput = document.getElementById('search-query');

  function addKeyword() {
    const keyword = searchQueryInput.value.trim();
    if (keyword !== '' && window.isProMode) { // isProModeのチェックを追加
      window.addKeywordTag(keyword);
      searchQueryInput.value = ''; // 検索キーワードをクリア
    }
  }

  // +ボタンのクリックイベント
  addButton.addEventListener('click', addKeyword);

  // Enterキーの押下イベント
  searchQueryInput.addEventListener('keypress', function(event) {
    window.handleEnterKey(event);
  });
});
