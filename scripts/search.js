document.getElementById('search-button').addEventListener('click', function() {
  const text = document.getElementById('input-text').value;
  const searchQuery = document.getElementById('search-query').value.trim();
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading-indicator');
  resultsContainer.innerHTML = '';

  if (text.trim() === '' || searchQuery === '') {
    resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
    return;
  }

  loadingIndicator.style.display = 'flex';

  setTimeout(() => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let results;

    if (isProMode) {
      // Proモードの検索処理を別ファイルから呼び出し
      results = proSearch(text, searchQuery);
    } else {
      // Normalモードの検索処理
      results = lines.filter(line => {
        const regex = new RegExp(`\\b${searchQuery}\\b`, 'i');
        return regex.test(line);
      });
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>検索文字を含む行は見つかりませんでした。</p>';
    } else {
      results.forEach(result => {
        const p = document.createElement('p');
        p.textContent = result;
        p.style.margin = '0';
        resultsContainer.appendChild(p);
      });
    }

    loadingIndicator.style.display = 'none';
  }, 1000);
});
