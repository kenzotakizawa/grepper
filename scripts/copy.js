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
  });
});
