// search.js
document.getElementById('search-button').addEventListener('click', function() {
  const text = document.getElementById('input-text').value;
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading-indicator');
  resultsContainer.innerHTML = '';

  if (text.trim() === '') {
    resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
    return;
  }

  loadingIndicator.style.display = 'flex';

  setTimeout(() => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let results = [];

    if (window.isProMode) {
      results = window.proSearch(text);
    } else {
      const searchQuery = document.getElementById('search-query').value.trim();
      if (searchQuery === '') {
        resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
        loadingIndicator.style.display = 'none';
        return;
      }

      const regex = new RegExp(searchQuery, 'i');
      results = lines.filter(line => regex.test(line));
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
