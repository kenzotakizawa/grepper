// search.js
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
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

  // 既存のURL処理部分を確認
  if (urlParams.has('keywords')) {
    const keywords = urlParams.get('keywords');
    document.getElementById('search-query').value = keywords;
  }

  // 新しいURL処理を追加
  if (urlParams.has('q')) {
    const keywords = urlParams.getAll('q');
    const befores = urlParams.getAll('before');
    const afters = urlParams.getAll('after');
    
    window.isProMode = true;
    
    const setupKeywords = async () => {
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        
        window.addKeywordTag(keyword);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const keywordTags = document.querySelectorAll('.keyword-tag');
        const keywordTag = Array.from(keywordTags).find(tag => 
          tag.textContent.replace('×', '').trim() === keyword
        );
        
        if (!keywordTag) continue;
        
        if (typeof window.showForm === 'function') {
          window.showForm({ currentTarget: keywordTag });
        } else {
          continue;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const formContainer = document.querySelector(`.form-container[data-id="${keywordTag.getAttribute('data-id')}"]`);
        if (formContainer) {
          const beforeInput = formContainer.querySelector('input[id^="nBefore-"]');
          const afterInput = formContainer.querySelector('input[id^="nAfter-"]');
          
          if (beforeInput && afterInput) {
            beforeInput.value = befores[i] || '0';
            afterInput.value = afters[i] || '0';
          }
        }
      }
    };
    
    setupKeywords();
  }
});
