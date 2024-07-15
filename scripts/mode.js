window.isProMode = false;

document.addEventListener('DOMContentLoaded', function() {
  const normalModeButton = document.getElementById('normal-mode-button');
  const proModeButton = document.getElementById('pro-mode-button');
  const addButton = document.getElementById('add-button');
  const keywordsContainer = document.getElementById('keywords-container');

  // 初期化時にNormalモードを選択状態にする
  normalModeButton.innerHTML = '▶︎ Normal';
  proModeButton.innerHTML = 'Pro';

  normalModeButton.addEventListener('click', function() {
    window.isProMode = false;
    addButton.style.display = 'none';
    normalModeButton.innerHTML = '▶︎ Normal';
    proModeButton.innerHTML = 'Pro';
    closeMenuOverlay();
    const additionalFields = document.querySelectorAll('.search-field-wrapper:not(:first-child)');
    additionalFields.forEach(field => field.remove());
    keywordsContainer.innerHTML = '';
  });

  proModeButton.addEventListener('click', function() {
    window.isProMode = true;
    addButton.style.display = 'inline';
    normalModeButton.innerHTML = 'Normal';
    proModeButton.innerHTML = '▶︎ Pro';
    closeMenuOverlay();
  });

  function closeMenuOverlay() {
    document.getElementById('menu-overlay').style.display = 'none';
  }
});
