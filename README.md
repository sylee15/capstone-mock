# Miro API usability extension

This is a ChatGPT-only Chrome extension for usability testing.

## What is real
- Conversation scraping from the ChatGPT page
- Miro pet injected into the page
- Live session reflection from the OpenAI API
- Side panel rendering of that reflection
- Incremental same-session rereads so reopening Miro can build on the last reflection instead of always rereading the full visible chat

## What is mocked
- The full dashboard page opened by `View full dashboard →`

## Dashboard direction
- The side panel is the main analysis surface and will eventually feed the full dashboard.
- The long-term dashboard should be API-backed, but cost-aware:
  - store compact structured reflection data from each Miro read
  - reuse that saved data for dashboard charts and trends
  - avoid re-sending old full chat histories when a cached reflection already exists
  - reserve higher-cost model calls for occasional synthesis across many sessions

## Current prototype note
- Within one active ChatGPT session, Miro now keeps a lightweight local memory of the last reflection and prior open instances.
- If the user opens Miro again later in the same chat, the next API call can send:
  - the previous structured reflection
  - only the new messages since that last read
- This is meant to model a lower-cost future pipeline where the dashboard grows from saved side-panel data rather than repeated full-session rereads.

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
