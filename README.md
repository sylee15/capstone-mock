# Miro API usability extension

This is a ChatGPT-only Chrome extension for usability testing.

## What is real
- Conversation scraping from the ChatGPT page
- Miro pet injected into the page
- Live session reflection from the OpenAI API
- Side panel rendering of that reflection

## What is mocked
- The full dashboard page opened by `View full dashboard →`

## Setup
1. Go to `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select this folder
5. Open the extension popup and save an OpenAI API key
6. Refresh ChatGPT
7. Talk with ChatGPT for at least 4 turns
8. Click Miro

## Note on security
For this usability prototype, the API key is stored in extension local storage. That is okay for short internal testing, but not secure enough for a production release.
