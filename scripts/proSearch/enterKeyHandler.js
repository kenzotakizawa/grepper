// enterKeyHandler.js
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // デフォルトのEnterキーの動作を防ぐ
    const keyword = event.target.value.trim();
    if (keyword !== '' && window.isProMode) { // isProModeのチェックを追加
      window.addKeywordTag(keyword);
      event.target.value = ''; // 検索キーワードをクリア
    }
  }
}

// グローバルスコープに関数を配置
window.handleEnterKey = handleEnterKey;
