// search.js
let searchWorker;

document.addEventListener('DOMContentLoaded', function() {
  // Web Workerの初期化
  searchWorker = new Worker('scripts/workers/searchWorker.js');
  
  // 検索結果の受信処理
  searchWorker.addEventListener('message', function(e) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContainer = document.getElementById('results');
    
    if (e.data.type === 'success') {
      const results = e.data.results;
      
      if (results.length === 0) {
        resultsContainer.innerHTML = '<p>検索文字を含む行は見つかりませんでした。</p>';
      } else {
        resultsContainer.innerHTML = '';
        results.forEach(result => {
          const p = document.createElement('p');
          p.textContent = result;
          p.style.margin = '0';
          resultsContainer.appendChild(p);
        });
      }
    } else if (e.data.type === 'error') {
      resultsContainer.innerHTML = `<p class="error">検索中にエラーが発生しました: ${e.data.error}</p>`;
    }
    
    loadingIndicator.style.display = 'none';
  });

  // エラーハンドリング
  searchWorker.addEventListener('error', function(error) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContainer = document.getElementById('results');
    
    console.error('Worker error:', error);
    resultsContainer.innerHTML = '<p class="error">検索処理でエラーが発生しました。</p>';
    loadingIndicator.style.display = 'none';
  });
});

// 検索実行関数
async function executeSearch() {
  const inputText = document.getElementById('input-text');
  const searchQueryInput = document.getElementById('search-query');
  const loadingIndicator = document.getElementById('loading-indicator');
  const resultsContainer = document.getElementById('results');

  const text = inputText.value.trim();
  if (text === '') {
    resultsContainer.innerHTML = '<p>検索対象のテキストを入力してください。</p>';
    return;
  }

  resultsContainer.innerHTML = '';
  loadingIndicator.style.display = 'block';

  try {
    if (window.isProMode) {
      const keywordsWithContext = window.getKeywordsWithContext();
      if (keywordsWithContext.length === 0) {
        resultsContainer.innerHTML = '<p>検索キーワードを追加してください。</p>';
        loadingIndicator.style.display = 'none';
        return;
      }
      searchWorker.postMessage({
        text,
        keywords: keywordsWithContext,
        isProMode: true
      });
    } else {
      const searchQuery = searchQueryInput.value.trim();
      if (searchQuery === '') {
        resultsContainer.innerHTML = '<p>検索文字列を入力してください。</p>';
        loadingIndicator.style.display = 'none';
        return;
      }
      searchWorker.postMessage({
        text,
        keywords: searchQuery,
        isProMode: false
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = '<p class="error">検索中にエラーが発生しました。</p>';
    loadingIndicator.style.display = 'none';
  }
}

class SearchFormManager {
  constructor() {
    this.forms = new Map(); // フォームを管理するためのMap
    this.eventListeners = new WeakMap(); // イベントリスナーを管理するためのWeakMap
  }

  // フォームの作成と管理
  createForm(keyword, formId) {
    const form = document.createElement('div');
    form.className = 'form-container';
    form.innerHTML = `
      <label>対象キーワード "${keyword}" のN行前も含む</label>
      <div class="input-group">
        <input type="number" value="0" id="nBefore-${keyword}">
      </div>
      <label>対象キーワード "${keyword}" のN行後も含む</label>
      <div class="input-group">
        <input type="number" value="0" id="nAfter-${keyword}">
      </div>
    `;
    form.setAttribute('data-id', formId);
    form.style.display = 'none';

    // イベントリスナーをオブジェクトとして保存
    const listeners = {
      mouseenter: () => {
        form.setAttribute('data-hover', 'true');
      },
      mouseleave: () => {
        form.removeAttribute('data-hover');
        if (!form.contains(document.activeElement)) {
          form.style.display = 'none';
        }
      },
      focusout: (e) => {
        if (!form.contains(e.relatedTarget) && !form.getAttribute('data-hover')) {
          form.style.display = 'none';
        }
      }
    };

    // イベントリスナーを登録
    Object.entries(listeners).forEach(([event, handler]) => {
      form.addEventListener(event, handler);
    });

    // リスナーを保存
    this.eventListeners.set(form, listeners);
    this.forms.set(formId, form);

    return form;
  }

  // フォームの削除とクリーンアップ
  removeForm(formId) {
    const form = this.forms.get(formId);
    if (form) {
      const listeners = this.eventListeners.get(form);
      if (listeners) {
        // イベントリスナーの削除
        Object.entries(listeners).forEach(([event, handler]) => {
          form.removeEventListener(event, handler);
        });
      }
      form.remove();
      this.forms.delete(formId);
      this.eventListeners.delete(form);
    }
  }

  // 全フォームのクリーンアップ
  cleanup() {
    for (const formId of this.forms.keys()) {
      this.removeForm(formId);
    }
  }
}

class KeywordSetupManager {
  constructor() {
    this.formManager = new SearchFormManager();
    this.setupQueue = [];
    this.isProcessing = false;
  }

  async setupKeywords(keywords, befores = [], afters = []) {
    // 既存のフォームをクリーンアップ
    this.formManager.cleanup();
    this.setupQueue = keywords.map((keyword, index) => ({
      keyword,
      before: befores[index] || '0',
      after: afters[index] || '0'
    }));

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;

    try {
      while (this.setupQueue.length > 0) {
        const { keyword, before, after } = this.setupQueue.shift();
        await this.setupSingleKeyword(keyword, before, after);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async setupSingleKeyword(keyword, before, after) {
    return new Promise((resolve) => {
      // RequestAnimationFrameを使用してUIのブロッキングを防ぐ
      requestAnimationFrame(async () => {
        try {
          // キーワードタグの追加
          window.addKeywordTag(keyword);

          // DOMの更新を待つ
          await new Promise(resolve => requestAnimationFrame(resolve));

          // タグの検索
          const keywordTags = document.querySelectorAll('.keyword-tag');
          const keywordTag = Array.from(keywordTags).find(tag => 
            tag.textContent.replace('×', '').trim() === keyword
          );

          if (!keywordTag) {
            resolve();
            return;
          }

          const formId = keywordTag.getAttribute('data-id');
          const form = this.formManager.createForm(keywordTag, keyword);
          
          // フォームの設定
          const beforeInput = form.querySelector(`input[id^="nBefore-"]`);
          const afterInput = form.querySelector(`input[id^="nAfter-"]`);
          
          if (beforeInput && afterInput) {
            beforeInput.value = before;
            afterInput.value = after;
          }

          resolve();
        } catch (error) {
          console.error('Keyword setup error:', error);
          resolve(); // エラーが発生しても次のキーワードの処理を継続
        }
      });
    });
  }

  cleanup() {
    this.setupQueue = [];
    this.formManager.cleanup();
  }
}

// グローバルインスタンスの作成
const keywordSetupManager = new KeywordSetupManager();

// 共通の検索ハンドラーを作成
class SearchHandler {
  constructor() {
    this.searchInProgress = false;
    this.searchProcessor = new SearchProcessor();
    this.setupUI();
  }

  setupUI() {
    const searchButton = document.getElementById('search-button');
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-search-button';
    cancelButton.textContent = '検索中断';
    cancelButton.style.display = 'none';
    searchButton.parentNode.insertBefore(cancelButton, searchButton.nextSibling);

    searchButton.addEventListener('click', () => this.handleSearch());
    cancelButton.addEventListener('click', () => this.handleCancel());
  }

  async handleSearch() {
    if (this.searchInProgress) return;

    const searchButton = document.getElementById('search-button');
    const cancelButton = document.getElementById('cancel-search-button');
    const inputText = document.getElementById('input-text');
    const searchQuery = document.getElementById('search-query');
    const text = inputText.value.trim();

    // 入力チェック
    if (!text) {
      showNotification('検索対象のテキストを入力してください', 'error');
      return;
    }

    this.searchInProgress = true;
    searchButton.disabled = true;

    try {
      let results;
      
      if (window.isProMode) {
        // Proモードの処理
        if (!window.getKeywordsWithContext().length) {
          showNotification('検索キーワードを追加してください', 'error');
          return;
        }
        cancelButton.style.display = 'inline';
        results = await this.searchProcessor.search(text, window.getKeywordsWithContext());
      } else {
        // Normalモードの処理
        const query = searchQuery.value.trim();
        if (!query) {
          showNotification('検索キーワードを入力してください', 'error');
          return;
        }
        results = await this.normalSearch(text, query);
      }

      this.displayResults(results);
    } catch (error) {
      this.showError(error);
    } finally {
      this.searchInProgress = false;
      searchButton.disabled = false;
      cancelButton.style.display = 'none';
    }
  }

  handleCancel() {
    if (this.searchProcessor) {
      this.searchProcessor.abort();
    }
  }

  // 通常検索の実装
  async normalSearch(text, query) {
    const lines = text.split('\n');
    const results = [];
    
    try {
      const regex = new RegExp(query, 'gi');
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          results.push(lines[i]);
        }
      }
      return results;
    } catch (error) {
      throw new Error('検索処理でエラーが発生しました: ' + error.message);
    }
  }

  // 結果表示の実装
  displayResults(results) {
    const resultsContainer = document.getElementById('results');
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>該当する結果が見つかりませんでした。</p>';
      return;
    }

    resultsContainer.innerHTML = results
      .map(line => `<p>${this.escapeHtml(line)}</p>`)
      .join('');
  }

  // エラー表示の実装
  showError(error) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
      <div class="error-message">
        <p>エラーが発生しました: ${this.escapeHtml(error.message)}</p>
        <p>検索条件を確認して、再度お試しください。</p>
      </div>`;
  }

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  window.searchHandler = new SearchHandler();
});

// クリーンアップ処理
window.addEventListener('beforeunload', () => {
  keywordSetupManager.cleanup();
});
