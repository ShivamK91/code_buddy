// CodeBuddy Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('codebuddy-widget');
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
    const currentTheme = widget.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      widget.setAttribute('data-theme', '');
      localStorage.setItem('codebuddy-theme', 'light');
    } else {
      widget.setAttribute('data-theme', 'dark');
      localStorage.setItem('codebuddy-theme', 'dark');
    }
  });
  // Set theme on load
  if (localStorage.getItem('codebuddy-theme') === 'dark') {
    widget.setAttribute('data-theme', 'dark');
  }
});
