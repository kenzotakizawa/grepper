document.addEventListener('DOMContentLoaded', function() {
  const linkButton = document.getElementById('link-button');

  linkButton.addEventListener('click', function() {
    if (window.isProMode) {
      console.log("Pro mode detected.");
      generateProModeLink();
    } else {
      console.log("Normal mode detected.");
      generateNormalModeLink();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('keywords')) {
    const keywords = urlParams.get('keywords');
    document.getElementById('search-query').value = keywords;
  }
});

function generateNormalModeLink() {
  const inputElement = document.getElementById('search-query');
  const inputText = inputElement.value.trim();

  if (!inputText) {
    alert("キーワードを入力してください。");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('keywords', inputText);
  copyToClipboard(url.toString());
  changeLinkIconToCheck();
}

class ClipboardManager {
  constructor() {
    this.fallbackInProgress = false;
  }

  async copyToClipboard(text) {
    if (await this.tryModernCopy(text)) {
      return true;
    }
    return await this.tryFallbackCopy(text);
  }

  async tryModernCopy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn('Modern clipboard API failed:', error);
    }
    return false;
  }

  async tryFallbackCopy(text) {
    if (this.fallbackInProgress) {
      return false;
    }

    this.fallbackInProgress = true;
    const textArea = document.createElement('textarea');
    
    try {
      // テキストエリアの設定
      textArea.value = text;
      textArea.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointerEvents: none;
      `;
      
      document.body.appendChild(textArea);
      
      // モバイルデバイスの対応
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        textArea.contentEditable = true;
        textArea.readOnly = false;
        
        const range = document.createRange();
        range.selectNodeContents(textArea);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }

      const success = document.execCommand('copy');
      return success;

    } catch (error) {
      console.error('Fallback clipboard operation failed:', error);
      return false;
      
    } finally {
      document.body.removeChild(textArea);
      this.fallbackInProgress = false;
    }
  }
}

const clipboardManager = new ClipboardManager();

function changeLinkIconToCheck() {
  const linkIcon = document.getElementById('link-button');
  if (linkIcon) {
    linkIcon.src = "https://img.icons8.com/ios-filled/20/FFFFFF/checkmark.png";
    setTimeout(() => {
      linkIcon.src = "https://img.icons8.com/ios-filled/20/ffffff/link.png";
    }, 2000);
  }
}

async function generateProModeLink() {
  try {
    const keywordsWithContext = window.getKeywordsWithContext();
    
    if (keywordsWithContext.length === 0) {
      showNotification('検索キーワードを追加してください。', 'error');
      return;
    }

    const url = new URL(window.location.href);
    url.search = '';
    
    keywordsWithContext.forEach(({ keyword, nBefore, nAfter }) => {
      url.searchParams.append('q', keyword);
      url.searchParams.append('before', nBefore.toString());
      url.searchParams.append('after', nAfter.toString());
    });

    const success = await clipboardManager.copyToClipboard(url.toString());
    
    if (success) {
      showNotification('リンクをコピーしました！', 'success');
      changeLinkIconToCheck();
    } else {
      showNotification('リンクのコピーに失敗しました。', 'error');
    }

  } catch (error) {
    console.error('リンク生成エラー:', error);
    showNotification('リンクの生成中にエラーが発生しました。', 'error');
  }
}

// 通知表示用の関数
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // スタイルの設定
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '1000';
  
  // 通知タイプに応じたスタイル
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      notification.style.color = 'white';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
      notification.style.color = 'white';
  }
  
  document.body.appendChild(notification);
  
  // 3秒後に通知を消す
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// エクスポート
window.generateProModeLink = generateProModeLink;
