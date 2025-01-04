// search.js

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

  // ローディングインジケーターを表示
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
      // Web Workerにメッセージを送信して検索を実行
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
      // Web Workerにメッセージを送信して通常検索を実行
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

// フォーム管理クラス
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

  // 既存のフォームをクリーンアップするメソッド
  cleanup() {
    for (const formId of this.forms.keys()) {
      this.removeForm(formId);
    }
  }

  // フォームを削除するメソッド
  removeForm(formId) {
    const form = this.forms.get(formId);
    if (form) {
      const listeners = this.eventListeners.get(form);
      if (listeners) {
        Object.entries(listeners).forEach(([event, handler]) => {
          form.removeEventListener(event, handler);
        });
      }
      form.remove();
      this.forms.delete(formId);
      this.eventListeners.delete(form);
    }
  }
}

// キーワード設定管理クラス
class KeywordSetupManager {
  constructor() {
    this.formManager = new SearchFormManager();
    this.setupQueue = [];
    this.isProcessing = false;
  }

  // キーワードのセットアップを非同期で行うメソッド
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

  // キーワードセットアップのキューを処理するメソッド
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

  // 単一のキーワードセットアップを行うメソッド
  async setupSingleKeyword(keyword, before, after) {
    return new Promise((resolve) => {
      // UIのブロッキングを防ぐためにRequestAnimationFrameを使用
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
}

// グローバルインスタンスの作成
const keywordSetupManager = new KeywordSetupManager();

// 共通の検索ハンドラーを作成
class SearchHandler {
  constructor() {
    this.searchInProgress = false;                 // 検索中かどうかのフラグ
    this.searchProcessor = new SearchProcessor();  // 検索プロセッサのインスタンス
    this.setupUI();                                // UIのセットアップ
  }

  // UIのセットアップを行うメソッド
  setupUI() {
    const searchButton = document.getElementById('search-button');
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-search-button';
    cancelButton.textContent = '検索中断';
    cancelButton.style.display = 'none';
    searchButton.parentNode.insertBefore(cancelButton, searchButton.nextSibling);

    // 検索ボタンにクリックイベントリスナーを登録
    searchButton.addEventListener('click', () => this.handleSearch());

    // 中断ボタンにクリックイベントリスナーを登録
    cancelButton.addEventListener('click', () => this.handleCancel());
  }

  // 検索を実行するメソッド
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

      // 検索結果を表示
      this.displayResults(results);
    } catch (error) {
      // エラーを表示
      this.showError(error);
    } finally {
      this.searchInProgress = false;
      searchButton.disabled = false;
      cancelButton.style.display = 'none';
    }
  }

  // 検索を中断するメソッド
  handleCancel() {
    if (this.searchProcessor) {
      this.searchProcessor.abort();
    }
  }

  // 通常モードの検索を実装するメソッド
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

  // 検索結果を表示するメソッド
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

  // エラーを表示するメソッド
  showError(error) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
      <div class="error-message">
        <p>エラーが発生しました: ${this.escapeHtml(error.message)}</p>
        <p>検索条件を確認して、再度お試しください。</p>
      </div>`;
  }

  // HTMLエスケープを行うメソッド
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
} 