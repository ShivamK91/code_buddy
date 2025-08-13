// LeetMentor Options Script
// Handles saving/loading Gemini API key

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('gemini-api-key');
  const form = document.getElementById('api-key-form');
  const statusMsg = document.getElementById('status-message');

  // Load saved API key (if any)
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Save API key on form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = apiKeyInput.value.trim();
    if (!key) {
      statusMsg.textContent = 'API key cannot be empty.';
      statusMsg.style.color = 'red';
      return;
    }
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      statusMsg.textContent = 'API key saved!';
      statusMsg.style.color = 'green';
    });
  });
});
