# LeetMentor Chrome Extension

A mentor-like Chrome extension that guides you step-by-step while solving coding problems on LeetCode, HackerRank, and Codeforces. Powered by Google Gemini API, LeetMentor provides progressive hints and only reveals the full solution when explicitly requested.

---

## Features
- 🧑‍🏫 Floating, draggable widget on supported coding sites
- 💡 Progressive, AI-generated hints (never the full solution unless asked)
- 📝 Solution and hint history tabs
- 🌗 Light & dark mode support
- 🔒 Secure API key storage (never hardcoded)
- 🏷️ Minimal, modern design

---

## Installation

1. **Download & Unzip**
   - Download this repository as a ZIP and unzip it to a folder (e.g., `LeetMentor/`).

2. **Set Up Gemini API Key**
   - Get your [Google Gemini API key](https://aistudio.google.com/app/apikey).
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" (top right).
   - Click "Load unpacked" and select your `LeetMentor/` folder.
   - Click "Details" on LeetMentor, then "Extension options".
   - Enter your Gemini API key and save.

3. **Ready to Use!**
   - Visit a problem page on LeetCode, HackerRank, or Codeforces.
   - The LeetMentor widget will appear in the bottom right.

---

## Usage

- **Hints Tab:**
  - Click "Get Hint" to receive a small, progressive hint for the current problem and your code.
  - Hints are stored in the History tab for review.
- **Solution Tab:**
  - Click "Reveal Solution" to get the full solution and explanation (only if you want it!).
- **History Tab:**
  - View all hints you've received for the current problem.
- **Theme Toggle:**
  - Use the 🌓 button to switch between light and dark mode.

---

## API Key Security
- Your Gemini API key is stored securely in Chrome local storage.
- **Never** hardcode your API key in the codebase.
- If you wish to use environment variables for local development, create a `.env` file (not used in production extension):
  ```env
  GEMINI_API_KEY=your-key-here
  ```
  For the extension, always use the options page to set the key.

---

## File Structure

```
LeetMentor/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── options.html
├── options.js
├── styles.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## Sample Test Scenarios

1. **LeetCode Problem Page**
   - Go to a LeetCode problem (e.g., https://leetcode.com/problems/two-sum/).
   - The widget appears. Click "Get Hint". You should receive a small nudge, not the full answer.
   - Click again for a stronger hint. Hints are saved in History.
   - Click "Reveal Solution" to get the full solution and explanation.

2. **HackerRank/Codeforces**
   - Repeat the above steps on a supported problem page.

3. **Theme Switching**
   - Toggle between light and dark mode. The widget updates instantly.

4. **API Key Error**
   - Remove your API key in options and try to get a hint. You should see an error message.

---

## Troubleshooting

### 1. Widget does not appear
- Make sure you are on a supported problem page (see README for supported URLs).
- Refresh the page after installing or updating the extension.
- Check that the extension is enabled in `chrome://extensions/`.

### 2. Hints or solution not loading
- Ensure your Gemini API key is set in the extension options.
- Check your internet connection.
- Wait a few seconds between hint requests (rate limiting is enforced).
- If you see a rate limit error, wait 3+ seconds before trying again.

### 3. API key issues
- Double-check your API key in the options page.
- If you change your key, click "Save" and refresh your problem page.
- Your key is stored securely in Chrome local storage and never sent to any server except Google Gemini.

### 4. Styling or UI issues
- Try toggling light/dark mode.
- If the widget overlaps with site UI, drag it to a new position.
- If styles look broken, try refreshing the page.

### 5. Still not working?
- Open the Chrome DevTools console and check for errors (right-click the page > Inspect > Console).
- Try removing and re-adding the extension.
- If the problem persists, open an issue with your Chrome version, OS, and a screenshot if possible.

---

## Deployment & Packaging

- To update or share, zip the entire `LeetMentor/` folder (except any `.env` files).
- Upload the ZIP in Chrome Extensions Developer Mode or share with others.

---

## Contributing & Support
- PRs and issues welcome!
- For bug reports, please include your Chrome version, OS, and a screenshot if possible.

---

## License
MIT
