// LeetMentor Background Script
// Handles Gemini API requests and rate limiting

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
let lastRequestTime = 0;
const RATE_LIMIT_MS = 3000; // 1 request per 3 seconds

// Helper: Get API key from chrome.storage
function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      resolve(result.geminiApiKey || '');
    });
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.type === 'GEMINI_HINT' || request.type === 'GEMINI_SOLUTION') {
        // Rate limiting
        const now = Date.now();
        if (now - lastRequestTime < RATE_LIMIT_MS) {
          sendResponse({ error: 'Rate limit: Please wait before requesting another hint.' });
          return;
        }
        lastRequestTime = now;

        const apiKey = await getApiKey();
        if (!apiKey) {
          sendResponse({ error: 'API key not set. Please set your Gemini API key in the extension options.' });
          return;
        }

        // Prepare prompt for Gemini
        const { problem, userCode, context, mode } = request;
        let prompt = '';
        if (mode === 'hint') {
          prompt = `You are a coding mentor. The user is solving this problem: "${problem.title}\n${problem.statement}".\nTheir current code is:\n${userCode}\nGive a small, progressive hint (not the solution) to help them move forward. Do not reveal the answer.`;
        } else if (mode === 'solution') {
          prompt = `You are a coding mentor. The user is solving this problem: "${problem.title}\n${problem.statement}".\nTheir current code is:\n${userCode}\nNow, provide the full solution and a detailed explanation.`;
        }

        // Call Gemini API
        try {
          const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const data = await response.json();
          console.log('Gemini API response:', data); // Debug log
          if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            sendResponse({ result: data.candidates[0].content.parts[0].text });
          } else {
            sendResponse({ error: 'No response from Gemini API.' });
          }
        } catch (err) {
          console.error('Error contacting Gemini API:', err);
          sendResponse({ error: 'Error contacting Gemini API.' });
        }
      } else {
        // Gracefully handle unknown message types
        sendResponse({ error: 'Unknown request type.' });
      }
    } catch (err) {
      console.error('Unexpected error in background listener:', err);
      sendResponse({ error: 'Unexpected error in background script.' });
    }
  })();
  return true; // Keep the message channel open for async response
});
