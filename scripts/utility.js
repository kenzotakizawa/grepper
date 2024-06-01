document.addEventListener('DOMContentLoaded', function() {
  // ローディングアニメーションを非表示にする初期設定
  const loadingIndicator = document.getElementById('loading-indicator');
  loadingIndicator.style.display = 'none';

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
  const normalModeButton = document.getElementById('normal-mode-button');
  const proModeButton = document.getElementById('pro-mode-button');
  const menuCloseButton = document.getElementById('menu-close');

  const normalIndicator = document.createElement('span');
  normalIndicator.textContent = '▶︎';
  normalIndicator.classList.add('indicator');
  normalModeButton.prepend(normalIndicator);

  const proIndicator = document.createElement('span');
  proIndicator.textContent = '▶︎';
  proIndicator.classList.add('indicator');
  proModeButton.prepend(proIndicator);

  // 初期状態でNormalモードを選択
  normalIndicator.style.display = 'inline';

  menuButton.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });

  normalModeButton.addEventListener('click', function() {
    alert('Normalモードが選択されました');
    normalIndicator.style.display = 'inline';
    proIndicator.style.display = 'none';
    menuOverlay.style.display = 'none';
  });

  proModeButton.addEventListener('click', function() {
    alert('Proモードが選択されました');
    proIndicator.style.display = 'inline';
    normalIndicator.style.display = 'none';
    menuOverlay.style.display = 'none';
  });

  menuCloseButton.addEventListener('click', function() {
    menuOverlay.style.display = 'none';
  });

  // メニューオーバーレイ外がクリックされたときにオーバーレイを非表示
  menuOverlay.addEventListener('click', function(event) {
    if (event.target === menuOverlay) {
      menuOverlay.style.display = 'none';
    }
  });

  // ヘルプアイコンとヘルプオーバーレイの要素を取得
  const helpIcon = document.querySelector('.nav img[alt="ヘルプアイコン"]');
  const helpOverlay = document.getElementById('help-overlay');
  const helpClose = document.getElementById('help-close');

  // ヘルプアイコンがクリックされたときにオーバーレイを表示
  helpIcon.addEventListener('click', function() {
    helpOverlay.style.display = 'flex';
  });

  // ヘルプオーバーレイ外がクリックされたときにオーバーレイを非表示
  helpOverlay.addEventListener('click', function(event) {
    if (event.target === helpOverlay) {
      helpOverlay.style.display = 'none';
    }
  });

  // ヘルプポップアップ内の閉じるボタンがクリックされたときにオーバーレイを非表示
  helpClose.addEventListener('click', function() {
    helpOverlay.style.display = 'none';
  });
});
