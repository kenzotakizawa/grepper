// addKeywordTag.js
let keywordIdCounter = 1; // ユニークなIDカウンター、1から開始
let currentForm = null; // 現在表示されているフォームを追跡

function addKeywordTag(keyword) {
  const keywordsContainer = document.getElementById('keywords-container');
  const keywordTag = document.createElement('div');
  keywordTag.className = 'keyword-tag';
  keywordTag.textContent = keyword;
  keywordTag.setAttribute('data-id', `keyword-${keywordIdCounter}`); // ユニークIDを設定
  keywordIdCounter++;

  const removeButton = document.createElement('button');
  removeButton.textContent = '×';
  removeButton.addEventListener('click', function() {
    keywordsContainer.removeChild(keywordTag);
    const form = document.querySelector(`.form-container[data-id="keyword-${keywordTag.getAttribute('data-id')}"]`);
    if (form) {
      form.remove();
    }
  });

  keywordTag.appendChild(removeButton);
  keywordsContainer.appendChild(keywordTag);

  // フォーム表示用のイベントリスナー追加
  keywordTag.addEventListener('mouseenter', showForm);
  keywordTag.addEventListener('mouseleave', (event) => hideForm(event, keywordTag));
}

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function showForm(event) {
  const keywordTag = event.currentTarget;
  const keyword = keywordTag.textContent.replace('×', '').trim();
  const escapedKeyword = escapeHtml(keyword);
  const formId = keywordTag.getAttribute('data-id');
  let form = document.querySelector(`.form-container[data-id="${formId}"]`);

  if (form) {
    form.style.display = 'block';
  } else {
    form = document.createElement('div');
    form.className = 'form-container';
    form.innerHTML = `
        <label>対象キーワード "${escapedKeyword}" のN行前も含む</label>
        <div class="input-group">
          <input type="number" value="0" id="nBefore-${escapedKeyword}">
        </div>
        <label>対象キーワード "${escapedKeyword}" のN行後も含む</label>
        <div class="input-group">
          <input type="number" value="0" id="nAfter-${escapedKeyword}">
        </div>
    `;
    form.setAttribute('data-id', formId); // フォームにIDを設定
    document.body.appendChild(form);

    const rect = keywordTag.getBoundingClientRect();
    form.style.top = `${rect.top + window.scrollY + 20}px`; // 位置調整
    form.style.left = `${rect.left + window.scrollX}px`;
    form.style.display = 'block';

    // フォームに対するイベントリスナー追加
    form.addEventListener('mouseenter', () => {
      form.setAttribute('data-hover', 'true');
    });
    form.addEventListener('mouseleave', (event) => {
      form.removeAttribute('data-hover');
      hideForm(event, keywordTag);
    });
  }

  currentForm = form;
}

function hideForm(event, keywordTag) {
  const relatedTarget = event.relatedTarget;
  const formId = keywordTag.getAttribute('data-id');
  const form = document.querySelector(`.form-container[data-id="${formId}"]`);

  if (!relatedTarget || (keywordTag.contains(relatedTarget) || (form && form.contains(relatedTarget)))) {
    return; // マウスがフォーム内に移動した場合は何もしない
  }

  setTimeout(() => {
    if (form && !form.getAttribute('data-hover')) {
      form.style.display = 'none';
    }
  }, 100);
}

// グローバルスコープに関数を配置
window.addKeywordTag = addKeywordTag;
window.showForm = showForm;
window.hideForm = hideForm;
