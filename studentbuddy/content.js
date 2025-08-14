// LeetMentor Content Script
// Detects supported sites, extracts problem info, and injects the floating widget

(function() {
  // Supported site matchers
  const siteMatchers = [
    {
      name: 'LeetCode',
      test: () => /leetcode\.com\/problems\//.test(window.location.href),
      getProblem: () => {
        // LeetCode DOM extraction
        const title = document.querySelector('div[data-cy="question-title"]')?.innerText || '';
        const statement = document.querySelector('.question-content__JfgR')?.innerText ||
                          document.querySelector('.content__u3I1.question-content__JfgR')?.innerText || '';
        const code = document.querySelector('textarea')?.value || '';
        return { title, statement, code };
      }
    },
    {
      name: 'HackerRank',
      test: () => /hackerrank\.com\/challenges\//.test(window.location.href),
      getProblem: () => {
        const title = document.querySelector('.challenge-header h1')?.innerText || '';
        const statement = document.querySelector('.challenge_problem_statement')?.innerText || '';
        const code = document.querySelector('textarea.inputarea')?.value || '';
        return { title, statement, code };
      }
    },
    {
      name: 'Codeforces',
      test: () => /codeforces\.com\/problemset\/problem\//.test(window.location.href),
      getProblem: () => {
        const title = document.querySelector('.problem-statement .title')?.innerText || '';
        const statement = document.querySelector('.problem-statement')?.innerText || '';
        const code = document.querySelector('textarea')?.value || '';
        return { title, statement, code };
      }
    }
  ];

  // Check if on a supported site
  const site = siteMatchers.find(s => s.test());
  if (!site) return;

  // Prevent multiple injections
  if (document.getElementById('leetmentor-widget')) return;

  // Inject styles
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(style);

  // Inject widget container
  const widget = document.createElement('div');
  widget.id = 'leetmentor-widget';
  widget.className = 'leetmentor-widget';
  widget.style.zIndex = 99999;
  widget.style.position = 'fixed';
  widget.style.bottom = '40px';
  widget.style.right = '40px';
  widget.style.width = '340px';
  widget.style.background = 'var(--lm-bg)';
  widget.style.color = 'var(--lm-text)';
  widget.style.borderRadius = '12px';
  widget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  widget.style.userSelect = 'none';
  widget.innerHTML = `
    <div class="leetmentor-header">
      <span class="leetmentor-title">Code Buddy</span>
      <button id="theme-toggle" title="Toggle Light/Dark Mode">🌓</button>
    </div>
    <div class="leetmentor-tabs">
      <button class="tab-btn active" data-tab="hints">Hints</button>
      <button class="tab-btn" data-tab="solution">Solution</button>
      <button class="tab-btn" data-tab="history">History</button>
    </div>
    <div class="leetmentor-tab-content" id="tab-hints">
      <div id="hints-list"></div>
      <textarea id="manual-problem-desc" placeholder="Problem Description (optional)" style="width:100%;min-height:40px;margin-bottom:8px;resize:vertical;"></textarea>
      <button id="get-hint-btn">Get Hint</button>
    </div>
    <div class="leetmentor-tab-content" id="tab-solution" style="display:none;">
      <div id="solution-content"></div>
      <button id="reveal-solution-btn">Reveal Solution</button>
    </div>
    <div class="leetmentor-tab-content" id="tab-history" style="display:none;">
      <div id="history-list"></div>
    </div>
  `;
  document.body.appendChild(widget);

  // Draggable logic
  let isDragging = false, offsetX = 0, offsetY = 0;
  widget.addEventListener('mousedown', function(e) {
    if (e.target.closest('.leetmentor-header')) {
      isDragging = true;
      offsetX = e.clientX - widget.getBoundingClientRect().left;
      offsetY = e.clientY - widget.getBoundingClientRect().top;
      document.body.style.userSelect = 'none';
    }
  });
  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      widget.style.left = (e.clientX - offsetX) + 'px';
      widget.style.top = (e.clientY - offsetY) + 'px';
      widget.style.right = '';
      widget.style.bottom = '';
      widget.style.position = 'fixed';
    }
  });
  document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  // Tab switching logic
  const tabBtns = widget.querySelectorAll('.tab-btn');
  const tabContents = widget.querySelectorAll('.leetmentor-tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabContents.forEach(tc => tc.style.display = 'none');
      widget.querySelector('#tab-' + btn.dataset.tab).style.display = '';
      if (btn.dataset.tab === 'history') {
        loadHistory();
      }
    });
  });

  // Theme toggle logic
  const themeToggle = widget.querySelector('#theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', '');
      localStorage.setItem('leetmentor-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('leetmentor-theme', 'dark');
    }
  });
  // Set theme on load
  if (localStorage.getItem('leetmentor-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Expose problem info for later use
  const manualDescInput = widget.querySelector('#manual-problem-desc');
  function getCurrentProblem() {
    const auto = site.getProblem();
    // If auto-extracted statement is empty, use manual input
    let statement = auto.statement;
    if (!statement && manualDescInput && manualDescInput.value.trim()) {
      statement = manualDescInput.value.trim();
    }
    return { ...auto, statement };
  }

  // --- Hint Progression and Storage Logic ---
  const hintsList = widget.querySelector('#hints-list');
  const getHintBtn = widget.querySelector('#get-hint-btn');
  const solutionContent = widget.querySelector('#solution-content');
  const revealSolutionBtn = widget.querySelector('#reveal-solution-btn');
  const historyList = widget.querySelector('#history-list');

  // Load hint history from chrome.storage
  function loadHistory() {
    const problem = getCurrentProblem();
    const key = `leetmentor-history-${problem.title}`;
    chrome.storage.local.get([key], (result) => {
      const history = result[key] || [];
      historyList.innerHTML = history.map((h, i) => `<div class="leetmentor-history-item"><b>Hint ${i+1}:</b> ${h}</div>`).join('');
    });
  }

  // Add a hint to history in chrome.storage
  function saveHint(hint) {
    const problem = getCurrentProblem();
    const key = `leetmentor-history-${problem.title}`;
    chrome.storage.local.get([key], (result) => {
      const history = result[key] || [];
      history.push(hint);
      chrome.storage.local.set({ [key]: history });
    });
  }

  // Display hints in the Hints tab
  function displayHint(hint) {
    hintsList.innerHTML += `<div class="leetmentor-hint-item">${hint}</div>`;
  }

  function displayHintChat(userMsg, extMsg) {
    const chatDiv = document.createElement('div');
    chatDiv.className = 'leetmentor-hint-chat';
    if (userMsg) {
      const userDiv = document.createElement('div');
      userDiv.className = 'leetmentor-hint-msg user';
      userDiv.textContent = userMsg;
      chatDiv.appendChild(userDiv);
    }
    if (extMsg) {
      const extDiv = document.createElement('div');
      extDiv.className = 'leetmentor-hint-msg ext';
      // Prefix with 'Code Buddy: '
      extDiv.textContent = 'Code Buddy: ' + extMsg;
      chatDiv.appendChild(extDiv);
    }
    hintsList.appendChild(chatDiv);
    hintsList.scrollTop = hintsList.scrollHeight;
  }

  // Handle Get Hint button
  getHintBtn.addEventListener('click', () => {
    const problem = getCurrentProblem();
    const userCode = problem.code;
    if (!problem.statement) {
      displayHintChat('User asked for a hint', 'Please enter the problem description above.');
      return;
    }
    displayHintChat('User asked for a hint', 'Loading hint...');
    let responded = false;
    chrome.runtime.sendMessage({
      type: 'GEMINI_HINT',
      problem,
      userCode,
      context: '',
      mode: 'hint'
    }, (response) => {
      responded = true;
      // Remove the last chat (loading)
      if (hintsList.lastChild) hintsList.removeChild(hintsList.lastChild);
      if (chrome.runtime.lastError) {
        displayHintChat('User asked for a hint', 'Error: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response && response.result) {
        displayHintChat('User asked for a hint', response.result);
        saveHint(response.result);
      } else {
        displayHintChat('User asked for a hint', response?.error || 'Error getting hint.');
      }
    });
    // Fallback in case callback is never called
    setTimeout(() => {
      if (!responded) {
        if (hintsList.lastChild) hintsList.removeChild(hintsList.lastChild);
        displayHintChat('User asked for a hint', 'Error: No response from background script.');
      }
    }, 5000);
  });

  // Handle Reveal Solution button
  revealSolutionBtn.addEventListener('click', () => {
    const problem = getCurrentProblem();
    const userCode = problem.code;
    solutionContent.innerHTML = 'Loading solution...';
    chrome.runtime.sendMessage({
      type: 'GEMINI_SOLUTION',
      problem,
      userCode,
      context: '',
      mode: 'solution'
    }, (response) => {
      if (response && response.result) {
        solutionContent.innerText = response.result;
      } else {
        solutionContent.innerText = response?.error || 'Error getting solution.';
      }
    });
  });

  // On load, show history in History tab if selected
  if (widget.querySelector('.tab-btn.active').dataset.tab === 'history') {
    loadHistory();
  }

  // TODO: Add logic to update problem info on navigation (for SPAs)
})();
