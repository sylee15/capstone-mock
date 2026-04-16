(() => {
  if (window.__miroInjected) return;
  window.__miroInjected = true;

  const MIN_TURNS = 4;
  const POLL_INTERVAL_MS = 2500;
  const MAX_MESSAGES = 24;
  const STALE_ASSISTANT_GROWTH = 220;

  const state = {
    panelOpen: false,
    analyzing: false,
    latestAnalysis: null,
    convoHash: '',
    messages: [],
    analyzedMessages: [],
    observer: null,
    stale: false
  };

  const SPRITES = {
    thoughtful: chrome.runtime.getURL('sprites/thoughtful.png'),
    shared: chrome.runtime.getURL('sprites/cute.png'),
    builder: chrome.runtime.getURL('sprites/builder.png'),
    tired: chrome.runtime.getURL('sprites/tired.png')
  };

  injectUI();
  watchConversation();
  pollConversation();
  setInterval(pollConversation, POLL_INTERVAL_MS);

  function injectUI() {
    const root = document.createElement('div');
    root.id = 'miro-root';
    root.innerHTML = `
      <button id="miro-pet" aria-label="Open Miro reflection">
        <div class="miro-glow"></div>
        <img id="miro-pet-image" alt="Miro" />
        <div id="miro-badge">!</div>
      </button>
      <div id="miro-hover">I can read this chat.</div>
      <aside id="miro-panel" class="miro-hidden" aria-label="Miro reflection panel">
        <div class="miro-panel-header">
          <div class="miro-header-left">
            <img id="miro-header-icon" src="${SPRITES.shared}" alt="Miro" />
            <div>
              <div class="miro-kicker">This chat</div>
              <h2>Miro</h2>
            </div>
          </div>
          <button id="miro-close" aria-label="Close panel">&times;</button>
        </div>
        <div id="miro-panel-body">
          <div class="miro-empty">
            Hover for a quick read. Once this chat has enough back-and-forth, click me and I'll reflect on how we worked together.
          </div>
        </div>
      </aside>
    `;

    document.body.appendChild(root);

    const pet = root.querySelector('#miro-pet');
    const petImage = root.querySelector('#miro-pet-image');
    const hover = root.querySelector('#miro-hover');

    petImage.src = SPRITES.shared;

    pet.addEventListener('mouseenter', () => {
      hover.textContent = getHoverText();
      hover.classList.add('visible');
    });
    pet.addEventListener('mouseleave', () => hover.classList.remove('visible'));
    pet.addEventListener('click', async () => {
      togglePanel(true);
      await analyzeIfNeeded();
    });

    root.querySelector('#miro-close').addEventListener('click', () => togglePanel(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') togglePanel(false);
    });
  }

  function togglePanel(open) {
    state.panelOpen = open;
    document.getElementById('miro-panel')?.classList.toggle('miro-hidden', !open);
  }

  function watchConversation() {
    const container = findConversationContainer() || document.body;
    state.observer = new MutationObserver(() => pollConversation());
    state.observer.observe(container, { childList: true, subtree: true });
  }

  function pollConversation() {
    const messages = scrapeConversation();
    state.messages = messages;

    const badge = document.getElementById('miro-badge');
    if (badge) {
      badge.style.display = messages.length >= MIN_TURNS ? 'flex' : 'none';
    }

    const meaningfulChange = state.latestAnalysis && hasMeaningfulChange(messages, state.analyzedMessages);
    state.stale = Boolean(meaningfulChange);

    updatePetSprite();

    if (state.panelOpen && !state.analyzing && state.latestAnalysis && meaningfulChange) {
      renderStatus('I noticed the shape of this chat changed. Want me to reread it?', true);
    }
  }

  async function analyzeIfNeeded(force = false) {
    if (state.analyzing) return;

    if (state.messages.length < MIN_TURNS) {
      renderStatus('I need a little more back-and-forth before I can read this.', false);
      return;
    }

    const newHash = hashConversation(state.messages);
    const meaningfulChange = hasMeaningfulChange(state.messages, state.analyzedMessages);

    if (!force && state.latestAnalysis && newHash === state.convoHash && !meaningfulChange) {
      renderPanel(state.latestAnalysis);
      return;
    }

    state.analyzing = true;
    state.stale = false;
    updatePetSprite();
    renderLoading();

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'MIRO_ANALYZE_CHAT',
        payload: {
          conversation: state.messages.map(({ role, content }) => ({ role, content })),
          pageTitle: document.title
        }
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'Could not analyze this chat.');
      }

      state.latestAnalysis = normalizeAnalysis(response.result);
      state.convoHash = newHash;
      state.analyzedMessages = cloneMessages(state.messages);
      state.stale = false;
      renderPanel(state.latestAnalysis);
    } catch (error) {
      renderError(error.message || 'Could not analyze this chat.');
    } finally {
      state.analyzing = false;
      updatePetSprite();
    }
  }

  function renderLoading() {
    document.getElementById('miro-panel-body').innerHTML = `
      <div class="miro-loading-screen">
        <img class="miro-loading-sprite" src="${SPRITES.thoughtful}" alt="Miro reviewing the chat" />
        <div class="miro-loading-title">Reading the conversation<span class="miro-dots"></span></div>
        <div class="miro-loading-copy">I'm figuring out how the work moved between us in this session.</div>
      </div>
    `;
  }

  function renderError(message) {
    document.getElementById('miro-panel-body').innerHTML = `
      <div class="miro-card miro-error-card">
        <div class="miro-section-label">Reflection</div>
        <div class="miro-error-title">I couldn't reflect on this chat just yet.</div>
        <div class="miro-error-copy">${escapeHtml(message)}</div>
        <button class="miro-dashboard-link" id="miro-retry">Try again</button>
      </div>
    `;

    document.getElementById('miro-retry')?.addEventListener('click', () => analyzeIfNeeded(true));
  }

  function renderStatus(message, showRefresh) {
    document.getElementById('miro-panel-body').innerHTML = `
      <div class="miro-card miro-status-card">
        <div class="miro-status-copy">${escapeHtml(message)}</div>
        ${showRefresh ? '<button class="miro-dashboard-link" id="miro-refresh">Refresh my read</button>' : ''}
      </div>
    `;

    document.getElementById('miro-refresh')?.addEventListener('click', () => analyzeIfNeeded(true));
  }

  function renderPanel(rawData) {
    const data = normalizeAnalysis(rawData);
    const meta = stateMeta(data);

    const body = document.getElementById('miro-panel-body');
    const headerIcon = document.getElementById('miro-header-icon');
    if (headerIcon) headerIcon.src = meta.sprite;

    body.innerHTML = `
      <section class="miro-state-card ${meta.stateClass}">
        <img class="miro-state-sprite" src="${meta.sprite}" alt="${escapeAttr(data.state_title)}" />
        <div>
          <div class="miro-state-name">${escapeHtml(data.state_title)}</div>
          <div class="miro-state-desc">${escapeHtml(data.state_description)}</div>
        </div>
      </section>

      <section>
        <div class="miro-section-label">Turning points</div>
        <div class="miro-section-subhead">How the chat seemed to unfold between us.</div>
        <div class="miro-turning-points">
          ${data.turning_points.map((item, index) => `
            <div class="miro-turning-point">
              <div class="miro-turning-index">${index + 1}</div>
              <div class="miro-turning-copy">${escapeHtml(item)}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <section>
        <div class="miro-section-label">Where the weight sat</div>
        <div class="miro-section-subhead miro-italic">My read of where the work seemed to sit. Not a verdict, just a place to start.</div>
        <div class="miro-weight-card">
          <div class="miro-weight-rows">
            ${renderWeightRows(data.weight_rows)}
          </div>
        </div>
      </section>

      <section>
        <div class="miro-section-label">Who brought what</div>
        <div class="miro-brought-grid">
          <div class="miro-brought-card you">
            <div class="miro-brought-head you">You brought</div>
            <ul>${data.you_brought.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </div>
          <div class="miro-brought-card miro">
            <div class="miro-brought-head miro">I brought</div>
            <ul>${data.miro_brought.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>

      <section>
        <div class="miro-section-label">A seed to sit with</div>
        <div class="miro-reflection-card">
          <div class="miro-reflection-eyebrow">Something to notice</div>
          <div class="miro-reflection-question">${escapeHtml(data.seed_to_sit_with)}</div>
        </div>
      </section>

      <section>
        <div class="miro-section-label">A gentle next step</div>
        <div class="miro-next-step-card">
          <div class="miro-next-step-title">${escapeHtml(data.gentle_next_step_title)}</div>
          <div class="miro-next-step-copy">${escapeHtml(data.gentle_next_step)}</div>
        </div>
      </section>

      <button class="miro-dashboard-link" id="miro-open-dashboard">View full dashboard</button>
    `;

    bindWeightRows();
    document.getElementById('miro-open-dashboard')?.addEventListener('click', openMockDashboard);
  }

  function renderWeightRows(rows) {
    return rows.map((row, index) => `
      <button
        class="miro-weight-row${index === 0 ? ' open' : ''}"
        type="button"
        data-row-index="${index}"
        aria-expanded="${index === 0 ? 'true' : 'false'}"
      >
        <div class="miro-weight-row-top">
          <div class="miro-weight-label">${escapeHtml(row.label)}</div>
          <div class="miro-weight-chevron">+</div>
        </div>
        <div class="miro-weight-scale-labels"><span>Miro</span><span>You</span></div>
        <div class="miro-weight-track">
          <div class="miro-weight-track-left"></div>
          <div class="miro-weight-track-right"></div>
          <div class="miro-weight-dot" style="left:${row.position}%"></div>
        </div>
        <div class="miro-weight-reason">${escapeHtml(row.reason)}</div>
      </button>
    `).join('');
  }

  function bindWeightRows() {
    const rows = Array.from(document.querySelectorAll('.miro-weight-row'));
    rows.forEach((row) => {
      row.addEventListener('click', () => {
        const shouldOpen = !row.classList.contains('open');
        rows.forEach((item) => {
          item.classList.remove('open');
          item.setAttribute('aria-expanded', 'false');
        });
        if (shouldOpen) {
          row.classList.add('open');
          row.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function normalizeAnalysis(data) {
    const fallbackTurningPoints = [
      'You began by trying to define what kind of help you actually wanted from me.',
      'The chat shifted once the work became more concrete and we started shaping a real direction.',
      'By the end, I was helping hold structure while you kept the final say over what felt right.'
    ];

    const fallbackWeightRows = [
      {
        key: 'ideas',
        label: 'Coming up with ideas',
        position: 42,
        reason: 'I helped surface options, but you were still the one steering which ideas felt worth keeping.'
      },
      {
        key: 'direction',
        label: 'Deciding the direction',
        position: 82,
        reason: 'The stronger directional calls seemed to stay with you, even when I suggested different paths.'
      },
      {
        key: 'research',
        label: 'Doing the research',
        position: 48,
        reason: 'I carried a bit more of the gathering and organizing here, while you shaped what actually mattered.'
      },
      {
        key: 'building',
        label: 'Building the thing',
        position: 28,
        reason: 'I carried more of the first-pass making in this session, even while you kept the goal in view.'
      },
      {
        key: 'problems',
        label: 'Catching problems',
        position: 76,
        reason: 'Your judgment mattered a lot when something felt off and needed to be adjusted.'
      },
      {
        key: 'final_call',
        label: 'Making the final call',
        position: 90,
        reason: 'Where we landed still felt clearly yours. I could narrow options, but not choose for you.'
      }
    ];

    return {
      state_mode: sanitizeStateMode(data?.state_mode),
      state_title: cleanText(data?.state_title, 'Shared mode'),
      state_description: cleanText(
        data?.state_description,
        'This chat felt shared. I helped carry parts of it, but your direction still shaped where we landed.'
      ),
      turning_points: normalizeStringList(data?.turning_points, fallbackTurningPoints, 3, 4),
      weight_rows: normalizeWeightRows(data?.weight_rows, fallbackWeightRows),
      you_brought: normalizeStringList(
        data?.you_brought,
        ['the direction you cared about', 'the judgment for what felt right'],
        2,
        4
      ),
      miro_brought: normalizeStringList(
        data?.miro_brought || data?.slime_brought,
        ['structure to work against', 'a first pass you could react to'],
        2,
        4
      ),
      seed_to_sit_with: cleanText(
        data?.seed_to_sit_with || data?.reflection,
        'What part of this still feels most like yours?'
      ),
      gentle_next_step_title: cleanText(
        data?.gentle_next_step_title || data?.next_step_title,
        'Take back one piece'
      ),
      gentle_next_step: cleanText(
        data?.gentle_next_step || data?.next_step,
        'Pick one part I carried for you and rewrite it in your own words before you leave this chat.'
      )
    };
  }

  function normalizeWeightRows(rows, fallback) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return fallback;
    }

    return rows.slice(0, 6).map((row, index) => ({
      key: cleanText(row?.key, fallback[index]?.key || `row_${index + 1}`),
      label: cleanText(row?.label, fallback[index]?.label || `Row ${index + 1}`),
      position: clamp(Number(row?.position), 0, 100, fallback[index]?.position || 50),
      reason: cleanText(row?.reason, fallback[index]?.reason || '')
    }));
  }

  function normalizeStringList(value, fallback, minItems, maxItems) {
    const list = Array.isArray(value)
      ? value.map((item) => cleanText(item, '')).filter(Boolean)
      : [];

    if (list.length >= minItems) {
      return list.slice(0, maxItems);
    }

    return fallback.slice(0, maxItems);
  }

  function sanitizeStateMode(mode) {
    return ['builder', 'thoughtful', 'shared', 'tired'].includes(mode) ? mode : 'shared';
  }

  function stateMeta(data) {
    const mode = sanitizeStateMode(data.state_mode);

    if (mode === 'builder') {
      return { sprite: SPRITES.builder, stateClass: 'builder' };
    }
    if (mode === 'thoughtful') {
      return { sprite: SPRITES.thoughtful, stateClass: 'thoughtful' };
    }
    if (mode === 'tired') {
      return { sprite: SPRITES.tired, stateClass: 'tired' };
    }
    return { sprite: SPRITES.shared, stateClass: 'shared' };
  }

  function updatePetSprite() {
    const petImage = document.getElementById('miro-pet-image');
    const headerIcon = document.getElementById('miro-header-icon');
    if (!petImage) return;

    if (state.analyzing) {
      petImage.src = SPRITES.thoughtful;
      if (headerIcon) headerIcon.src = SPRITES.thoughtful;
      return;
    }

    if (state.latestAnalysis) {
      const meta = stateMeta(state.latestAnalysis);
      petImage.src = meta.sprite;
      if (headerIcon) headerIcon.src = meta.sprite;
      return;
    }

    const defaultSprite = state.messages.length >= MIN_TURNS ? SPRITES.thoughtful : SPRITES.shared;
    petImage.src = defaultSprite;
    if (headerIcon) headerIcon.src = defaultSprite;
  }

  function getHoverText() {
    if (state.analyzing) return "I'm reading this chat.";
    if (state.messages.length < MIN_TURNS) return 'I need a little more chat first.';
    if (state.stale) return 'I should reread this.';
    if (state.latestAnalysis) {
      if (state.latestAnalysis.state_mode === 'builder') return 'I was in builder mode here.';
      if (state.latestAnalysis.state_mode === 'thoughtful') return 'I was sorting through things with you here.';
      if (state.latestAnalysis.state_mode === 'tired') return 'I carried more of this one.';
      return 'This one felt shared.';
    }
    return 'I can read this chat.';
  }

  function openMockDashboard() {
    window.open(chrome.runtime.getURL('dashboard.html'), '_blank');
  }

  function scrapeConversation() {
    const messageNodes = Array.from(document.querySelectorAll('[data-message-author-role], article'));
    const messages = [];

    messageNodes.forEach((node, index) => {
      const content = (node.innerText || '').replace(/\s+/g, ' ').trim();
      if (!content || content.length < 2) return;

      let role = node.getAttribute('data-message-author-role');
      if (!role) {
        role = index % 2 === 0 ? 'assistant' : 'user';
      }

      role = role === 'assistant' ? 'assistant' : 'user';

      const last = messages[messages.length - 1];
      if (last && last.role === role && last.content === content) {
        return;
      }

      messages.push({ role, content });
    });

    return messages.slice(-MAX_MESSAGES);
  }

  function findConversationContainer() {
    return document.querySelector('main') || document.querySelector('[role="main"]');
  }

  function hashConversation(messages) {
    return messages.map((message) => `${message.role}:${message.content.slice(0, 160)}`).join('|');
  }

  function cloneMessages(messages) {
    return messages.map((message) => ({ role: message.role, content: message.content }));
  }

  function hasMeaningfulChange(current, analyzed) {
    if (!Array.isArray(analyzed) || analyzed.length === 0) return false;
    if (!Array.isArray(current) || current.length === 0) return false;

    if (current.length > analyzed.length) {
      const newTail = current.slice(analyzed.length);
      return newTail.some((message) => message.content.trim().length > 40);
    }

    if (current.length !== analyzed.length) {
      return false;
    }

    const currentLast = current[current.length - 1];
    const analyzedLast = analyzed[analyzed.length - 1];
    if (!currentLast || !analyzedLast) return false;

    if (currentLast.role !== analyzedLast.role) {
      return true;
    }

    if (currentLast.content === analyzedLast.content) {
      return false;
    }

    if (currentLast.role === 'assistant' && currentLast.content.startsWith(analyzedLast.content)) {
      return currentLast.content.length - analyzedLast.content.length > STALE_ASSISTANT_GROWTH;
    }

    return Math.abs(currentLast.content.length - analyzedLast.content.length) > 120;
  }

  function cleanText(value, fallback) {
    const text = String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
    return text || fallback;
  }

  function clamp(value, min, max, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (match) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
