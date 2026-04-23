(() => {
  if (window.__miroInjected) return;
  window.__miroInjected = true;

  const MIN_TURNS = 4;
  const POLL_INTERVAL_MS = 2500;
  const MAX_MESSAGES = 24;
  const STALE_ASSISTANT_GROWTH = 220;
  const MAX_ANALYSIS_INSTANCES = 12;
  const CANONICAL_WEIGHT_ROWS = [
    {
      key: 'ideas',
      label: 'Coming up with ideas',
      position: 42,
      range_start: 30,
      range_end: 58,
      verdict: 'Shared',
      reason: 'I helped surface options, but you were still the one steering which ideas felt worth keeping.'
    },
    {
      key: 'direction',
      label: 'Deciding the direction',
      position: 82,
      range_start: 68,
      range_end: 92,
      verdict: 'Mostly you',
      reason: 'The stronger directional calls seemed to stay with you, even when I suggested different paths.'
    },
    {
      key: 'research',
      label: 'Doing the research',
      position: 48,
      range_start: 34,
      range_end: 62,
      verdict: 'Shared',
      reason: 'I carried a bit more of the gathering and organizing here, while you shaped what actually mattered.'
    },
    {
      key: 'building',
      label: 'Building the thing',
      position: 28,
      range_start: 16,
      range_end: 44,
      verdict: 'Leaned to me',
      reason: 'I carried more of the first-pass making in this session, even while you kept the goal in view.'
    },
    {
      key: 'problems',
      label: 'Catching problems',
      position: 76,
      range_start: 60,
      range_end: 88,
      verdict: 'Mostly you',
      reason: 'Your judgment mattered a lot when something felt off and needed to be adjusted.'
    },
    {
      key: 'final_call',
      label: 'Making the final call',
      position: 90,
      range_start: 76,
      range_end: 98,
      verdict: 'Clearly you',
      reason: 'Where we landed still felt clearly yours. I could narrow options, but not choose for you.'
    }
  ];

  const state = {
    panelOpen: false,
    analyzing: false,
    latestAnalysis: null,
    convoHash: '',
    messages: [],
    analyzedMessages: [],
    observer: null,
    stale: false,
    sessionKey: getSessionKey(),
    analysisInstances: []
  };

  const SPRITES = {
    thoughtful: chrome.runtime.getURL('sprites/thoughtful.png'),
    shared: chrome.runtime.getURL('sprites/cute.png'),
    builder: chrome.runtime.getURL('sprites/builder.png'),
    tired: chrome.runtime.getURL('sprites/tired.png')
  };

  injectUI();
  hydrateSessionState();
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
              <div class="miro-kicker">Your AI on this chat</div>
              <h2>How I worked with you</h2>
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

    if (state.latestAnalysis && newHash === state.convoHash && !meaningfulChange) {
      renderPanel(state.latestAnalysis);
      return;
    }

    state.analyzing = true;
    state.stale = false;
    updatePetSprite();
    renderLoading();

    try {
      const payload = buildAnalysisPayload();
      const previousAnalysis = state.latestAnalysis;
      const response = await chrome.runtime.sendMessage({
        type: 'MIRO_ANALYZE_CHAT',
        payload
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'Could not analyze this chat.');
      }

      state.latestAnalysis = stabilizeAnalysis(
        normalizeAnalysis(response.result),
        previousAnalysis,
        {
          analysisMode: payload.analysisMode,
          meaningfulChange
        }
      );
      state.convoHash = newHash;
      state.analyzedMessages = cloneMessages(state.messages);
      state.analysisInstances = appendAnalysisInstance(state.analysisInstances, {
        analyzed_at: new Date().toISOString(),
        message_count: state.messages.length,
        new_message_count: payload.conversation.length,
        analysis_mode: payload.analysisMode,
        session_read_title: state.latestAnalysis.session_read_title,
        weight_rows: state.latestAnalysis.weight_rows.map((row) => ({
          key: row.key,
          position: row.position,
          range_start: row.range_start,
          range_end: row.range_end
        }))
      });
      persistSessionState();
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
    const sprite = getAnalysisSprite(data);
    const messageCount = state.messages.length || state.analyzedMessages.length || 0;

    const body = document.getElementById('miro-panel-body');
    const headerIcon = document.getElementById('miro-header-icon');
    if (headerIcon) headerIcon.src = sprite;

    body.innerHTML = `
      <section class="miro-card miro-session-read">
        <img class="miro-session-sprite" src="${sprite}" alt="${escapeAttr(data.session_read_title)}" />
        <div>
          <div class="miro-kicker miro-tight-kicker">This session</div>
          <div class="miro-session-title">${escapeHtml(data.session_read_title)}</div>
          <div class="miro-session-meta">
            ${data.session_read_chips.map((chip) => `<span class="miro-chip ${escapeAttr(chip.tone)}">${escapeHtml(chip.label)}</span>`).join('')}
          </div>
          <div class="miro-session-narrative">${escapeHtml(data.session_read_narrative)}</div>
        </div>
      </section>

      <section>
        <div class="miro-section-label">Where the work sat</div>
        <div class="miro-weight-card">
          <div class="miro-weight-rows">
            ${renderWeightRows(data.weight_rows)}
          </div>
        </div>
      </section>

      <section>
        <div class="miro-pattern-card">
          <div class="miro-pattern-eyebrow">A pattern I noticed</div>
          <div class="miro-pattern-title">${escapeHtml(data.pattern_title)}</div>
          <div class="miro-pattern-copy">${escapeHtml(data.pattern_copy)}</div>
        </div>
      </section>

      <section class="miro-try-section">
        <div class="miro-section-label">What you could try</div>
        <div class="miro-try-list">
          ${renderTryItems(data.try_items)}
        </div>
      </section>

      <section>
        <div class="miro-closing-question">
          <div class="miro-closing-question-text">${escapeHtml(data.closing_question)}</div>
        </div>
      </section>

      <div class="miro-panel-foot">
        <div class="miro-panel-meta">${messageCount} messages in this chat</div>
        <button class="miro-dashboard-link" id="miro-open-dashboard">View full dashboard</button>
      </div>
    `;

    bindWeightRows();
    document.getElementById('miro-open-dashboard')?.addEventListener('click', openMockDashboard);
  }

  function renderWeightRows(rows) {
    return rows.map((row) => `
      <button
        class="miro-weight-row"
        type="button"
        aria-expanded="false"
      >
        <div class="miro-weight-row-top">
          <div class="miro-weight-label">${escapeHtml(row.label)}</div>
          <div class="miro-weight-row-right">
            <div class="miro-weight-verdict ${escapeAttr(weightVerdictTone(row.verdict))}">${escapeHtml(row.verdict)}</div>
            <div class="miro-weight-chevron">+</div>
          </div>
        </div>
        <div class="miro-weight-scale-labels"><span>AI</span><span>You</span></div>
        <div class="miro-weight-track">
          <div class="miro-weight-track-left"></div>
          <div class="miro-weight-track-right"></div>
          <div class="miro-weight-dot" style="left:${row.position}%"></div>
        </div>
        <div class="miro-weight-reason">${escapeHtml(row.reason)}</div>
      </button>
    `).join('');
  }

  function renderTryItems(items) {
    return items.map((item, index) => `
      <div class="miro-try-item">
        <div class="miro-try-icon ${escapeAttr(item.icon_type)}">${index + 1}</div>
        <div>
          <div class="miro-try-title">${escapeHtml(item.title)}</div>
          <div class="miro-try-copy">${escapeHtml(item.copy)}</div>
          <span class="miro-try-source">${escapeHtml(item.source)}</span>
        </div>
      </div>
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
    return {
      session_read_title: cleanText(
        data?.session_read_title,
        'Mostly me building, you steering'
      ),
      session_read_chips: normalizeChips(data?.session_read_chips),
      session_read_narrative: cleanText(
        data?.session_read_narrative,
        'You came in with a concrete task and let me build the first pass. The stronger shift happened once you redirected what the work needed to become.'
      ),
      weight_rows: normalizeWeightRows(data?.weight_rows, CANONICAL_WEIGHT_ROWS),
      pattern_title: cleanText(
        data?.pattern_title,
        'Prompt pattern'
      ),
      pattern_copy: cleanText(
        data?.pattern_copy,
        'You started by handing me the task directly, then shifted into redirecting what the task needed to become. The authorship got stronger once you started shaping instead of delegating.'
      ),
      try_items: normalizeTryItems(data?.try_items),
      closing_question: cleanText(
        data?.closing_question || data?.seed_to_sit_with || data?.reflection,
        'What part of this still feels most like yours?'
      )
    };
  }

  function stabilizeAnalysis(nextAnalysis, previousAnalysis, options = {}) {
    if (!previousAnalysis || typeof previousAnalysis !== 'object') {
      return nextAnalysis;
    }

    return {
      ...nextAnalysis,
      weight_rows: stabilizeWeightRows(
        nextAnalysis.weight_rows,
        previousAnalysis.weight_rows,
        options
      )
    };
  }

  function normalizeWeightRows(rows, fallback) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return fallback;
    }

    const normalized = Array.from({ length: fallback.length }, (_, index) => {
      const template = fallback[index];
      const sourceRow = findWeightRowForTemplate(rows, template, index);
      return normalizeWeightRange({
        key: template.key,
        label: template.label,
        position: clamp(Number(sourceRow?.position), 0, 100, template.position),
        range_start: clamp(Number(sourceRow?.range_start), 0, 100, template.range_start),
        range_end: clamp(Number(sourceRow?.range_end), 0, 100, template.range_end),
        verdict: cleanText(sourceRow?.verdict, template.verdict),
        reason: cleanText(sourceRow?.reason, template.reason)
      });
    });

    return normalized;
  }

  function findWeightRowForTemplate(rows, template, index) {
    const directMatch = rows.find((row) => canonicalWeightKey(row) === template.key);
    if (directMatch) return directMatch;

    const indexedRow = rows[index];
    if (canonicalWeightKey(indexedRow) === template.key) {
      return indexedRow;
    }

    return indexedRow || rows.find((row) => row && typeof row === 'object') || null;
  }

  function canonicalWeightKey(row) {
    const text = `${cleanText(row?.key, '')} ${cleanText(row?.label, '')}`.toLowerCase();
    if (!text) return '';
    if (text.includes('idea') || text.includes('brainstorm') || text.includes('concept')) return 'ideas';
    if (text.includes('direction') || text.includes('decid') || text.includes('frame') || text.includes('strategy')) return 'direction';
    if (text.includes('research') || text.includes('gather') || text.includes('synth') || text.includes('source')) return 'research';
    if (text.includes('build') || text.includes('create') || text.includes('make') || text.includes('draft') || text.includes('write') || text.includes('code') || text.includes('excel') || text.includes('sheet') || text.includes('prototype')) return 'building';
    if (text.includes('problem') || text.includes('error') || text.includes('bug') || text.includes('fix') || text.includes('review') || text.includes('check') || text.includes('critique')) return 'problems';
    if (text.includes('final') || text.includes('call') || text.includes('choose') || text.includes('approve') || text.includes('submit')) return 'final_call';
    return '';
  }

  function normalizeChips(value) {
    const fallback = [
      { label: 'Shared read', tone: 'shared' },
      { label: 'This chat', tone: 'task' }
    ];

    if (!Array.isArray(value) || value.length === 0) {
      return fallback;
    }

    return value.slice(0, 2).map((chip, index) => ({
      label: cleanText(chip?.label, fallback[index]?.label || 'This chat'),
      tone: sanitizeChipTone(chip?.tone, fallback[index]?.tone || 'task')
    }));
  }

  function normalizeTryItems(value) {
    const fallback = [
      {
        icon_type: 'rework',
        title: 'Rewrite one part in your own words',
        copy: 'Pick the part I carried most heavily and rewrite it without looking at my version first.',
        source: 'Based on: Building leaned to me'
      },
      {
        icon_type: 'reframe',
        title: 'Start with your own outline',
        copy: 'Before asking me to generate, jot the shape you want me to build from.',
        source: 'Based on: Prompt pattern'
      }
    ];

    if (!Array.isArray(value) || value.length < 2) {
      return fallback;
    }

    return value.slice(0, 3).map((item, index) => ({
      icon_type: sanitizeTryIcon(item?.icon_type, fallback[index]?.icon_type || 'rework'),
      title: cleanText(item?.title, fallback[index]?.title || 'Try this next'),
      copy: cleanText(item?.copy, fallback[index]?.copy || ''),
      source: cleanText(item?.source, fallback[index]?.source || 'Based on: This session')
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

  function sanitizeChipTone(value, fallback) {
    return ['miro', 'shared', 'task'].includes(value) ? value : fallback;
  }

  function sanitizeTryIcon(value, fallback) {
    return ['rework', 'reframe', 'reclaim'].includes(value) ? value : fallback;
  }

  function normalizeWeightRange(row) {
    const start = Number.isFinite(row.range_start) ? row.range_start : Math.max(0, row.position - 12);
    const end = Number.isFinite(row.range_end) ? row.range_end : Math.min(100, row.position + 12);
    const orderedStart = Math.max(0, Math.min(start, end, row.position));
    const orderedEnd = Math.min(100, Math.max(start, end, row.position));
    return {
      ...row,
      range_start: orderedStart,
      range_end: orderedEnd
    };
  }

  function stabilizeWeightRows(nextRows, previousRows, options = {}) {
    if (!Array.isArray(nextRows) || nextRows.length === 0 || !Array.isArray(previousRows) || previousRows.length === 0) {
      return nextRows;
    }

    const maxShift = options.analysisMode === 'incremental' ? 14 : 10;
    const blend = options.meaningfulChange ? 0.45 : 0.3;

    return nextRows.map((row) => {
      const previousRow = previousRows.find((candidate) =>
        candidate?.key === row.key || candidate?.label === row.label
      );

      if (!previousRow || !Number.isFinite(previousRow.position)) {
        return row;
      }

      const previousPosition = clamp(Number(previousRow.position), 0, 100, row.position);
      const incomingPosition = clamp(Number(row.position), 0, 100, previousPosition);
      const blendedPosition = previousPosition + ((incomingPosition - previousPosition) * blend);
      const boundedPosition = clamp(
        Math.round(blendedPosition),
        Math.max(0, previousPosition - maxShift),
        Math.min(100, previousPosition + maxShift),
        previousPosition
      );

      return normalizeWeightRange({
        ...row,
        position: boundedPosition,
        verdict: deriveWeightVerdict(boundedPosition)
      });
    });
  }

  function deriveWeightVerdict(position) {
    const value = clamp(Number(position), 0, 100, 50);
    if (value <= 24) return 'Mostly AI';
    if (value <= 42) return 'Leaned to AI';
    if (value < 58) return 'Shared';
    if (value < 76) return 'Leaned to you';
    return 'Mostly you';
  }

  function weightVerdictTone(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('you')) return 'you';
    if (text.includes('shared')) return 'shared';
    return 'miro';
  }

  function getAnalysisSprite(data) {
    const firstChip = Array.isArray(data?.session_read_chips) ? data.session_read_chips[0] : null;
    if (firstChip?.tone === 'miro') return SPRITES.builder;
    if (firstChip?.tone === 'shared') return SPRITES.shared;
    return SPRITES.thoughtful;
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
      const sprite = getAnalysisSprite(state.latestAnalysis);
      petImage.src = sprite;
      if (headerIcon) headerIcon.src = sprite;
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
      return cleanText(state.latestAnalysis.session_read_title, 'I have a read on this chat.');
    }
    return 'I can read this chat.';
  }

  function openMockDashboard() {
    window.open(chrome.runtime.getURL('dashboard.html'), '_blank');
  }

  async function hydrateSessionState() {
    try {
      const stored = await chrome.storage.local.get([getSessionStorageKey()]);
      const snapshot = stored[getSessionStorageKey()];

      if (!snapshot || typeof snapshot !== 'object') {
        return;
      }

      state.latestAnalysis = snapshot.lastAnalysis ? normalizeAnalysis(snapshot.lastAnalysis) : null;
      state.convoHash = cleanText(snapshot.convoHash, '');
      state.analyzedMessages = normalizeStoredMessages(snapshot.analyzedMessages);
      state.analysisInstances = Array.isArray(snapshot.analysisInstances)
        ? snapshot.analysisInstances.slice(-MAX_ANALYSIS_INSTANCES)
        : [];
      state.stale = state.latestAnalysis && hasMeaningfulChange(state.messages, state.analyzedMessages);
      updatePetSprite();
    } catch (error) {
      console.warn('Miro could not restore session memory.', error);
    }
  }

  function buildAnalysisPayload() {
    const conversation = cloneMessages(state.messages);
    const priorMessages = normalizeStoredMessages(state.analyzedMessages);
    const canUseIncremental =
      state.latestAnalysis &&
      priorMessages.length >= MIN_TURNS &&
      conversation.length >= priorMessages.length;

    if (!canUseIncremental) {
      return {
        analysisMode: 'full',
        conversation,
        pageTitle: document.title,
        sessionKey: state.sessionKey,
        previousMessageCount: 0,
        fullMessageCount: conversation.length
      };
    }

    const newMessages = conversation.slice(priorMessages.length);
    const hasFreshTail = newMessages.some((message) => message.content.trim().length > 0);

    if (!hasFreshTail) {
      return {
        analysisMode: 'full',
        conversation,
        pageTitle: document.title,
        sessionKey: state.sessionKey,
        previousMessageCount: 0,
        fullMessageCount: conversation.length
      };
    }

    return {
      analysisMode: 'incremental',
      conversation: newMessages,
      pageTitle: document.title,
      sessionKey: state.sessionKey,
      previousReflection: state.latestAnalysis,
      previousMessageCount: priorMessages.length,
      fullMessageCount: conversation.length
    };
  }

  async function persistSessionState() {
    const storageKey = getSessionStorageKey();
    const snapshot = {
      sessionKey: state.sessionKey,
      pageTitle: document.title,
      lastAnalysis: state.latestAnalysis,
      convoHash: state.convoHash,
      analyzedMessages: cloneMessages(state.analyzedMessages),
      analysisInstances: state.analysisInstances.slice(-MAX_ANALYSIS_INSTANCES),
      updatedAt: new Date().toISOString()
    };

    try {
      await chrome.storage.local.set({ [storageKey]: snapshot });
    } catch (error) {
      console.warn('Miro could not save session memory.', error);
    }
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

  function getSessionKey() {
    return `${location.origin}${location.pathname}`;
  }

  function getSessionStorageKey() {
    return `miro_session:${state.sessionKey}`;
  }

  function cloneMessages(messages) {
    return messages.map((message) => ({ role: message.role, content: message.content }));
  }

  function normalizeStoredMessages(messages) {
    return Array.isArray(messages)
      ? messages
          .map((message) => ({
            role: message?.role === 'assistant' ? 'assistant' : 'user',
            content: cleanText(message?.content, '')
          }))
          .filter((message) => message.content)
          .slice(-MAX_MESSAGES)
      : [];
  }

  function appendAnalysisInstance(instances, nextInstance) {
    return [...(Array.isArray(instances) ? instances : []), nextInstance].slice(-MAX_ANALYSIS_INSTANCES);
  }

  function hasMeaningfulChange(current, analyzed) {
    if (!Array.isArray(analyzed) || analyzed.length === 0) return false;
    if (!Array.isArray(current) || current.length === 0) return false;

    if (current.length > analyzed.length) {
      if (endsWithMessages(current, analyzed)) {
        return false;
      }

      if (!startsWithMessages(current, analyzed)) {
        return false;
      }

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

  function startsWithMessages(messages, prefix) {
    if (!Array.isArray(messages) || !Array.isArray(prefix)) return false;
    if (prefix.length > messages.length) return false;

    return prefix.every((message, index) => sameMessage(message, messages[index]));
  }

  function endsWithMessages(messages, suffix) {
    if (!Array.isArray(messages) || !Array.isArray(suffix)) return false;
    if (suffix.length > messages.length) return false;

    const offset = messages.length - suffix.length;
    return suffix.every((message, index) => sameMessage(message, messages[offset + index]));
  }

  function sameMessage(a, b) {
    if (!a || !b) return false;
    return a.role === b.role && a.content === b.content;
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
