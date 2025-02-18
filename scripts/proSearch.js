// proSearch.js
document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const searchQueryInput = document.getElementById('search-query');

  function addKeyword() {
    const keyword = searchQueryInput.value.trim();
    if (keyword !== '' && window.isProMode) {
      window.addKeywordTag(keyword);
      searchQueryInput.value = '';
    }
  }

  addButton.addEventListener('click', addKeyword);
  searchQueryInput.addEventListener('keypress', function(event) {
    window.handleEnterKey(event);
  });
});

// カスタムエラークラスの定義
class SearchError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.name = 'SearchError';
    this.type = type;
    this.details = details;
  }
}

// エラー種別の定義
const ErrorTypes = {
  INVALID_INPUT: 'INVALID_INPUT',
  TIMEOUT: 'TIMEOUT',
  REGEX_ERROR: 'REGEX_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  ABORTED: 'ABORTED'
};

class SearchProcessor {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;
    this.chunkSize = options.chunkSize || 1000;
    this.regexCache = new Map();
    this.abortController = new AbortController();
  }

  // 検索中断メソッド
  abort() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  async processChunk(lines, start, keyword, regex, nBefore, nAfter, processedLines) {
    // 中断シグナルのチェック
    if (this.abortController.signal.aborted) {
      throw new SearchError('検索が中断されました', ErrorTypes.ABORTED);
    }

    const end = Math.min(start + this.chunkSize, lines.length);
    
    for (let i = start; i < end; i++) {
      // 各イテレーションで中断シグナルをチェック
      if (this.abortController.signal.aborted) {
        throw new SearchError('検索が中断されました', ErrorTypes.ABORTED);
      }

      if (regex.test(lines[i])) {
        const contextStart = Math.max(0, i - nBefore);
        const contextEnd = Math.min(lines.length, i + nAfter + 1);
        
        for (let j = contextStart; j < contextEnd; j++) {
          if (!processedLines.has(j)) {
            processedLines.set(j, lines[j]);
          }
        }
      }
    }
    
    return end;
  }

  getRegex(keyword) {
    if (!this.regexCache.has(keyword)) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this.regexCache.set(keyword, new RegExp(escapedKeyword, 'i'));
    }
    return this.regexCache.get(keyword);
  }

  async search(text, keywordsWithContext) {
    try {
      const lines = text.split('\n');
      const processedLines = new Map();
      
      for (const { keyword, nBefore, nAfter } of keywordsWithContext) {
        const regex = this.getRegex(keyword);
        let position = 0;
        
        while (position < lines.length) {
          try {
            position = await Promise.race([
              this.processChunk(lines, position, keyword, regex, nBefore, nAfter, processedLines),
              new Promise((_, reject) => {
                setTimeout(() => reject(new SearchError(
                  'チャンク処理がタイムアウトしました',
                  ErrorTypes.TIMEOUT,
                  { keyword, position }
                )), this.timeout);
              })
            ]);
          } catch (error) {
            if (error.type === ErrorTypes.ABORTED) {
              return []; // 中断時は空の結果を返す
            }
            if (error.type === ErrorTypes.TIMEOUT) {
              console.warn('Chunk timeout:', error.details);
              position += this.chunkSize;
              continue;
            }
            throw error;
          }
        }
      }

      return Array.from(processedLines.entries())
        .sort(([a], [b]) => a - b)
        .map(([_, line]) => line);

    } catch (error) {
      if (error.type === ErrorTypes.ABORTED) {
        return [];
      }
      throw error;
    }
  }

  clearCache() {
    this.regexCache.clear();
  }
}

// メイン検索関数の更新
const searchProcessor = new SearchProcessor({
  timeout: 3000,  // 3秒
  chunkSize: 500  // 500行ずつ処理
});

async function proSearch(text) {
  try {
    // 入力値の検証
    if (!text || typeof text !== 'string') {
      throw new SearchError(
        '検索対象のテキストが無効です',
        ErrorTypes.INVALID_INPUT,
        { text }
      );
    }

    const keywordsWithContext = window.getKeywordsWithContext();
    if (!keywordsWithContext || keywordsWithContext.length === 0) {
      throw new SearchError(
        '検索キーワードが設定されていません',
        ErrorTypes.INVALID_INPUT
      );
    }

    return await searchProcessor.search(text, keywordsWithContext);

  } catch (error) {
    if (error instanceof SearchError) {
      throw error;
    }
    throw new SearchError(
      'システムエラーが発生しました',
      ErrorTypes.SYSTEM_ERROR,
      { originalError: error.message }
    );
  }
}

// エラーハンドリングの購読
window.addEventListener('searchError', (event) => {
  const error = event.detail;
  const resultsContainer = document.getElementById('results');
  
  // エラータイプに応じたメッセージとアクション
  switch (error.type) {
    case ErrorTypes.INVALID_INPUT:
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>${error.message}</p>
          <p>検索条件を確認して、再度お試しください。</p>
        </div>`;
      break;
      
    case ErrorTypes.TIMEOUT:
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>${error.message}</p>
          <p>検索キーワード "${error.details.keyword}" の処理に時間がかかりすぎました。</p>
          <p>より具体的なキーワードで再度お試しください。</p>
        </div>`;
      break;
      
    case ErrorTypes.REGEX_ERROR:
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>${error.message}</p>
          <p>キーワード "${error.details.keyword}" に特殊な文字が含まれている可能性があります。</p>
          <p>検索キーワードを変更して、再度お試しください。</p>
        </div>`;
      break;
      
    default:
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>${error.message}</p>
          <p>しばらく時間をおいて、再度お試しください。</p>
          <p>問題が続く場合は、管理者にお問い合わせください。</p>
        </div>`;
  }
});

window.proSearch = proSearch;
window.SearchError = SearchError;
window.ErrorTypes = ErrorTypes;
