// addKeywordTag.js
let keywordIdCounter = 1;
let currentForm = null;

class FormManager {
  constructor() {
    this.forms = new Map();
    this.listeners = new WeakMap();
    this.formValues = new Map();
  }

  createForm(keywordTag, keyword) {
    const formId = keywordTag.getAttribute('data-id');
    const escapedKeyword = escapeHtml(keyword);
    
    const savedValues = this.formValues.get(formId) || { before: '0', after: '0' };
    
    this.removeForm(formId);

    const form = document.createElement('div');
    form.className = 'form-container';
    form.setAttribute('data-id', formId);
    form.innerHTML = `
      <label>対象キーワード "${escapedKeyword}" のN行前も含む</label>
      <div class="input-group">
        <input type="number" value="${savedValues.before}" id="nBefore-${escapedKeyword}">
      </div>
      <label>対象キーワード "${escapedKeyword}" のN行後も含む</label>
      <div class="input-group">
        <input type="number" value="${savedValues.after}" id="nAfter-${escapedKeyword}">
      </div>
    `;

    const beforeInput = form.querySelector(`input[id^="nBefore-"]`);
    const afterInput = form.querySelector(`input[id^="nAfter-"]`);

    const updateValues = () => {
      this.formValues.set(formId, {
        before: beforeInput.value,
        after: afterInput.value
      });
    };

    beforeInput.addEventListener('change', updateValues);
    afterInput.addEventListener('change', updateValues);

    const listeners = {
      mouseenter: () => form.setAttribute('data-hover', 'true'),
      mouseleave: (event) => {
        form.removeAttribute('data-hover');
        this.hideForm(event, keywordTag);
      }
    };

    Object.entries(listeners).forEach(([event, handler]) => {
      form.addEventListener(event, handler);
    });

    this.listeners.set(form, listeners);
    this.forms.set(formId, form);

    return form;
  }

  hideForm(event, keywordTag) {
    const formId = keywordTag.getAttribute('data-id');
    const form = this.forms.get(formId);
    
    if (form && !form.getAttribute('data-hover')) {
      const beforeInput = form.querySelector('input[id^="nBefore-"]');
      const afterInput = form.querySelector('input[id^="nAfter-"]');
      
      this.formValues.set(formId, {
        before: beforeInput.value,
        after: afterInput.value
      });
      
      form.style.display = 'none';
    }
  }

  removeForm(formId) {
    const form = this.forms.get(formId);
    if (form) {
      const beforeInput = form.querySelector('input[id^="nBefore-"]');
      const afterInput = form.querySelector('input[id^="nAfter-"]');
      
      if (beforeInput && afterInput) {
        this.formValues.set(formId, {
          before: beforeInput.value,
          after: afterInput.value
        });
      }

      const listeners = this.listeners.get(form);
      if (listeners) {
        Object.entries(listeners).forEach(([event, handler]) => {
          form.removeEventListener(event, handler);
        });
      }
      form.remove();
      this.forms.delete(formId);
    }
  }

  getFormValues(formId) {
    return this.formValues.get(formId) || { before: '0', after: '0' };
  }

  cleanup() {
    for (const formId of this.forms.keys()) {
      this.removeForm(formId);
    }
  }
}

const formManager = new FormManager();

function addKeywordTag(keyword) {
  const keywordsContainer = document.getElementById('keywords-container');
  const keywordTag = document.createElement('div');
  keywordTag.className = 'keyword-tag';
  keywordTag.textContent = keyword;
  keywordTag.setAttribute('data-id', `keyword-${keywordIdCounter}`);
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
  
  const form = formManager.createForm(keywordTag, keyword);
  document.body.appendChild(form);

  const rect = keywordTag.getBoundingClientRect();
  form.style.top = `${rect.top + window.scrollY + 20}px`;
  form.style.left = `${rect.left + window.scrollX}px`;
  form.style.display = 'block';
}

function hideForm(event, keywordTag) {
  const relatedTarget = event.relatedTarget;
  const formId = keywordTag.getAttribute('data-id');
  const form = document.querySelector(`.form-container[data-id="${formId}"]`);

  if (!relatedTarget || (keywordTag.contains(relatedTarget) || (form && form.contains(relatedTarget)))) {
    return;
  }

  setTimeout(() => {
    if (form && !form.getAttribute('data-hover')) {
      form.style.display = 'none';
    }
  }, 100);
}

window.getKeywordsWithContext = () => {
  const keywordTags = document.querySelectorAll('.keyword-tag');
  return Array.from(keywordTags).map(tag => {
    const keyword = tag.textContent.replace('×', '').trim();
    const formId = tag.getAttribute('data-id');
    const values = formManager.getFormValues(formId);
    
    return {
      keyword,
      nBefore: parseInt(values.before) || 0,
      nAfter: parseInt(values.after) || 0
    };
  });
};

window.addEventListener('beforeunload', () => {
  formManager.cleanup();
});

window.addKeywordTag = addKeywordTag;
window.showForm = showForm;
window.hideForm = hideForm;
window.getKeywordsWithContext = getKeywordsWithContext;
