document.addEventListener('DOMContentLoaded', function() {
  const linkButton = document.getElementById('link-button');

  linkButton.addEventListener('click', function() {
    if (window.isProMode) {
      console.log("Pro mode detected.");
      generateNormalModeLink();
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

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function changeLinkIconToCheck() {
  const linkIcon = document.getElementById('link-button');
  if (linkIcon) {
    linkIcon.src = "https://img.icons8.com/ios-filled/20/FFFFFF/checkmark.png";
    setTimeout(() => {
      linkIcon.src = "https://img.icons8.com/ios-filled/20/ffffff/link.png";
    }, 2000);
  }
}
