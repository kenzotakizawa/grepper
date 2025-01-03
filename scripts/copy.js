// copy.js
document.addEventListener('DOMContentLoaded', function() {
  const copyButton = document.getElementById('copy-button');
  copyButton.addEventListener('click', function() {
    const results = document.getElementById('results');
    const range = document.createRange();
    range.selectNode(results);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    // コピー成功時の視覚的フィードバック
    const copyIcon = copyButton.querySelector('img');
    if (copyIcon) {
      copyIcon.src = "https://img.icons8.com/ios-filled/24/ffffff/checkmark.png";
      setTimeout(() => {
        copyIcon.src = "https://img.icons8.com/ios-filled/24/ffffff/copy.png";
      }, 2000);
    }
  });
});
