(() => {
  if (document.getElementById('miro-root')) {
    window.__miroInjected = true;
    return;
  }
  if (window.__miroInjected || window.__miroBooting) return;
  window.__miroBooting = true;

  const MIN_TURNS = 4;
  const POLL_INTERVAL_MS = 2500;
  const MAX_MESSAGES = 24;
  const STALE_ASSISTANT_GROWTH = 220;
  const MAX_ANALYSIS_INSTANCES = 12;
  const UNREADABLE_THREAD_MESSAGE = "I couldn't read this thread reliably yet. Try again once the conversation is fully visible.";
  const SCRAPE_UI_LINES = new Set([
    'copy',
    'edit',
    'read aloud',
    'good response',
    'bad response',
    'share',
    'retry',
    'regenerate',
    'continue generating',
    'saved memory updated',
    'chatgpt said:',
    'you said:'
  ]);
  const TASK_TYPES = [
    'Information seeking',
    'Content generation',
    'Sense-making',
    'Problem solving',
    'Creative work',
    'Language refinement'
  ];
  const CONTRIBUTION_TAGS = ['judgment', 'direction', 'ideas', 'critique', 'execution', 'structure', 'research', 'momentum'];
  const STANDARD_WEIGHT_ROWS = [
    {
      key: 'ideas',
      label: 'Coming up with ideas',
      position: 38,
      reason: 'I carried more of the option-making here, while you were still setting what the work needed to be about.'
    },
    {
      key: 'direction',
      label: 'Deciding the direction',
      position: 54,
      reason: 'The direction felt shared here. You set the task, but I also carried a fair bit of the shaping.'
    },
    {
      key: 'research',
      label: 'Doing the research',
      position: 40,
      reason: 'I carried more of the gathering and synthesis in this session, even when you supplied some of the material.'
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
      position: 56,
      reason: 'Some of the corrections came from you, but a lot of the checking still sat between us.'
    },
    {
      key: 'final_call',
      label: 'Making the final call',
      position: 58,
      reason: 'The ending felt somewhat shared. You set the assignment, but I carried more of the shaping than a strong final judgment from you.'
    }
  ];
  const DEFAULT_BEHAVIORAL_NOTE = "You started this chat with 'can you help me find' - an open delegation. But by the third message you were directing: 'how would I actually apply that.' You shifted from asking me to find things to asking me to build toward your vision.";

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
    analysisInstances: [],
    chatFingerprint: '',
    currentFingerprint: '',
    scrapeReliable: false,
    scrapeIssue: ''
  };

  const SPRITES = {
    thoughtful: chrome.runtime.getURL('sprites/thoughtful.png'),
    shared: chrome.runtime.getURL('sprites/cute.png'),
    builder: chrome.runtime.getURL('sprites/builder.png'),
    tired: chrome.runtime.getURL('sprites/tired.png')
  };

  startMiro();

  function startMiro() {
    if (document.getElementById('miro-root')) {
      window.__miroInjected = true;
      window.__miroBooting = false;
      return;
    }

    if (!document.documentElement) {
      setTimeout(startMiro, 50);
      return;
    }

    try {
      injectUI();
      hydrateSessionState();
      watchConversation();
      pollConversation();
      setInterval(pollConversation, POLL_INTERVAL_MS);
      window.__miroInjected = true;
    } catch (error) {
      console.error('Miro failed to start.', error);
      window.__miroInjected = false;
    } finally {
      window.__miroBooting = false;
    }
  }

  function injectUI() {
    if (document.getElementById('miro-root')) return;

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

    (document.documentElement || document.body).appendChild(root);

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
    ensureUiMounted();

    const scrapeResult = scrapeConversation();
    state.messages = scrapeResult.messages;
    state.currentFingerprint = scrapeResult.fingerprint;
    state.scrapeReliable = scrapeResult.reliable;
    state.scrapeIssue = scrapeResult.reason;

    const badge = document.getElementById('miro-badge');
    if (badge) {
      badge.style.display = state.scrapeReliable && state.messages.length >= MIN_TURNS ? 'flex' : 'none';
    }

    const meaningfulChange = state.latestAnalysis && state.scrapeReliable
      && hasMeaningfulChange(state.messages, state.analyzedMessages, state.currentFingerprint, state.chatFingerprint);
    state.stale = Boolean(meaningfulChange);

    updatePetSprite();

    if (state.panelOpen && !state.analyzing && state.latestAnalysis && meaningfulChange) {
      renderStatus('I noticed the shape of this chat changed. Want me to reread it?', true);
    }
  }

  async function analyzeIfNeeded(force = false) {
    if (state.analyzing) return;

    if (!state.scrapeReliable) {
      renderStatus(state.scrapeIssue || UNREADABLE_THREAD_MESSAGE, false);
      return;
    }

    if (state.messages.length < MIN_TURNS) {
      renderStatus('I need a little more back-and-forth before I can read this.', false);
      return;
    }

    const currentMessages = cloneMessages(state.messages);
    const newFingerprint = state.currentFingerprint || fingerprintConversation(currentMessages);
    const meaningfulChange = hasMeaningfulChange(currentMessages, state.analyzedMessages, newFingerprint, state.chatFingerprint);

    if (!force && state.latestAnalysis && newFingerprint === state.chatFingerprint && !meaningfulChange) {
      renderPanel(state.latestAnalysis);
      return;
    }

    state.analyzing = true;
    state.stale = false;
    updatePetSprite();
    renderLoading();

    try {
      const cached = await readCachedReflection(newFingerprint);
      if (cached?.reflection) {
        await applyAnalysisResult(cached.reflection, currentMessages, newFingerprint, 'cached');
        return;
      }

      const payload = buildAnalysisPayload(currentMessages, newFingerprint);
      const response = await chrome.runtime.sendMessage({
        type: 'MIRO_ANALYZE_CHAT',
        payload
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'Could not analyze this chat.');
      }

      await applyAnalysisResult(response.result, currentMessages, newFingerprint, payload.analysisMode || 'full');
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
    const stateChip = stateChipMeta(data.state_mode);

    const body = document.getElementById('miro-panel-body');
    const headerIcon = document.getElementById('miro-header-icon');
    if (headerIcon) headerIcon.src = meta.sprite;

    body.innerHTML = `
      <section class="miro-state-card ${meta.stateClass}">
        <div class="miro-state-pet">
          <img class="miro-state-sprite" src="${meta.sprite}" alt="${escapeAttr(data.state_title)}" />
        </div>
        <div>
          <div class="miro-state-kicker">I'd call this one</div>
          <div class="miro-state-name">${escapeHtml(data.state_title)}</div>
          <div class="miro-state-meta">
            <span class="miro-state-chip ${stateChip.tone}">${escapeHtml(stateChip.label)}</span>
            <span class="miro-state-chip task">${escapeHtml(data.task_type)}</span>
          </div>
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
            <ul>${renderTaggedContributionItems(data.you_brought_tagged)}</ul>
          </div>
          <div class="miro-brought-card miro">
            <div class="miro-brought-head miro">I brought</div>
            <ul>${renderTaggedContributionItems(data.miro_brought_tagged)}</ul>
          </div>
        </div>
      </section>

      <section>
        <div class="miro-section-label">Something I noticed</div>
        <div class="miro-noticed-card">
          <div class="miro-noticed-eyebrow">${escapeHtml(data.behavioral_note_label)}</div>
          <div class="miro-noticed-copy">${escapeHtml(data.behavioral_note_text)}</div>
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
          <div class="miro-next-step-glyph" aria-hidden="true">&#8594;</div>
          <div>
            <div class="miro-next-step-title">${escapeHtml(data.gentle_next_step_title)}</div>
            <div class="miro-next-step-copy">${escapeHtml(data.gentle_next_step)}</div>
          </div>
        </div>
      </section>

      <div class="miro-panel-foot">
        <div class="miro-panel-meta">${state.messages.length} messages in this chat</div>
        <button class="miro-dashboard-link" id="miro-open-dashboard">View full dashboard</button>
      </div>
    `;

    bindWeightRows();
    document.getElementById('miro-open-dashboard')?.addEventListener('click', openMockDashboard);
  }

  function renderTaggedContributionItems(items) {
    return items.map((item) => `
      <li>
        <span class="miro-contribution-tag">${escapeHtml(item.tag.toUpperCase())}</span>
        <span class="miro-contribution-copy">${escapeHtml(item.text)}</span>
      </li>
    `).join('');
  }

  function renderWeightRows(rows) {
    return rows.map((row) => {
      const verdict = weightVerdict(row.position);
      return `
      <button
        class="miro-weight-row"
        type="button"
        aria-expanded="false"
      >
        <div class="miro-weight-row-top">
          <div class="miro-weight-label">${escapeHtml(row.label)}</div>
          <div class="miro-weight-row-right">
            <div class="miro-weight-verdict ${verdict.tone}">${escapeHtml(verdict.label)}</div>
            <div class="miro-weight-chevron">+</div>
          </div>
        </div>
        <div class="miro-weight-scale-labels"><span>Miro</span><span>You</span></div>
        <div class="miro-weight-track">
          <div class="miro-weight-track-left"></div>
          <div class="miro-weight-track-right"></div>
          <div class="miro-weight-dot" style="left:${row.position}%"></div>
        </div>
        <div class="miro-weight-reason">${escapeHtml(row.reason)}</div>
      </button>
    `;
    }).join('');
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
      'By the end, I was still holding a fair bit of the structure, even as the task itself had become clearer.'
    ];
    const fallbackYouBrought = [
      { tag: 'research', text: 'The source material or constraints the chat was working from.' },
      { tag: 'direction', text: 'The task this conversation needed to help with.' },
      { tag: 'critique', text: 'A few corrections about what did or did not feel right.' }
    ];
    const fallbackMiroBrought = [
      { tag: 'structure', text: 'First-pass structure you could push against.' },
      { tag: 'execution', text: 'A drafty version of the thing while the shape was still forming.' },
      { tag: 'momentum', text: 'Forward motion when the next step was still blurry.' }
    ];

    return {
      state_mode: sanitizeStateMode(data?.state_mode),
      state_title: cleanText(data?.state_title, 'Shared mode'),
      state_description: cleanText(
        data?.state_description,
        'I carried a fair bit of the structure in this one, while you set the task I was working toward.'
      ),
      task_type: normalizeTaskType(data?.task_type),
      turning_points: normalizeStringList(data?.turning_points, fallbackTurningPoints, 3, 4),
      weight_rows: normalizeWeightRows(data?.weight_rows),
      you_brought: normalizeStringList(
        data?.you_brought,
        ['the task and material the chat was working from', 'a few corrections about what mattered'],
        2,
        4
      ),
      miro_brought: normalizeStringList(
        data?.miro_brought || data?.slime_brought,
        ['structure to work against', 'a first pass you could react to'],
        2,
        4
      ),
      you_brought_tagged: normalizeTaggedContributionList(
        data?.you_brought_tagged,
        data?.you_brought,
        fallbackYouBrought
      ),
      miro_brought_tagged: normalizeTaggedContributionList(
        data?.miro_brought_tagged,
        data?.miro_brought || data?.slime_brought,
        fallbackMiroBrought
      ),
      behavioral_note_label: cleanText(data?.behavioral_note_label, 'PROMPT PATTERN').toUpperCase(),
      behavioral_note_text: cleanText(
        data?.behavioral_note_text,
        DEFAULT_BEHAVIORAL_NOTE
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

  function finalizeAnalysis(data, messages) {
    return applyEvidenceAdjustments(normalizeAnalysis(data), buildConversationEvidence(messages));
  }

  function normalizeWeightRows(rows) {
    const candidates = Array.isArray(rows) ? rows : [];
    const byKey = new Map();

    candidates.forEach((row, index) => {
      const key = normalizeWeightRowKey(row?.key, row?.label, STANDARD_WEIGHT_ROWS[index]?.key);
      if (!key) return;
      byKey.set(key, row);
    });

    return STANDARD_WEIGHT_ROWS.map((fallbackRow) => {
      const source = byKey.get(fallbackRow.key) || {};
      return {
        key: fallbackRow.key,
        label: fallbackRow.label,
        position: clamp(Number(source?.position), 0, 100, fallbackRow.position),
        reason: cleanText(source?.reason, fallbackRow.reason)
      };
    });
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

  function normalizeTaskType(taskType) {
    const cleaned = cleanText(taskType, '');
    const normalized = cleaned.toLowerCase();
    const match = TASK_TYPES.find((item) => item.toLowerCase() === normalized);
    return match || 'Sense-making';
  }

  function normalizeWeightRowKey(key, label, fallbackKey) {
    const normalized = `${key || ''} ${label || ''}`.toLowerCase();
    if (normalized.includes('idea')) return 'ideas';
    if (normalized.includes('direction') || normalized.includes('decid')) return 'direction';
    if (normalized.includes('research') || normalized.includes('finding')) return 'research';
    if (normalized.includes('build') || normalized.includes('draft') || normalized.includes('execution')) return 'building';
    if (normalized.includes('problem') || normalized.includes('catch') || normalized.includes('issue')) return 'problems';
    if (normalized.includes('final') || normalized.includes('call') || normalized.includes('choose')) return 'final_call';
    return fallbackKey || '';
  }

  function normalizeTaggedContributionList(value, legacyList, fallback) {
    const tagged = Array.isArray(value)
      ? value
          .map((item, index) => ({
            tag: normalizeContributionTag(item?.tag, fallback[index]?.tag || 'ideas'),
            text: cleanText(item?.text, '')
          }))
          .filter((item) => item.text)
      : [];

    if (tagged.length >= 2) {
      return tagged.slice(0, 4);
    }

    const legacy = Array.isArray(legacyList)
      ? legacy
          .map((item, index) => {
            const text = cleanText(item, '');
            if (!text) return null;
            return {
              tag: inferContributionTag(text, fallback[index]?.tag || 'ideas'),
              text
            };
          })
          .filter(Boolean)
      : [];

    if (legacy.length >= 2) {
      return legacy.slice(0, 4);
    }

    return fallback.slice(0, 4).map((item) => ({
      tag: normalizeContributionTag(item.tag, 'ideas'),
      text: cleanText(item.text, '')
    }));
  }

  function normalizeContributionTag(tag, fallback) {
    const normalized = cleanText(tag, fallback).toLowerCase();
    return CONTRIBUTION_TAGS.includes(normalized) ? normalized : fallback;
  }

  function inferContributionTag(text, fallback) {
    const normalized = text.toLowerCase();
    if (normalized.includes('judg')) return 'judgment';
    if (normalized.includes('direction') || normalized.includes('decid')) return 'direction';
    if (normalized.includes('idea') || normalized.includes('concept')) return 'ideas';
    if (normalized.includes('critique') || normalized.includes('push back') || normalized.includes('correction')) return 'critique';
    if (normalized.includes('draft') || normalized.includes('build') || normalized.includes('make')) return 'execution';
    if (normalized.includes('structure') || normalized.includes('frame')) return 'structure';
    if (normalized.includes('research') || normalized.includes('find') || normalized.includes('gather')) return 'research';
    if (normalized.includes('momentum') || normalized.includes('move') || normalized.includes('next step')) return 'momentum';
    return fallback;
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

  function stateChipMeta(mode) {
    const safeMode = sanitizeStateMode(mode);
    if (safeMode === 'builder') {
      return { label: 'I scaffolded more', tone: 'miro' };
    }
    if (safeMode === 'thoughtful') {
      return { label: 'We were sorting it out', tone: 'gold' };
    }
    if (safeMode === 'tired') {
      return { label: 'I carried more weight', tone: 'miro' };
    }
    return { label: 'This one felt shared', tone: 'shared' };
  }

  function weightVerdict(position) {
    if (position <= 34) {
      return { label: 'Leaned to me', tone: 'miro' };
    }
    if (position <= 46) {
      return { label: 'A bit to me', tone: 'miro' };
    }
    if (position < 58) {
      return { label: 'Shared', tone: 'shared' };
    }
    if (position < 78) {
      return { label: 'Mostly you', tone: 'you' };
    }
    return { label: 'Clearly you', tone: 'you' };
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
    if (!state.scrapeReliable) return "I can't read this thread reliably yet.";
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

  function ensureUiMounted() {
    const existingRoot = document.getElementById('miro-root');
    if (existingRoot) return;

    try {
      injectUI();
      updatePetSprite();

      if (state.panelOpen) {
        document.getElementById('miro-panel')?.classList.remove('miro-hidden');
      }

      if (state.latestAnalysis && state.panelOpen) {
        renderPanel(state.latestAnalysis);
      }
    } catch (error) {
      console.warn('Miro could not remount after a page rerender.', error);
    }
  }

  async function hydrateSessionState() {
    try {
      const stored = await chrome.storage.local.get([getSessionStorageKey()]);
      const snapshot = stored[getSessionStorageKey()];

      if (!snapshot || typeof snapshot !== 'object') {
        return;
      }

      state.latestAnalysis = snapshot.lastAnalysis
        ? finalizeAnalysis(snapshot.lastAnalysis, normalizeStoredMessages(snapshot.analyzedMessages))
        : null;
      state.chatFingerprint = cleanText(snapshot.chatFingerprint || snapshot.convoHash, '');
      state.convoHash = state.chatFingerprint;
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

  function buildAnalysisPayload(conversation, chatFingerprint) {
    return {
      analysisMode: 'full',
      conversation: cloneMessages(conversation),
      pageTitle: document.title,
      sessionKey: state.sessionKey,
      chatFingerprint,
      previousMessageCount: 0,
      fullMessageCount: conversation.length
    };
  }

  async function persistSessionState() {
    const storageKey = getSessionStorageKey();
    const snapshot = {
      sessionKey: state.sessionKey,
      pageTitle: document.title,
      lastAnalysis: state.latestAnalysis,
      chatFingerprint: state.chatFingerprint,
      convoHash: state.chatFingerprint,
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
    const messageNodes = Array.from(document.querySelectorAll('[data-message-author-role="user"], [data-message-author-role="assistant"]'));
    const messages = [];

    if (!messageNodes.length) {
      return {
        messages: [],
        fingerprint: '',
        reliable: false,
        reason: UNREADABLE_THREAD_MESSAGE
      };
    }

    messageNodes.forEach((node) => {
      const content = extractMessageText(node);
      if (!content || content.length < 2) return;

      let role = node.getAttribute('data-message-author-role');
      role = role === 'assistant' ? 'assistant' : 'user';

      const last = messages[messages.length - 1];
      if (last && last.role === role && last.content === content) {
        return;
      }

      messages.push({ role, content });
    });

    const normalizedMessages = messages.slice(-MAX_MESSAGES);

    if (!normalizedMessages.length) {
      return {
        messages: [],
        fingerprint: '',
        reliable: false,
        reason: UNREADABLE_THREAD_MESSAGE
      };
    }

    return {
      messages: normalizedMessages,
      fingerprint: fingerprintConversation(normalizedMessages),
      reliable: true,
      reason: ''
    };
  }

  function findConversationContainer() {
    return document.querySelector('main') || document.querySelector('[role="main"]');
  }

  function fingerprintConversation(messages) {
    return hashText(messages.map((message) => `${message.role}\u241f${message.content}`).join('\u241e'));
  }

  function getSessionKey() {
    const pathname = (location.pathname || '/').replace(/\/+$/, '');
    return pathname || '/';
  }

  function getSessionStorageKey() {
    return `miro_session:${state.sessionKey}`;
  }

  function getReflectionCacheKey() {
    return `miro_reflection:${hashText(state.sessionKey)}`;
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

  function hasMeaningfulChange(current, analyzed, currentFingerprint, analyzedFingerprint) {
    if (!Array.isArray(analyzed) || analyzed.length === 0) return false;
    if (!Array.isArray(current) || current.length === 0) return false;
    if (currentFingerprint && analyzedFingerprint && currentFingerprint === analyzedFingerprint) return false;

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

  function extractMessageText(node) {
    const rawLines = String(node?.innerText || '')
      .split(/\n+/)
      .map((line) => normalizeScrapedLine(line))
      .filter(Boolean)
      .filter((line) => shouldKeepScrapedLine(line));

    const dedupedLines = rawLines.filter((line, index) => rawLines.indexOf(line) === index);
    return dedupedLines.join(' ').replace(/\s+/g, ' ').trim();
  }

  function normalizeScrapedLine(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function shouldKeepScrapedLine(line) {
    const normalized = normalizeScrapedLine(line).toLowerCase();
    if (!normalized) return false;
    if (SCRAPE_UI_LINES.has(normalized)) return false;
    if (/^\d+\s*\/\s*\d+$/.test(normalized)) return false;
    if (/^chatgpt can make mistakes/i.test(normalized)) return false;
    return true;
  }

  function buildConversationEvidence(messages) {
    const userMessages = (Array.isArray(messages) ? messages : []).filter((message) => message.role === 'user');
    const joined = userMessages.map((message) => message.content.toLowerCase());
    const countMatches = (patterns) => joined.reduce(
      (count, text) => count + (patterns.some((pattern) => pattern.test(text)) ? 1 : 0),
      0
    );

    const sourceSignals = countMatches([/\bsource\b/, /\barticle\b/, /\bpaper\b/, /\blink\b/, /\bpdf\b/, /\breading\b/, /\bjournal\b/]);
    const synthesisSignals = countMatches([/\bsummar/i, /\bdiscussion questions?\b/, /\boutline\b/, /\bfirst draft\b/, /\bgenerate\b/, /\bwrite\b/, /\bmake\b/, /\bcreate\b/]);
    const delegationSignals = countMatches([/\bcan you\b/, /\bhelp me\b/, /\bsummar/i, /\bdiscussion questions?\b/, /\bdraft\b/, /\bwrite\b/, /\bgenerate\b/, /\bmake\b/, /\bcreate\b/]);
    const critiqueSignals = countMatches([/\binstead\b/, /\bchange\b/, /\brevise\b/, /\brewrite\b/, /\bpush back\b/, /\bfix\b/, /\badjust\b/, /\bcut\b/, /\bcloser to\b/, /\bnot like\b/]);
    const selectionSignals = countMatches([/\bchoose\b/, /\bpick\b/, /\bgo with\b/, /\bkeep\b/, /\bfinal\b/, /\buse this\b/]);
    const rewriteSignals = countMatches([/\brewrite\b/, /\breword\b/, /\bin my own words\b/, /\bmake it sound\b/, /\btone\b/]);
    const directionSignals = countMatches([/\bi want\b/, /\bi need\b/, /\blet'?s\b/, /\bmake it\b/, /\bthe goal\b/, /\bdirection\b/]);
    const judgmentSignals = critiqueSignals + selectionSignals + rewriteSignals;

    return {
      userMessages: userMessages.length,
      sourceSignals,
      synthesisSignals,
      delegationSignals,
      critiqueSignals,
      selectionSignals,
      rewriteSignals,
      directionSignals,
      judgmentSignals,
      heavyDelegation: delegationSignals >= Math.max(2, Math.ceil(userMessages.length * 0.45)) && judgmentSignals < 2,
      sourceDrivenSynthesis: sourceSignals >= 1 && synthesisSignals >= 1 && judgmentSignals < 2,
      clearJudgment: judgmentSignals >= 2 || rewriteSignals >= 1 || selectionSignals >= 1
    };
  }

  function applyEvidenceAdjustments(data, evidence) {
    const next = {
      ...data,
      weight_rows: Array.isArray(data?.weight_rows)
        ? data.weight_rows.map((row) => ({ ...row }))
        : [],
      you_brought_tagged: Array.isArray(data?.you_brought_tagged)
        ? data.you_brought_tagged.map((item) => ({ ...item }))
        : [],
      miro_brought_tagged: Array.isArray(data?.miro_brought_tagged)
        ? data.miro_brought_tagged.map((item) => ({ ...item }))
        : []
    };

    if (evidence.heavyDelegation) {
      capWeightRow(next.weight_rows, 'direction', 52, 'I carried more of the shaping here. You set the task, but not many of the directional turns landed with you.');
      capWeightRow(next.weight_rows, 'final_call', 56, 'You set what this work was for, but I carried more of the shaping than a strong final judgment from you.');
    }

    if (evidence.sourceDrivenSynthesis) {
      capWeightRow(next.weight_rows, 'research', 46, 'You brought source material, but I carried more of the gathering, reading across it, and synthesis.');
      capWeightRow(next.weight_rows, 'building', 34, 'Once the materials were there, I carried more of the first-pass making in this chat.');
    }

    next.you_brought_tagged = next.you_brought_tagged
      .map((item) => sanitizeUserContributionTag(item, evidence))
      .filter(Boolean);

    const fallbackUserItems = [
      {
        tag: evidence.sourceDrivenSynthesis ? 'research' : 'direction',
        text: evidence.sourceDrivenSynthesis
          ? 'The source material and constraints this chat was working from.'
          : 'The task this conversation needed to help with.'
      },
      { tag: 'critique', text: 'A few corrections about what did or did not feel right.' }
    ];

    if (next.you_brought_tagged.length < 2) {
      fallbackUserItems.forEach((item) => {
        const alreadyPresent = next.you_brought_tagged.some((entry) => entry.tag === item.tag && entry.text === item.text);
        if (!alreadyPresent && next.you_brought_tagged.length < 2) {
          next.you_brought_tagged.push(item);
        }
      });
    }

    next.you_brought = next.you_brought_tagged.map((item) => item.text).slice(0, 4);
    next.miro_brought = next.miro_brought_tagged.map((item) => item.text).slice(0, 4);

    return next;
  }

  function capWeightRow(rows, key, maxPosition, fallbackReason) {
    const row = Array.isArray(rows) ? rows.find((item) => item.key === key) : null;
    if (!row) return;
    if (row.position > maxPosition) {
      row.position = maxPosition;
      row.reason = fallbackReason;
    }
  }

  function sanitizeUserContributionTag(item, evidence) {
    if (!item?.text) return null;

    if (item.tag === 'judgment' && !evidence.clearJudgment) {
      if (evidence.sourceDrivenSynthesis) {
        return { tag: 'research', text: 'The source material and constraints this chat was working from.' };
      }
      return { tag: 'critique', text: item.text };
    }

    if (item.tag === 'direction' && evidence.heavyDelegation && evidence.directionSignals < 2) {
      return {
        tag: evidence.sourceDrivenSynthesis ? 'research' : 'ideas',
        text: evidence.sourceDrivenSynthesis
          ? 'The source material and constraints this chat was working from.'
          : 'The task or topic this conversation needed to respond to.'
      };
    }

    return item;
  }

  async function applyAnalysisResult(result, messages, chatFingerprint, analysisMode) {
    const finalAnalysis = finalizeAnalysis(result, messages);
    state.latestAnalysis = finalAnalysis;
    state.chatFingerprint = chatFingerprint;
    state.convoHash = chatFingerprint;
    state.analyzedMessages = cloneMessages(messages);
    state.analysisInstances = appendAnalysisInstance(state.analysisInstances, {
      analyzed_at: new Date().toISOString(),
      message_count: messages.length,
      new_message_count: messages.length,
      analysis_mode: analysisMode,
      chat_fingerprint: chatFingerprint,
      state_mode: finalAnalysis.state_mode,
      state_title: finalAnalysis.state_title,
      weight_rows: finalAnalysis.weight_rows.map((row) => ({
        key: row.key,
        position: row.position
      }))
    });
    state.stale = false;
    await persistReflectionCache(finalAnalysis, chatFingerprint);
    await persistSessionState();
    renderPanel(finalAnalysis);
  }

  async function readCachedReflection(chatFingerprint) {
    const cacheKey = getReflectionCacheKey();

    try {
      const synced = await chrome.storage.sync.get([cacheKey]);
      const syncedEntry = normalizeCachedReflectionEntry(synced[cacheKey]);
      if (syncedEntry && syncedEntry.chatFingerprint === chatFingerprint) {
        return syncedEntry;
      }
    } catch (error) {
      console.warn('Miro could not read synced reflection cache.', error);
    }

    try {
      const local = await chrome.storage.local.get([cacheKey, getSessionStorageKey()]);
      const localEntry = normalizeCachedReflectionEntry(local[cacheKey])
        || normalizeCachedReflectionEntry(snapshotToCacheEntry(local[getSessionStorageKey()]));
      if (localEntry && localEntry.chatFingerprint === chatFingerprint) {
        return localEntry;
      }
    } catch (error) {
      console.warn('Miro could not read local reflection cache.', error);
    }

    return null;
  }

  async function persistReflectionCache(reflection, chatFingerprint) {
    const cacheKey = getReflectionCacheKey();
    const entry = {
      sessionKey: state.sessionKey,
      pageTitle: document.title,
      chatFingerprint,
      reflection,
      updatedAt: new Date().toISOString()
    };

    try {
      await chrome.storage.sync.set({ [cacheKey]: entry });
    } catch (error) {
      console.warn('Miro could not save synced reflection cache.', error);
    }

    try {
      await chrome.storage.local.set({ [cacheKey]: entry });
    } catch (error) {
      console.warn('Miro could not save local reflection cache.', error);
    }
  }

  function normalizeCachedReflectionEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    if (!entry.chatFingerprint) return null;
    if (!entry.reflection || typeof entry.reflection !== 'object') return null;

    return {
      chatFingerprint: cleanText(entry.chatFingerprint, ''),
      reflection: entry.reflection
    };
  }

  function snapshotToCacheEntry(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    if (!snapshot.lastAnalysis || !snapshot.chatFingerprint && !snapshot.convoHash) return null;

    return {
      chatFingerprint: snapshot.chatFingerprint || snapshot.convoHash,
      reflection: snapshot.lastAnalysis
    };
  }

  function hashText(value) {
    let hash = 2166136261;
    const input = String(value || '');

    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return `fp_${(hash >>> 0).toString(16).padStart(8, '0')}`;
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
