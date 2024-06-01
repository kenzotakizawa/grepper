document.getElementById('search-button').addEventListener('click', function() {
  const text = document.getElementById('input-text').value;
  const query = document.getElementById('search-query').value.trim();
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading-indicator');
  resultsContainer.innerHTML = '';

  if (text.trim() === '' || query === '') {
    resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
    return;
  }

  loadingIndicator.style.display = 'flex';

  setTimeout(() => {
    // テキストを行ごとに分割し、空行を除去
    const lines = text.split('\n').filter(line => line.trim() !== '');

    // 検索ワードを含む行のみを抽出
    const results = lines.filter(line => line.includes(query));

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
