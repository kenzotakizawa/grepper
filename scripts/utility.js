// utility.js
document.addEventListener('DOMContentLoaded', function() {
    // ローディングアニメーションを非表示にする初期設定
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'none';
  
    // メニューとヘルプのオーバーレイ設定
    const menuButton = document.querySelector('.nav img[alt="メニューアイコン"]');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuCloseButton = document.getElementById('menu-close');
  
    menuButton.addEventListener('click', function() {
      menuOverlay.style.display = 'flex';
    });
  
    function closeMenuOverlay() {
      menuOverlay.style.display = 'none';
    }
  
    menuCloseButton.addEventListener('click', closeMenuOverlay);
  
    menuOverlay.addEventListener('click', function(event) {
      if (event.target === menuOverlay) {
        closeMenuOverlay();
      }
    });
  
    const helpButton = document.querySelector('.nav img[alt="ヘルプアイコン"]');
    const helpOverlay = document.getElementById('help-overlay');
    const helpCloseButton = document.getElementById('help-close');
  
    helpButton.addEventListener('click', function() {
      helpOverlay.style.display = 'flex';
    });
  
    function closeHelpOverlay() {
      helpOverlay.style.display = 'none';
    }
  
    helpCloseButton.addEventListener('click', closeHelpOverlay);
  
    helpOverlay.addEventListener('click', function(event) {
      if (event.target === helpOverlay) {
        closeHelpOverlay();
      }
    });
  });
  