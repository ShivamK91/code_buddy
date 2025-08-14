// CodeBuddy Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.codebuddy-tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabContents.forEach(tc => tc.style.display = 'none');
      document.getElementById('tab-' + btn.dataset.tab).style.display = '';
    });
  });

  // Theme toggle logic
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', '');
      localStorage.setItem('codebuddy-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('codebuddy-theme', 'dark');
    }
  });
  // Set theme on load
  if (localStorage.getItem('codebuddy-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});
