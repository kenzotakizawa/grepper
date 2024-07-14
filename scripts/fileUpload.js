// fileUpload.js
document.addEventListener('DOMContentLoaded', function() {
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
});
