document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const searchQueryInput = document.getElementById('search-query');

  // キーワードを追加する関数
  function addKeyword() {
    const keyword = searchQueryInput.value.trim();
    if (keyword !== '' && window.isProMode) {
      window.addKeywordTag(keyword);
      searchQueryInput.value = '';
    }
  }

  // 追加ボタンにクリックイベントリスナーを登録
  addButton.addEventListener('click', addKeyword);

  // 検索クエリ入力フィールドにEnterキー押下時のハンドラーを登録
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
  INVALID_INPUT: 'INVALID_INPUT', // 無効な入力
  TIMEOUT: 'TIMEOUT',             // タイムアウト
  REGEX_ERROR: 'REGEX_ERROR',     // 正規表現エラー
  SYSTEM_ERROR: 'SYSTEM_ERROR',   // システムエラー
  ABORTED: 'ABORTED'              // 検索中断
};

// 検索処理を担当するクラス
class SearchProcessor {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;       // タイムアウト時間の設定
    this.chunkSize = options.chunkSize || 1000;   // 処理する行数のチャンクサイズ
    this.regexCache = new Map();                  // 正規表現のキャッシュ
    this.abortController = new AbortController();  // 検索中断用のコントローラー
  }

  // 検索を中断するメソッド
  abort() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  // テキストのチャンク処理を行うメソッド
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

      // キーワードにマッチした行を処理
      if (regex.test(lines[i])) {
        const contextStart = Math.max(0, i - nBefore);
        const contextEnd = Math.min(lines.length, i + nAfter + 1);
        
        // 前後のコンテキスト行を追加
        for (let j = contextStart; j < contextEnd; j++) {
          if (!processedLines.has(j)) {
            processedLines.set(j, lines[j]);
          }
        }
      }
    }
    
    return end;
  }

  // キーワードから正規表現を取得（キャッシュを利用）
  getRegex(keyword) {
    if (!this.regexCache.has(keyword)) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this.regexCache.set(keyword, new RegExp(escapedKeyword, 'i'));
    }
    return this.regexCache.get(keyword);
  }

  // 検索を実行するメソッド
  async search(text, keywordsWithContext) {
    try {
      const lines = text.split('\n');                       // テキストを行ごとに分割
      const processedLines = new Map();                      // 処理済み行を保持するMap
      
      // 各キーワードに対して検索を実行
      for (const { keyword, nBefore, nAfter } of keywordsWithContext) {
        const regex = this.getRegex(keyword);
        let position = 0;
        
        while (position < lines.length) {
          try {
            // チャンク処理とタイムアウトを競合させる
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

      // 処理済み行をソートして配列として返す
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
}

// メイン検索プロセッサのインスタンス作成
const searchProcessor = new SearchProcessor({
  timeout: 3000,  // タイムアウトを3秒に設定
  chunkSize: 500  // 500行ずつ処理
});

// プロモードでの検索関数
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

    // 検索を実行し結果を返す
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