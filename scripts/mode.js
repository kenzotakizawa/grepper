// mode.js
let isProMode = false;

document.addEventListener('DOMContentLoaded', function() {
  const normalModeButton = document.getElementById('normal-mode-button');
  const proModeButton = document.getElementById('pro-mode-button');
  const addButton = document.getElementById('add-button');
  const keywordsContainer = document.getElementById('keywords-container');

  normalModeButton.addEventListener('click', function() {
    isProMode = false;
    addButton.style.display = 'none';
    normalModeButton.innerHTML = '▶︎ Normal';
    proModeButton.innerHTML = 'Pro';
    closeMenuOverlay();
    const additionalFields = document.querySelectorAll('.search-field-wrapper:not(:first-child)');
    additionalFields.forEach(field => field.remove());
    keywordsContainer.innerHTML = '';
  });

  proModeButton.addEventListener('click', function() {
    isProMode = true;
    addButton.style.display = 'inline';
    normalModeButton.innerHTML = 'Normal';
    proModeButton.innerHTML = '▶︎ Pro';
    closeMenuOverlay();
  });

  function closeMenuOverlay() {
    document.getElementById('menu-overlay').style.display = 'none';
  }
});
