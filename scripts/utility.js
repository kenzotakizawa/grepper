document.addEventListener('DOMContentLoaded', function() {
  // ローディングアニメーションを非表示にする初期設定
  const loadingIndicator = document.getElementById('loading-indicator');
  loadingIndicator.style.display = 'none';

  // 初期状態でNormalモードを選択
  const normalModeButton = document.getElementById('normal-mode-button');
  const proModeButton = document.getElementById('pro-mode-button');
  const searchContainer = document.getElementById('search-fields');
  const keywordsContainer = document.getElementById('keywords-container');
  const addButton = document.getElementById('add-button'); // addButtonの定義をここに移動
  let isProMode = false;

  // 初期状態でNormalモードを示す
  normalModeButton.innerHTML = '▶︎ Normal';
  proModeButton.innerHTML = 'Pro';

  document.getElementById('upload-button').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt'; // テキストファイルのみを受け入れる
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          document.getElementById('input-text').value = e.target.result;
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

  document.getElementById('copy-button').addEventListener('click', function() {
    const resultsContainer = document.getElementById('results');
    const range = document.createRange();
    range.selectNode(resultsContainer);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    const copyButton = document.getElementById('copy-button');
    const copyIcon = copyButton.querySelector('img');

    try {
      document.execCommand('copy');
      copyIcon.src = 'https://img.icons8.com/ios-filled/50/00FF00/checkmark.png'; // 成功時のチェックアイコン
    } catch (err) {
      copyIcon.src = 'https://img.icons8.com/ios-filled/50/FF0000/delete-sign.png'; // 失敗時のバツアイコン
    }

    setTimeout(() => {
      copyIcon.src = 'https://img.icons8.com/ios-filled/50/ffffff/copy.png'; // 元のコピーアイコン
    }, 2000); // 2秒後に元のアイコンに戻す

    window.getSelection().removeAllRanges();
  });

  // メニューアイコンとメニューオーバーレイについて
  const menuButton = document.querySelector('.nav img[alt="メニューアイコン"]');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuCloseButton = document.getElementById('menu-close');

  menuButton.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });

  // メニューオーバーレイを閉じる関数
  function closeMenuOverlay() {
    menuOverlay.style.display = 'none';
  }

  // 閉じるボタンのクリックイベント
  menuCloseButton.addEventListener('click', closeMenuOverlay);

  // オーバーレイ外のクリックイベント
  menuOverlay.addEventListener('click', function(event) {
    if (event.target === menuOverlay) {
      closeMenuOverlay();
    }
  });

  // NormalモードとProモードの切り替えについて
  normalModeButton.addEventListener('click', function() {
    isProMode = false;
    addButton.style.display = 'none'; // Normalモードでは非表示
    normalModeButton.innerHTML = '▶︎ Normal';
    proModeButton.innerHTML = 'Pro';
    closeMenuOverlay(); 
    const additionalFields = searchContainer.querySelectorAll('.search-field-wrapper:not(:first-child)');
    additionalFields.forEach(field => field.remove());
    keywordsContainer.innerHTML = '';
  });

  proModeButton.addEventListener('click', function() {
    isProMode = true;
    addButton.style.display = 'inline'; // Proモードでは表示
    normalModeButton.innerHTML = 'Normal';
    proModeButton.innerHTML = '▶︎ Pro';
    closeMenuOverlay();
  });

  // ヘルプオーバーレイについて
  const helpButton = document.querySelector('.nav img[alt="ヘルプアイコン"]');
  const helpOverlay = document.getElementById('help-overlay');
  const helpCloseButton = document.getElementById('help-close');

  helpButton.addEventListener('click', function() {
    helpOverlay.style.display = 'flex';
  });

  // ヘルプオーバーレイを閉じる関数
  function closeHelpOverlay() {
    helpOverlay.style.display = 'none';
  }

  // 閉じるボタンのクリックイベント
  helpCloseButton.addEventListener('click', closeHelpOverlay);

  // オーバーレイ外のクリックイベント
  helpOverlay.addEventListener('click', function(event) {
    if (event.target === helpOverlay) {
      closeHelpOverlay();
    }
  });
});
