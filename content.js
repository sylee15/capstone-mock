(() => {
  if (window.__miroInjected) return;
  window.__miroInjected = true;

  const MIN_TURNS = 4;
  const POLL_INTERVAL_MS = 2500;
  const MAX_MESSAGES = 24;
  const STALE_ASSISTANT_GROWTH = 220;
  const MAX_ANALYSIS_INSTANCES = 12;
  const DASHBOARD_SESSION_STORAGE_KEY = 'miro_dashboard_sessions';
  const AREA_LABELS = {
    research: 'Research',
    writing: 'Writing',
    coding: 'Coding',
    design: 'Design',
    studying: 'Studying',
    career: 'Career',
    presenting: 'Presenting',
    personal: 'Personal'
  };
  const CANONICAL_WEIGHT_ROWS = [
    {
      key: 'ideas',
      label: 'Ideas',
      position: 42,
      range_start: 30,
      range_end: 58,
      verdict: 'Together',
      reason: 'Both sides contributed options before the direction settled.'
    },
    {
      key: 'direction',
      label: 'Direction',
      position: 82,
      range_start: 68,
      range_end: 92,
      verdict: 'Human-led',
      reason: 'You set the direction and decided what the next response needed to do.'
    },
    {
      key: 'research',
      label: 'Research',
      position: 48,
      range_start: 34,
      range_end: 62,
      verdict: 'Together',
      reason: 'The material was gathered and shaped across both sides of the chat.'
    },
    {
      key: 'building',
      label: 'Building',
      position: 28,
      range_start: 16,
      range_end: 44,
      verdict: 'AI-led',
      reason: 'AI handled more of the first-pass making in this chat.'
    },
    {
      key: 'problems',
      label: 'Problems',
      position: 76,
      range_start: 60,
      range_end: 88,
      verdict: 'Human-led',
      reason: 'You were the one catching what felt off and pushing the revisions.'
    },
    {
      key: 'final_call',
      label: 'Final call',
      position: 90,
      range_start: 76,
      range_end: 98,
      verdict: 'Human-led',
      reason: 'The final decisions stayed with you.'
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
    dashboardSession: null,
    analysisInstances: [],
    introNudgeShown: false,
    introNudgeTimer: null
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
      <button id="miro-pet" aria-label="Open AI Mirror">
        <div class="miro-glow"></div>
        <img id="miro-pet-image" alt="Miro" />
        <div id="miro-badge">!</div>
      </button>
      <div id="miro-hover" role="status" aria-live="polite">AI Mirror is ready.</div>
      <aside id="miro-panel" class="miro-hidden" aria-label="AI Mirror panel">
        <div class="miro-panel-header">
          <img class="miro-header-slime" src="${SPRITES.shared}" alt="slime" />
          <div class="miro-header-copy">
            <div class="miro-kicker">AI Mirror</div>
            <h2>Quick read of this chat</h2>
          </div>
          <button id="miro-close" aria-label="Close panel">&times;</button>
        </div>
        <div id="miro-panel-body">
          <div class="miro-empty">
            Once this chat has enough back-and-forth, click to get a quick read of what happened here.
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
    pet.addEventListener('mouseleave', () => {
      if (!state.introNudgeTimer) {
        hover.classList.remove('visible');
      }
    });
    pet.addEventListener('click', async () => {
      hidePetHint();
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

    maybeShowIntroNudge();

    const meaningfulChange = state.latestAnalysis && hasMeaningfulChange(messages, state.analyzedMessages);
    state.stale = Boolean(meaningfulChange);

    updatePetSprite();

    if (state.panelOpen && !state.analyzing && state.latestAnalysis && meaningfulChange) {
      renderStatus('This chat changed. Refresh the read?', true);
    }
  }

  async function analyzeIfNeeded(force = false) {
    if (state.analyzing) return;

    if (state.messages.length < MIN_TURNS) {
      renderStatus('This needs a little more back-and-forth before it can be read.', false);
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
      state.dashboardSession = buildDashboardSessionRecord(state.latestAnalysis);
      state.convoHash = newHash;
      state.analyzedMessages = cloneMessages(state.messages);
      state.analysisInstances = appendAnalysisInstance(state.analysisInstances, {
        analyzed_at: state.latestAnalysis.analyzed_at,
        message_count: state.latestAnalysis.message_count,
        new_message_count: payload.conversation.length,
        analysis_mode: payload.analysisMode,
        session_read_title: state.latestAnalysis.session_read_title,
        areas: state.latestAnalysis.areas.map((area) => area.key),
        work_split: state.latestAnalysis.work_split,
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
        <img class="miro-loading-sprite" src="${SPRITES.thoughtful}" alt="AI Mirror reviewing the chat" />
        <div class="miro-loading-title">Reading this chat<span class="miro-dots"></span></div>
        <div class="miro-loading-copy">Pulling together a quick mirror of the collaboration in this chat.</div>
      </div>
    `;
  }

  function renderError(message) {
    document.getElementById('miro-panel-body').innerHTML = `
      <div class="miro-card miro-error-card">
        <div class="miro-section-label">AI Mirror</div>
        <div class="miro-error-title">This chat could not be read yet.</div>
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
    const body = document.getElementById('miro-panel-body');

    body.innerHTML = `
      <section class="miro-card miro-at-a-glance-card">
        <div class="miro-at-a-glance-top">
          <div class="miro-at-a-glance-copy">
            <div class="miro-section-label">This chat at a glance</div>
            <div class="miro-session-title">${escapeHtml(data.session_read_title)}</div>
          </div>
        </div>
        <div class="miro-area-row">
          <div class="miro-area-chip-row">
            ${renderAreaChips(data.areas)}
          </div>
          <div class="miro-collab-helper">Tap rows for why</div>
        </div>
        <div class="miro-weight-card">
          <div class="miro-weight-rows">
            ${renderWeightRows(data.weight_rows)}
          </div>
        </div>
      </section>

      <section class="miro-card miro-try-now-card">
        <div class="miro-section-label miro-try-now-label">Try this</div>
        <div class="miro-try-now-title">${escapeHtml(data.try_now.title)}</div>
        <div class="miro-try-now-copy">${escapeHtml(data.try_now.copy)}</div>
        <div class="miro-try-now-example-label">Prompt example</div>
        <div class="miro-try-now-example">${escapeHtml(data.try_now.prompt_example)}</div>
      </section>

      <button class="miro-dashboard-link miro-footer-button" id="miro-open-dashboard">View full dashboard →</button>
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
          <div class="miro-weight-track-wrap">
            <div class="miro-weight-track">
              <div class="miro-weight-track-left"></div>
              <div class="miro-weight-track-right"></div>
              <div class="miro-weight-dot" style="left:${row.position}%"></div>
            </div>
          </div>
          <div class="miro-weight-row-right">
            <div class="miro-weight-verdict ${escapeAttr(weightVerdictTone(row.verdict))}">${escapeHtml(row.verdict)}</div>
            <div class="miro-weight-chevron">+</div>
          </div>
        </div>
        <div class="miro-weight-reason">
          <span class="miro-weight-reason-label ${escapeAttr(weightVerdictTone(row.verdict))}">${escapeHtml(row.verdict)}</span>
          <span class="miro-weight-reason-copy">${escapeHtml(row.reason)}</span>
        </div>
      </button>
    `).join('');
  }

  function renderAreaChips(areas) {
    return areas.map((area) => `
      <span class="miro-area-chip ${escapeAttr(area.salience)}">${escapeHtml(getAreaLabel(area.key))}</span>
    `).join('');
  }

  function mapWeightRowsByKey(rows) {
    return (Array.isArray(rows) ? rows : []).reduce((mapped, row) => {
      if (row?.key) {
        mapped[row.key] = row;
      }
      return mapped;
    }, {});
  }

  function buildSessionReadFallback(rows) {
    const mapped = mapWeightRowsByKey(rows);
    const building = mapped.building?.position ?? 50;
    const direction = mapped.direction?.position ?? 50;
    const research = mapped.research?.position ?? 50;
    const finalCall = mapped.final_call?.position ?? 50;

    if (building <= 36 && direction >= 60) {
      return 'You were shaping the direction, and I helped turn the first pass into something more workable.';
    }

    if (research <= 40) {
      return 'You were bringing the question or material, and I helped gather, sort, and synthesize what was there.';
    }

    if (finalCall >= 72) {
      return 'You were narrowing what mattered, and I helped make the options easier to work with.';
    }

    return 'You were working through the task with me, and I helped give the chat more structure and momentum.';
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
    const weightRows = normalizeWeightRows(data?.weight_rows, CANONICAL_WEIGHT_ROWS);
    const areas = normalizeAreas(data?.areas, state.messages.length ? state.messages : state.analyzedMessages);
    const sessionReadMode = normalizeSessionReadMode(data?.session_read_mode, data?.session_read_chips, weightRows);
    const analyzedAt = cleanText(data?.analyzed_at, new Date().toISOString());
    const messageCount = clamp(
      Number(data?.message_count),
      0,
      9999,
      state.messages.length || state.analyzedMessages.length || 0
    );
    return {
      session_id: cleanText(
        data?.session_id,
        buildSessionId(state.sessionKey, data?.chat_key, data?.analyzed_at || state.convoHash || hashConversation(state.messages))
      ),
      chat_key: cleanText(data?.chat_key, state.sessionKey),
      analyzed_at: analyzedAt,
      message_count: messageCount,
      session_read_title: cleanText(
        shortenSessionTitle(data?.session_read_title),
        'This chat'
      ),
      session_read_narrative: shortenSessionNarrative(cleanText(
        data?.session_read_narrative,
        buildSessionReadFallback(weightRows)
      )),
      session_read_mode: sessionReadMode,
      areas,
      weight_rows: weightRows,
      work_split: buildWorkSplit(weightRows),
      user_role_summary: normalizeRoleSummary(data?.user_role_summary, buildUserRoleSummary(weightRows, data?.collaboration_markers)),
      ai_role_summary: normalizeRoleSummary(data?.ai_role_summary, buildAiRoleSummary(weightRows, data?.collaboration_markers)),
      try_now: normalizeTryNow(data?.try_now, data?.try_items, weightRows),
      collaboration_markers: normalizeCollaborationMarkers(data?.collaboration_markers),
      interaction_pattern: normalizeInteractionPattern(data?.interaction_pattern),
      evidence_note: normalizeEvidenceNote(data?.evidence_note, data?.pattern_copy),
      trace: normalizeTrace(data?.trace)
    };
  }

  function stabilizeAnalysis(nextAnalysis, previousAnalysis, options = {}) {
    if (!previousAnalysis || typeof previousAnalysis !== 'object') {
      return nextAnalysis;
    }

    const stabilizedWeightRows = stabilizeWeightRows(
      nextAnalysis.weight_rows,
      previousAnalysis.weight_rows,
      options
    );

    return {
      ...nextAnalysis,
      weight_rows: stabilizedWeightRows,
      work_split: buildWorkSplit(stabilizedWeightRows)
    };
  }

  function normalizeWeightRows(rows, fallback) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return fallback.map((row) => ({
        ...row,
        verdict: deriveWeightVerdict(row.position)
      }));
    }

    const normalized = Array.from({ length: fallback.length }, (_, index) => {
      const template = fallback[index];
      const sourceRow = findWeightRowForTemplate(rows, template, index);
      const position = clamp(Number(sourceRow?.position), 0, 100, template.position);
      return normalizeWeightRange({
        key: template.key,
        label: template.label,
        position,
        range_start: clamp(Number(sourceRow?.range_start), 0, 100, template.range_start),
        range_end: clamp(Number(sourceRow?.range_end), 0, 100, template.range_end),
        verdict: deriveWeightVerdict(position),
        reason: harmonizeWeightReason(
          template.label,
          position,
          cleanText(sourceRow?.reason, template.reason)
        )
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

  function normalizeAreas(value, messages) {
    const normalized = Array.isArray(value)
      ? value
          .map((area) => ({
            key: sanitizeAreaKey(area?.key),
            salience: sanitizeAreaSalience(area?.salience),
            weight: Number.isFinite(Number(area?.weight)) ? clamp(Number(area.weight), 0, 1, undefined) : undefined
          }))
          .filter((area) => area.key)
      : [];

    const primary = normalized.find((area) => area.salience === 'primary');
    const secondary = normalized.find((area) => area.salience === 'secondary' && area.key !== primary?.key);

    if (primary) {
      return [primary, ...(secondary ? [secondary] : [])];
    }

    return inferAreasFromMessages(messages);
  }

  function inferAreasFromMessages(messages) {
    const text = (Array.isArray(messages) ? messages : [])
      .map((message) => cleanText(message?.content, ''))
      .join(' ')
      .toLowerCase();

    const scores = {
      research: countAreaMatches(text, ['research', 'source', 'article', 'citation', 'paper', 'readings', 'literature']),
      writing: countAreaMatches(text, ['essay', 'writing', 'draft', 'rewrite', 'paragraph', 'discussion post', 'summary']),
      coding: countAreaMatches(text, ['code', 'bug', 'debug', 'javascript', 'python', 'html', 'css', 'extension']),
      design: countAreaMatches(text, ['design', 'ui', 'ux', 'wireframe', 'prototype', 'layout', 'dashboard']),
      studying: countAreaMatches(text, ['study', 'studying', 'exam', 'quiz', 'lecture', 'practice question', 'class']),
      career: countAreaMatches(text, ['resume', 'cover letter', 'interview', 'job', 'career', 'linkedin']),
      presenting: countAreaMatches(text, ['slide', 'presentation', 'speaker notes', 'deck', 'pitch']),
      personal: countAreaMatches(text, ['personal', 'life', 'decision', 'feeling', 'relationship'])
    };

    const ranked = Object.entries(scores)
      .sort((left, right) => right[1] - left[1]);

    const primaryKey = ranked[0]?.[1] > 0 ? ranked[0][0] : 'writing';
    const secondaryKey = ranked[1]?.[1] > 0 && ranked[1][0] !== primaryKey ? ranked[1][0] : '';

    return [
      { key: primaryKey, salience: 'primary' },
      ...(secondaryKey ? [{ key: secondaryKey, salience: 'secondary' }] : [])
    ];
  }

  function countAreaMatches(text, keywords) {
    return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
  }

  function normalizeSessionReadMode(value, legacyChips, weightRows) {
    if (['builder', 'shared', 'thoughtful', 'tired'].includes(value)) {
      return value;
    }

    const chipTone = Array.isArray(legacyChips) ? legacyChips[0]?.tone : '';
    if (chipTone === 'miro') return 'builder';
    if (chipTone === 'shared') return 'shared';

    const buildingRow = weightRows.find((row) => row.key === 'building');
    const finalCallRow = weightRows.find((row) => row.key === 'final_call');
    if (buildingRow && buildingRow.position <= 34) return 'builder';
    if (buildingRow && finalCallRow && Math.abs(buildingRow.position - 50) < 12 && Math.abs(finalCallRow.position - 50) < 12) {
      return 'shared';
    }
    return 'thoughtful';
  }

  function normalizeRoleSummary(value, fallback) {
    return cleanText(value, fallback);
  }

  function normalizeTryNow(value, legacyItems, weightRows) {
    const providedTitle = cleanText(value?.title, '');
    const providedCopy = cleanText(value?.copy, '');
    const providedPromptExample = cleanText(value?.prompt_example, '');
    if (providedTitle && providedCopy && providedPromptExample) {
      return finalizeTryNow({
        title: providedTitle,
        copy: providedCopy,
        prompt_example: providedPromptExample
      }, weightRows);
    }

    if (Array.isArray(legacyItems) && legacyItems.length > 0) {
      const first = legacyItems[0];
      return finalizeTryNow({
        title: cleanText(first?.title, 'Try this now'),
        copy: cleanText(first?.copy, 'Use the next turn to shift who owns the decision, not just to get another draft.'),
        prompt_example: 'Give me two directions and tradeoffs, but don’t choose for me.'
      }, weightRows);
    }

    const buildingRow = weightRows.find((row) => row.key === 'building');
    const directionRow = weightRows.find((row) => row.key === 'direction');
    const problemsRow = weightRows.find((row) => row.key === 'problems');
    if (buildingRow && buildingRow.position <= 36) {
      return {
        title: 'Keep the next turn at the decision level.',
        copy: 'AI carried more of the building here. Ask for options or tradeoffs before asking for another full pass.',
        prompt_example: 'Give me two directions and tradeoffs, but don’t choose for me.'
      };
    }
    if (problemsRow && problemsRow.position >= 58) {
      return {
        title: 'Use the next turn to diagnose, not rewrite.',
        copy: 'You were already catching what felt off here. Stay with that role for one more turn before asking for a rewrite.',
        prompt_example: 'Don’t rewrite yet; help me identify what feels off.'
      };
    }
    if (directionRow && directionRow.position >= 64) {
      return {
        title: 'Keep the choice in your hands.',
        copy: 'Direction stayed with you in this chat. Ask for comparisons, not a final decision.',
        prompt_example: 'Give me two directions and tradeoffs, but don’t choose for me.'
      };
    }
    return {
      title: 'Shift the interaction, not just the output.',
      copy: 'Use the next turn to change what AI is helping with, not just to ask for another version.',
      prompt_example: 'Don’t rewrite yet; help me identify what feels off.'
    };
  }

  function finalizeTryNow(tryNow, weightRows) {
    if (isOutputOrientedTryNow(tryNow)) {
      return buildOwnershipMoveFallback(weightRows);
    }

    return {
      title: cleanText(tryNow?.title, 'Try a different move.'),
      copy: cleanText(tryNow?.copy, 'Use the next turn to shift the interaction pattern, not just to get another version.'),
      prompt_example: cleanText(
        tryNow?.prompt_example,
        'Give me two directions and tradeoffs, but don’t choose for me.'
      )
    };
  }

  function isOutputOrientedTryNow(tryNow) {
    const combined = [
      cleanText(tryNow?.title, ''),
      cleanText(tryNow?.copy, ''),
      cleanText(tryNow?.prompt_example, '')
    ].join(' ').toLowerCase();

    if (!combined) return true;

    const disallowedPhrases = [
      'write the next',
      'draft the next',
      'make the outline',
      'create an outline',
      'write the outline',
      'generate the summary',
      'make the summary',
      'write the next slide',
      'draft the next slide',
      'write the next section',
      'draft the next section',
      'write the paragraph',
      'draft the paragraph'
    ];

    if (disallowedPhrases.some((phrase) => combined.includes(phrase))) {
      return true;
    }

    const outputNouns = [
      'outline',
      'slide',
      'slides',
      'section',
      'paragraph',
      'summary',
      'essay',
      'draft',
      'presentation',
      'speaker notes',
      'bullet points'
    ];
    const outputVerb = /\b(write|draft|make|create|generate|build|polish|finish)\b/;
    const collaborationSignal = /\b(tradeoff|tradeoffs|option|options|choose|decision|identify|what feels off|don’t choose|don't choose|don’t rewrite|don't rewrite|direction|compare|reaction|react)\b/;

    return outputVerb.test(combined) && outputNouns.some((noun) => combined.includes(noun)) && !collaborationSignal.test(combined);
  }

  function buildOwnershipMoveFallback(weightRows) {
    const buildingRow = weightRows.find((row) => row.key === 'building');
    const directionRow = weightRows.find((row) => row.key === 'direction');
    const problemsRow = weightRows.find((row) => row.key === 'problems');
    const finalCallRow = weightRows.find((row) => row.key === 'final_call');

    if (buildingRow && buildingRow.position <= 36) {
      return {
        title: 'Keep the next turn at the decision level.',
        copy: 'AI carried more of the first pass here. Ask for tradeoffs or options before asking it to make the next version.',
        prompt_example: 'Give me two directions and tradeoffs, but don’t choose for me.'
      };
    }

    if (problemsRow && problemsRow.position >= 58) {
      return {
        title: 'Stay with what feels off for one more turn.',
        copy: 'You were already catching the weak spots here. Name the problem before asking AI to rewrite it.',
        prompt_example: 'Don’t rewrite yet; help me identify what feels off.'
      };
    }

    if ((directionRow && directionRow.position >= 64) || (finalCallRow && finalCallRow.position >= 64)) {
      return {
        title: 'Keep the choice in your hands.',
        copy: 'You were still carrying the direction here. Ask for comparisons so the decision stays with you.',
        prompt_example: 'Give me two directions and tradeoffs, but don’t choose for me.'
      };
    }

    return {
      title: 'Shift the interaction, not just the output.',
      copy: 'Use the next turn to change what AI is helping with, not just to ask for another version.',
      prompt_example: 'Don’t rewrite yet; help me identify what feels off.'
    };
  }

  function buildUserRoleSummary(weightRows, markers) {
    const direction = getWeightRow(weightRows, 'direction')?.position ?? 50;
    const finalCall = getWeightRow(weightRows, 'final_call')?.position ?? 50;
    const problems = getWeightRow(weightRows, 'problems')?.position ?? 50;
    const ideas = getWeightRow(weightRows, 'ideas')?.position ?? 50;
    const parts = [];

    if (direction >= 58) parts.push('set the direction');
    if (problems >= 58 || markers?.user_critiqued_or_corrected) parts.push('named what felt off');
    if (finalCall >= 58 || markers?.user_made_final_selection) parts.push('made the final calls');
    if (ideas >= 58 && parts.length < 3) parts.push('brought key ideas');

    if (parts.length === 0) {
      return 'Kept the task moving and shaped what mattered.';
    }

    return joinSummaryParts(parts);
  }

  function buildAiRoleSummary(weightRows, markers) {
    const building = getWeightRow(weightRows, 'building')?.position ?? 50;
    const research = getWeightRow(weightRows, 'research')?.position ?? 50;
    const ideas = getWeightRow(weightRows, 'ideas')?.position ?? 50;
    const parts = [];

    if (building <= 42 || markers?.ai_produced_first_pass) parts.push('built the first pass');
    if (research <= 42) parts.push('organized material');
    if (ideas <= 42 && parts.length < 3) parts.push('generated options');

    if (parts.length === 0) {
      return 'Added structure and helped move the work forward.';
    }

    return joinSummaryParts(parts);
  }

  function joinSummaryParts(parts) {
    const cleanParts = parts.filter(Boolean);
    if (cleanParts.length === 1) return `${capitalize(cleanParts[0])}.`;
    if (cleanParts.length === 2) return `${capitalize(cleanParts[0])} and ${cleanParts[1]}.`;
    return `${capitalize(cleanParts[0])}, ${cleanParts[1]}, and ${cleanParts[2]}.`;
  }

  function getWeightRow(weightRows, key) {
    return Array.isArray(weightRows) ? weightRows.find((row) => row.key === key) : null;
  }

  function capitalize(text) {
    const value = cleanText(text, '');
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
  }

  function normalizeCollaborationMarkers(value) {
    return {
      user_provided_material: Boolean(value?.user_provided_material),
      user_redirected_after_output: Boolean(value?.user_redirected_after_output),
      user_critiqued_or_corrected: Boolean(value?.user_critiqued_or_corrected),
      user_made_final_selection: Boolean(value?.user_made_final_selection),
      ai_produced_first_pass: Boolean(value?.ai_produced_first_pass)
    };
  }

  function normalizeInteractionPattern(value) {
    return {
      opening_mode: sanitizeOpeningMode(value?.opening_mode),
      arc: sanitizeInteractionArc(value?.arc),
      confidence: sanitizePatternConfidence(value?.confidence)
    };
  }

  function normalizeEvidenceNote(value, legacyPatternCopy) {
    return cleanText(
      value,
      cleanText(
        legacyPatternCopy,
        'The user handed over the task, then redirected after seeing what the first answer made possible.'
      )
    );
  }

  function normalizeTrace(value) {
    const firstKeyTurn = Number(value?.first_key_turn);
    const keyTurnIndices = Array.isArray(value?.key_turn_indices)
      ? value.key_turn_indices
          .map((entry) => Number(entry))
          .filter((entry) => Number.isFinite(entry) && entry > 0)
          .slice(0, 4)
      : [];

    return {
      first_key_turn: Number.isFinite(firstKeyTurn) && firstKeyTurn > 0 ? Math.round(firstKeyTurn) : undefined,
      key_turn_indices: keyTurnIndices
    };
  }

  function buildWorkSplit(weightRows) {
    return weightRows.reduce((split, row) => {
      split[row.key] = row.position;
      return split;
    }, {
      ideas: 50,
      direction: 50,
      research: 50,
      building: 50,
      problems: 50,
      final_call: 50
    });
  }

  function buildDashboardSessionRecord(analysis) {
    return {
      session_id: analysis.session_id,
      chat_key: analysis.chat_key,
      analyzed_at: analysis.analyzed_at,
      message_count: analysis.message_count,
      areas: analysis.areas.map((area) => ({
        key: area.key,
        salience: area.salience,
        ...(typeof area.weight === 'number' ? { weight: area.weight } : {})
      })),
      work_split: { ...analysis.work_split },
      collaboration_markers: { ...analysis.collaboration_markers },
      interaction_pattern: { ...analysis.interaction_pattern },
      evidence_note: analysis.evidence_note,
      trace: analysis.trace && (analysis.trace.first_key_turn || analysis.trace.key_turn_indices.length)
        ? {
            ...(analysis.trace.first_key_turn ? { first_key_turn: analysis.trace.first_key_turn } : {}),
            ...(analysis.trace.key_turn_indices.length ? { key_turn_indices: [...analysis.trace.key_turn_indices] } : {})
          }
        : undefined
    };
  }

  function shortenSessionNarrative(text) {
    const cleaned = cleanText(text, '');
    if (!cleaned) return '';
    const firstSentence = (cleaned.match(/[^.!?]+[.!?]?/) || [cleaned])[0].trim();
    if (firstSentence.length <= 140) return neutralizeMirrorCopy(firstSentence);
    return neutralizeMirrorCopy(`${firstSentence.slice(0, 137).trimEnd()}...`);
  }

  function shortenSessionTitle(text) {
    const cleaned = cleanText(text, '')
      .replace(/[.:!?]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return '';

    const primarySegment = cleaned
      .split(/\s[-–—:]\s|:\s/)
      .map((part) => part.trim())
      .find(Boolean) || cleaned;

    const words = primarySegment.split(' ').filter(Boolean);
    if (primarySegment.length <= 30 && words.length <= 5) {
      return primarySegment;
    }

    const cappedWords = [];
    for (const word of words) {
      const next = [...cappedWords, word].join(' ');
      if (cappedWords.length >= 5 || next.length > 30) break;
      cappedWords.push(word);
    }

    const shortened = cappedWords.join(' ').trim();
    return shortened || primarySegment.slice(0, 30).trim();
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
        verdict: deriveWeightVerdict(boundedPosition),
        reason: harmonizeWeightReason(row.label, boundedPosition, row.reason)
      });
    });
  }

  function deriveWeightVerdict(position) {
    const value = clamp(Number(position), 0, 100, 50);
    if (value <= 42) return 'AI-led';
    if (value < 58) return 'Together';
    return 'Human-led';
  }

  function harmonizeWeightReason(label, position, rawReason) {
    const cleaned = neutralizeMirrorCopy(cleanText(rawReason, ''));
    if (!cleaned) return buildWeightReasonFallback(label, position);

    const verdict = deriveWeightVerdict(position);
    const mentionsUser = /\b(user|you)\b/i.test(cleaned);
    const mentionsAi = /\b(ai|assistant)\b/i.test(cleaned);
    if (!(mentionsUser && mentionsAi)) {
      return buildWeightReasonFallback(label, position);
    }

    if (!reasonMatchesVerdict(cleaned, verdict)) {
      return buildWeightReasonFallback(label, position);
    }

    return cleaned;
  }

  function reasonMatchesVerdict(reason, verdict) {
    const text = cleanText(reason, '').toLowerCase();
    if (!text) return false;

    const userLeadSignals = [
      'user took the lead',
      'you took the lead',
      'user led',
      'you led',
      'user set',
      'you set',
      'user decided',
      'you decided',
      'user initiated',
      'you initiated',
      'user made the final call',
      'you made the final call'
    ];

    const aiLeadSignals = [
      'ai carried more',
      'assistant carried more',
      'ai handled more',
      'assistant handled more',
      'ai led',
      'assistant led',
      'ai generated more',
      'assistant generated more',
      'ai shaped more',
      'assistant shaped more',
      'ai surfaced more'
    ];

    const sharedSignals = [
      'stayed shared',
      'was shared',
      'landed in the middle',
      'both sides',
      'each side',
      'worked together'
    ];

    const hasUserLead = userLeadSignals.some((signal) => text.includes(signal));
    const hasAiLead = aiLeadSignals.some((signal) => text.includes(signal));
    const hasShared = sharedSignals.some((signal) => text.includes(signal));

    if (verdict === 'Human-led') {
      return hasUserLead && !hasAiLead;
    }

    if (verdict === 'AI-led') {
      return hasAiLead && !hasUserLead;
    }

    return hasShared || (mentionsSharedStructure(text) && !hasUserLead && !hasAiLead);
  }

  function mentionsSharedStructure(text) {
    return (
      text.includes('the user') &&
      text.includes('ai') &&
      (text.includes('and ai') || text.includes('ai helped')) &&
      (text.includes('so ') || text.includes('which kept') || text.includes('together'))
    );
  }

  function buildWeightReasonFallback(label, position) {
    const key = canonicalWeightKey({ label });
    const value = clamp(Number(position), 0, 100, 50);
    const verdict = deriveWeightVerdict(value);

    const templates = {
      ideas: {
        'Human-led': 'The user introduced the stronger ideas, and AI mainly helped expand or restate them.',
        Together: 'The user brought early ideas, and AI added options, so the brainstorming stayed shared.',
        'AI-led': 'AI generated more of the initial options, and the user steered by reacting to what felt worth keeping.'
      },
      direction: {
        'Human-led': 'The user took the lead by setting the direction, and AI supported by turning that direction into workable options.',
        Together: 'The user narrowed what mattered, and AI helped compare directions, so the steering stayed shared.',
        'AI-led': 'AI shaped more of the framing first, and the user steered by accepting, rejecting, or redirecting the options.'
      },
      research: {
        'Human-led': 'The user led by deciding what information mattered, and AI supported by gathering or organizing material around that.',
        Together: 'The user shaped what to look for, and AI helped gather and sort it, so the research work stayed shared.',
        'AI-led': 'AI carried more of the gathering and synthesis, and the user steered by choosing what felt relevant.'
      },
      building: {
        'Human-led': 'The user took the lead by making more of the actual content, and AI supported with structure or cleanup.',
        Together: 'The user shaped parts of the build, and AI helped draft parts of it, so the making was shared.',
        'AI-led': 'AI handled more of the first-pass building, and the user steered by revising, trimming, or redirecting the output.'
      },
      problems: {
        'Human-led': 'The user took the lead by catching what felt off, and AI supported by helping rework those problem spots.',
        Together: 'The user flagged issues, and AI helped surface or sort them, so the problem-finding was shared.',
        'AI-led': 'AI surfaced more of the issues first, and the user steered by deciding which fixes actually mattered.'
      },
      final_call: {
        'Human-led': 'The user kept the final call by deciding what stayed, and AI supported by laying out options to choose from.',
        Together: 'The user made the final choices, and AI helped narrow the options, so the last step landed in the middle.',
        'AI-led': 'AI pushed more of the final shaping, and the user still steered by approving, editing, or rejecting what stayed.'
      }
    };

    return templates[key]?.[verdict] || (
      verdict === 'Human-led'
        ? 'The user took the lead here, and AI mostly supported the work around that lead.'
        : verdict === 'AI-led'
          ? 'AI carried more of this part, and the user mainly steered by reacting or redirecting.'
          : 'The user and AI each carried part of this work, so it landed in the middle.'
    );
  }

  function weightVerdictTone(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('human')) return 'you';
    if (text.includes('together')) return 'shared';
    return 'miro';
  }

  function getAnalysisSprite(data) {
    if (data?.session_read_mode === 'builder') return SPRITES.builder;
    if (data?.session_read_mode === 'shared') return SPRITES.shared;
    if (data?.session_read_mode === 'tired') return SPRITES.tired;
    return SPRITES.thoughtful;
  }

  function updatePetSprite() {
    const petImage = document.getElementById('miro-pet-image');
    if (!petImage) return;

    if (state.analyzing) {
      petImage.src = SPRITES.thoughtful;
      return;
    }

    if (state.latestAnalysis) {
      const sprite = getAnalysisSprite(state.latestAnalysis);
      petImage.src = sprite;
      return;
    }

    const defaultSprite = state.messages.length >= MIN_TURNS ? SPRITES.thoughtful : SPRITES.shared;
    petImage.src = defaultSprite;
  }

  function getHoverText() {
    if (state.analyzing) return 'Reading this chat.';
    if (state.messages.length < MIN_TURNS) return 'Need a little more chat first.';
    if (state.stale) return 'This chat changed. Refresh the read.';
    if (state.latestAnalysis) {
      return cleanText(state.latestAnalysis.session_read_title, 'I have a read on this chat.');
    }
    return 'Quick read of this chat.';
  }

  function maybeShowIntroNudge() {
    if (state.introNudgeShown || state.panelOpen || state.latestAnalysis || state.messages.length < MIN_TURNS) {
      return;
    }

    state.introNudgeShown = true;
    showPetHint("Click me when you're done", 4800);
  }

  function showPetHint(message, duration = 4000) {
    const hover = document.getElementById('miro-hover');
    if (!hover) return;

    hover.textContent = message;
    hover.classList.add('visible', 'miro-hint');

    if (state.introNudgeTimer) {
      clearTimeout(state.introNudgeTimer);
    }

    state.introNudgeTimer = window.setTimeout(() => {
      hidePetHint();
    }, duration);
  }

  function hidePetHint() {
    const hover = document.getElementById('miro-hover');
    if (!hover) return;

    if (state.introNudgeTimer) {
      clearTimeout(state.introNudgeTimer);
      state.introNudgeTimer = null;
    }

    hover.classList.remove('visible', 'miro-hint');
  }

  function neutralizeMirrorCopy(text) {
    return cleanText(text, '')
      .replace(/\bI,?\s*your AI\b/gi, 'AI')
      .replace(/\bMiro\b/gi, 'AI')
      .replace(/\bI\b/g, 'AI')
      .replace(/\bmy\b/gi, "AI's")
      .replace(/\bme\b/gi, 'AI')
      .replace(/\bwe\b/gi, 'the chat')
      .replace(/\bcompanion\b/gi, 'AI')
      .replace(/\s+/g, ' ')
      .trim();
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
      state.dashboardSession = snapshot.dashboardSession && typeof snapshot.dashboardSession === 'object'
        ? snapshot.dashboardSession
        : (state.latestAnalysis ? buildDashboardSessionRecord(state.latestAnalysis) : null);
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
    const dashboardSession = state.dashboardSession || (state.latestAnalysis ? buildDashboardSessionRecord(state.latestAnalysis) : null);
    const snapshot = {
      sessionKey: state.sessionKey,
      pageTitle: document.title,
      lastAnalysis: state.latestAnalysis,
      dashboardSession,
      convoHash: state.convoHash,
      analyzedMessages: cloneMessages(state.analyzedMessages),
      analysisInstances: state.analysisInstances.slice(-MAX_ANALYSIS_INSTANCES),
      updatedAt: new Date().toISOString()
    };

    try {
      const stored = await chrome.storage.local.get([DASHBOARD_SESSION_STORAGE_KEY]);
      const dashboardSessions = stored[DASHBOARD_SESSION_STORAGE_KEY] && typeof stored[DASHBOARD_SESSION_STORAGE_KEY] === 'object'
        ? stored[DASHBOARD_SESSION_STORAGE_KEY]
        : {};

      if (dashboardSession?.chat_key) {
        dashboardSessions[dashboardSession.chat_key] = dashboardSession;
      }

      await chrome.storage.local.set({
        [storageKey]: snapshot,
        [DASHBOARD_SESSION_STORAGE_KEY]: dashboardSessions
      });
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

  function buildSessionId(sessionKey, chatKey, nonce) {
    return `session_${simpleHash(`${chatKey || sessionKey}|${nonce || ''}`)}`;
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

  function sanitizeAreaKey(value) {
    return Object.prototype.hasOwnProperty.call(AREA_LABELS, value) ? value : '';
  }

  function sanitizeAreaSalience(value) {
    return value === 'secondary' ? 'secondary' : 'primary';
  }

  function sanitizeOpeningMode(value) {
    return ['delegation', 'contextualized', 'critique', 'pastein', 'exploration'].includes(value)
      ? value
      : 'delegation';
  }

  function sanitizeInteractionArc(value) {
    return ['draft_redirect_rebuild', 'ask_synthesize_decide', 'debug_test_fix', 'brainstorm_refine', 'explain_practice_check'].includes(value)
      ? value
      : 'draft_redirect_rebuild';
  }

  function sanitizePatternConfidence(value) {
    return ['low', 'medium', 'high'].includes(value) ? value : 'medium';
  }

  function getAreaLabel(key) {
    return AREA_LABELS[key] || 'Writing';
  }

  function simpleHash(value) {
    let hash = 0;
    const text = String(value || '');
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
})();
