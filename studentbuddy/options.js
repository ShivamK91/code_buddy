// CodeBuddy Options Script
// Handles saving/loading Gemini API key and theme toggle

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('gemini-api-key');
  const form = document.getElementById('api-key-form');
  const statusMsg = document.getElementById('status-message');
  const optionsContainer = document.getElementById('codebuddy-options-container');
  const themeToggle = document.getElementById('options-theme-toggle');

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

  // Theme toggle logic for options page
  themeToggle.addEventListener('click', () => {
    const currentTheme = optionsContainer.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      optionsContainer.setAttribute('data-theme', '');
      localStorage.setItem('codebuddy-theme', 'light');
    } else {
      optionsContainer.setAttribute('data-theme', 'dark');
      localStorage.setItem('codebuddy-theme', 'dark');
    }
  });
  // Set theme on load
  if (localStorage.getItem('codebuddy-theme') === 'dark') {
    optionsContainer.setAttribute('data-theme', 'dark');
  }
});
