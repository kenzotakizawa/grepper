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

  if (urlParams.has('proKeywords')) {
    const proKeywords = JSON.parse(urlParams.get('proKeywords'));
    proKeywords.forEach(({ keyword, nBefore, nAfter }) => {
      addKeywordTagWithContext(keyword, nBefore, nAfter);
    });
  }
});

function generateNormalModeLink() {
  const inputElement = document.getElementById('search-query');
  if (inputElement) {
    console.log("Input element found:", inputElement);
  } else {
    console.error("Input element not found.");
  }

  const inputText = inputElement.value.trim();
  console.log("Input text:", inputText);

  if (!inputText) {
    alert("キーワードを入力してください。");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('keywords', inputText);
  console.log("Generated URL:", url.toString());
  copyToClipboard(url.toString());
  changeLinkIconToCheck();
}

function generateProModeLink() {
  const keywordsWithContext = window.getKeywordsWithContext();
  console.log("Keywords with context:", keywordsWithContext);
  if (keywordsWithContext.length === 0) {
    alert("キーワードを登録してください。");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('proKeywords', JSON.stringify(keywordsWithContext));
  console.log("Generated URL:", url.toString());
  copyToClipboard(url.toString());
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function changeLinkIconToCheck() {
  const linkIcon = document.getElementById('link-icon');
  if (linkIcon) {
    linkIcon.src = "https://img.icons8.com/ios-filled/50/FFFFFF/checkmark.png";
  } else {
    console.error("Link icon element not found.");
  }
}

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}
