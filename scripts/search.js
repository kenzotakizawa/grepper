// search.js
document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.getElementById('search-button');
  const searchQueryInput = document.getElementById('search-query');

  // 検索実行関数
  function executeSearch() {
    const text = document.getElementById('input-text').value;
    const resultsContainer = document.getElementById('results');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    try {
      resultsContainer.innerHTML = '';
      
      if (text.trim() === '') {
        resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
        return;
      }

      loadingIndicator.style.display = 'flex';

      setTimeout(() => {
        try {
          let results = [];
          
          if (window.isProMode) {
            results = window.proSearch(text);
          } else {
            const searchQuery = searchQueryInput.value.trim();
            if (searchQuery === '') {
              resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
              return;
            }
            const regex = new RegExp(searchQuery, 'i');
            results = text.split('\n').filter(line => regex.test(line));
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
        } catch (error) {
          console.error('Error during search:', error);
          resultsContainer.innerHTML = '<p>検索中にエラーが発生しました。</p>';
        } finally {
          loadingIndicator.style.display = 'none';
        }
      }, 1000);
    } catch (error) {
      console.error('Error in search button handler:', error);
      resultsContainer.innerHTML = '<p>エラーが発生しました。</p>';
      loadingIndicator.style.display = 'none';
    }
  }

  // 検索ボタンクリック時のイベントリスナー
  searchButton.addEventListener('click', executeSearch);

  // 検索フィールドでのEnterキー押下時のイベントリスナー
  searchQueryInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !window.isProMode) {
      event.preventDefault();
      executeSearch();
    }
  });
});
