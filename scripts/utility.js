let isProMode = false;

document.addEventListener('DOMContentLoaded', function() {
  // ローディングアニメーションを非表示にする初期設定
  const loadingIndicator = document.getElementById('loading-indicator');
  loadingIndicator.style.display = 'none';

  // 初期状態でNormalモードを選択
  const normalModeButton = document.getElementById('normal-mode-button');
  const proModeButton = document.getElementById('pro-mode-button');
  const searchContainer = document.getElementById('search-fields');
  const keywordsContainer = document.getElementById('keywords-container');
  const addButton = document.getElementById('add-button');

  // 初期状態でNormalモードを示す
  normalModeButton.innerHTML = '▶︎ Normal';
  proModeButton.innerHTML = 'Pro';

  document.getElementById('upload-button').addEventListener('click', function() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';
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
          copyIcon.src = 'https://img.icons8.com/ios-filled/50/00FF00/checkmark.png';
      } catch (err) {
          copyIcon.src = 'https://img.icons8.com/ios-filled/50/FF0000/delete-sign.png';
      }

      setTimeout(() => {
          copyIcon.src = 'https://img.icons8.com/ios-filled/50/ffffff/copy.png';
      }, 2000);

      window.getSelection().removeAllRanges();
  });

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

  normalModeButton.addEventListener('click', function() {
      isProMode = false;
      addButton.style.display = 'none';
      normalModeButton.innerHTML = '▶︎ Normal';
      proModeButton.innerHTML = 'Pro';
      closeMenuOverlay();
      const additionalFields = searchContainer.querySelectorAll('.search-field-wrapper:not(:first-child)');
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

  function attachFormHoverEvents(tag, form) {
      tag.addEventListener('mouseenter', function() {
          const rect = tag.getBoundingClientRect();
          form.style.top = `${rect.bottom + window.scrollY}px`;
          form.style.left = `${rect.left + window.scrollX}px`;
          form.style.display = 'block';
      });

      tag.addEventListener('mouseleave', function() {
          form.style.display = 'none';
      });

      form.addEventListener('mouseenter', function() {
          form.style.display = 'block';
      });

      form.addEventListener('mouseleave', function() {
          form.style.display = 'none';
      });
  }

  function createForm() {
      const form = document.createElement('div');
      form.className = 'form-container';
      form.innerHTML = `
          <label>対象キーワードのN行前も含む</label>
          <div class="input-group">
            <input type="number" value="1">
          </div>
          <label>対象キーワードのN行後も含む</label>
          <div class="input-group">
            <input type="number" value="0">
          </div>
      `;
      document.body.appendChild(form);
      return form;
  }

  function addKeywordTag(keyword) {
      const keywordTag = document.createElement('div');
      keywordTag.className = 'keyword-tag';
      keywordTag.textContent = keyword;

      const removeButton = document.createElement('button');
      removeButton.textContent = '×';
      removeButton.addEventListener('click', function() {
          keywordsContainer.removeChild(keywordTag);
      });

      keywordTag.appendChild(removeButton);
      keywordsContainer.appendChild(keywordTag);

      const form = createForm();
      attachFormHoverEvents(keywordTag, form);
  }

  addButton.addEventListener('click', function() {
    if (isProMode) {
      const searchQueryInput = document.getElementById('search-query');
      const keyword = searchQueryInput.value.trim();
      if (keyword !== '') {
        addKeywordTag(keyword);
        searchQueryInput.value = '';
      }
    }
  });

  document.getElementById('search-query').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchQueryInput = document.getElementById('search-query');
      const keyword = searchQueryInput.value.trim();
      if (isProMode && keyword !== '') {
        addKeywordTag(keyword);
        searchQueryInput.value = '';
      } else if (!isProMode) {
        // Normalモードの場合は検索を実行し、タグ化しない
        document.getElementById('search-button').click();
      }
    }
  });
});
