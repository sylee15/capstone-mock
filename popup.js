const apiKeyInput = document.getElementById('apiKey');
const status = document.getElementById('status');

init();

document.getElementById('saveBtn').addEventListener('click', saveKey);
document.getElementById('clearBtn').addEventListener('click', clearKey);

async function init() {
  try {
    const { apiKey } = await chrome.storage.local.get(['apiKey']);
    if (!apiKey) {
      setStatus('Add a raw OpenAI key to let Miro reflect on chats.', 'muted');
      return;
    }

    const sanitized = sanitizeApiKey(apiKey);
    apiKeyInput.value = sanitized || apiKey.trim();

    if (sanitized) {
      setStatus('API key loaded.', 'success');
    } else {
      setStatus('The saved key looks off. Paste the raw OpenAI key again.', 'error');
    }
  } catch (error) {
    setStatus("I couldn't load the saved key.", 'error');
  }
}

async function saveKey() {
  const rawValue = apiKeyInput.value;
  const sanitized = sanitizeApiKey(rawValue);

  if (!rawValue.trim()) {
    await clearKey();
    return;
  }

  if (!sanitized) {
    setStatus('Use the raw OpenAI key only. Remove "Bearer", spaces, or any extra characters.', 'error');
    return;
  }

  try {
    await chrome.storage.local.set({ apiKey: sanitized });
    apiKeyInput.value = sanitized;
    setStatus('Saved. Miro can use this key for live reflection.', 'success');
  } catch (error) {
    setStatus("I couldn't save that key.", 'error');
  }
}

async function clearKey() {
  apiKeyInput.value = '';

  try {
    await chrome.storage.local.remove(['apiKey']);
    setStatus('Saved key cleared.', 'muted');
  } catch (error) {
    setStatus("I couldn't clear the key.", 'error');
  }
}

function sanitizeApiKey(value) {
  if (typeof value !== 'string') return '';

  let cleaned = value.trim();
  cleaned = cleaned.replace(/^Bearer\s+/i, '');
  cleaned = cleaned.replace(/^["']+|["']+$/g, '');
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
  cleaned = cleaned.replace(/\s+/g, '');
  cleaned = cleaned.replace(/[^A-Za-z0-9_\-]/g, '');

  if (!cleaned.startsWith('sk-')) return '';
  if (cleaned.length < 20) return '';
  return cleaned;
}

function setStatus(message, tone) {
  status.textContent = message;
  status.dataset.tone = tone || 'muted';
}
