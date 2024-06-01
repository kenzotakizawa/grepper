document.getElementById('search-button').addEventListener('click', function() {
  const text = document.getElementById('input-text').value;
  const queryFields = document.querySelectorAll('.search-field');
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading-indicator');
  resultsContainer.innerHTML = '';

  const queries = Array.from(queryFields).map(field => field.value.trim()).filter(q => q !== '');

  if (text.trim() === '' || queries.length === 0) {
    resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
    return;
  }

  loadingIndicator.style.display = 'flex';

  setTimeout(() => {
    // テキストを行ごとに分割し、空行を除去
    const lines = text.split('\n').filter(line => line.trim() !== '');

    // 検索ワードを含む行のみを抽出
    const results = lines.filter(line => {
      return queries.some(query => line.includes(query));
    });

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>検索文字を含む行は見つかりませんでした。</p>';
    } else {
      // 結果を表示
      results.forEach(result => {
        const p = document.createElement('p');
        p.textContent = result;
        p.style.margin = '0'; // <p>タグのデフォルトの余白をなくす
        resultsContainer.appendChild(p);
      });
    }

    loadingIndicator.style.display = 'none';
  }, 1000); // 処理に1秒以上かかる場合のシミュレーション
});

// Proモードの時だけ、検索フィールドを追加するボタンの処理
document.getElementById('add-query-button').addEventListener('click', function() {
  const newQueryField = document.createElement('input');
  newQueryField.type = 'text';
  newQueryField.className = 'search-field';
  newQueryField.placeholder = '検索文字列を入力してください...';

  const searchContainer = document.querySelector('.search-container');
  searchContainer.insertBefore(newQueryField, document.getElementById('search-button'));
});
