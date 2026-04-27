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
      <button id="miro-pet" aria-label="Open Miro reflection">
        <div class="miro-glow"></div>
        <img id="miro-pet-image" alt="Miro" />
        <div id="miro-badge">!</div>
      </button>
      <div id="miro-hover" role="status" aria-live="polite">I can read this chat.</div>
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
    const patternCard = derivePatternCard(data);
    const sessionReadCopy = composeSessionReadNarrative(data);

    const body = document.getElementById('miro-panel-body');
    const headerIcon = document.getElementById('miro-header-icon');
    if (headerIcon) headerIcon.src = sprite;

    body.innerHTML = `
      <section>
        <div class="miro-section-label">This session</div>
        <div class="miro-card miro-session-read">
          <img class="miro-session-sprite" src="${sprite}" alt="${escapeAttr(data.session_read_title)}" />
          <div class="miro-session-stack">
            <div class="miro-session-title">${escapeHtml(data.session_read_title)}</div>
            <div class="miro-area-chip-row">
              ${renderAreaChips(data.areas)}
            </div>
            <div class="miro-session-narrative">${escapeHtml(sessionReadCopy)}</div>
          </div>
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

      <section class="miro-pattern-section">
        <div class="miro-pattern-card">
          <div class="miro-pattern-block">
            <div class="miro-pattern-label">Did you know...</div>
            <div class="miro-pattern-lead">${escapeHtml(patternCard.didYouKnow)}</div>
          </div>
          <div class="miro-pattern-block">
            <div class="miro-pattern-label">This helps when...</div>
            <div class="miro-pattern-copy">${escapeHtml(patternCard.thisHelpsWhen)}</div>
          </div>
          <div class="miro-pattern-block">
            <div class="miro-pattern-label">Try a different move</div>
            <div class="miro-pattern-copy">${escapeHtml(patternCard.tryDifferentMove)}</div>
          </div>
        </div>
      </section>

      <div class="miro-footer-action">
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

  function renderAreaChips(areas) {
    return areas.map((area) => `
      <span class="miro-area-chip ${escapeAttr(area.salience)}">${escapeHtml(getAreaLabel(area.key))}</span>
    `).join('');
  }

  function derivePatternCard(data) {
    const rows = mapWeightRowsByKey(data?.weight_rows);
    const markers = data?.collaboration_markers || {};
    const building = rows.building?.position ?? 50;
    const direction = rows.direction?.position ?? 50;
    const research = rows.research?.position ?? 50;
    const problems = rows.problems?.position ?? 50;
    const finalCall = rows.final_call?.position ?? 50;
    const ideas = rows.ideas?.position ?? 50;

    if (building <= 36 && direction >= 62 && finalCall >= 70) {
      return {
        didYouKnow: 'You kept the direction here even when I handled most of the first pass.',
        thisHelpsWhen: 'That can help when you know what the work needs to become, but do not want to start from a blank page.',
        tryDifferentMove: 'Before the next reply, write one sentence of direction in your own words.'
      };
    }

    if (markers.user_redirected_after_output || markers.user_critiqued_or_corrected || problems >= 60) {
      return {
        didYouKnow: 'You mostly shaped this chat by reacting after I gave you something to push against.',
        thisHelpsWhen: 'That can help when it is easier to notice what you want by seeing an option first than by starting cold.',
        tryDifferentMove: 'Before the next reply, name the one part that still feels off in your own words.'
      };
    }

    if (markers.user_provided_material && research <= 40) {
      return {
        didYouKnow: 'You handed me the material, and I carried more of the sorting and synthesis from there.',
        thisHelpsWhen: 'That can help when you already have the ingredients and want help turning them into a usable first shape.',
        tryDifferentMove: 'Ask me for two possible framings before asking for a full summary.'
      };
    }

    if (building <= 34 && !markers.user_redirected_after_output && !markers.user_critiqued_or_corrected) {
      return {
        didYouKnow: 'I showed up more as a drafter here than as a thinking partner.',
        thisHelpsWhen: 'That can help when momentum matters more than polish and you mainly need a workable starting point.',
        tryDifferentMove: 'Tell me not to polish yet - just help choose the argument first.'
      };
    }

    if (ideas >= 58 && direction >= 58 && finalCall >= 72) {
      return {
        didYouKnow: 'You kept more of the judgment here, even while I helped move the process along.',
        thisHelpsWhen: 'That can help when the thinking is already yours and you mostly want a sounding board or a sharper first pass.',
        tryDifferentMove: 'Ask for two options instead of a full rewrite.'
      };
    }

    return {
      didYouKnow: 'This chat stayed fairly shared, with each of us carrying a different part of the work.',
      thisHelpsWhen: 'That can help when you want support without handing over the whole shape of the task.',
      tryDifferentMove: cleanText(
        data?.try_now?.copy,
        'Before the next reply, tell me what part you want to keep fully yours.'
      )
    };
  }

  function mapWeightRowsByKey(rows) {
    return (Array.isArray(rows) ? rows : []).reduce((mapped, row) => {
      if (row?.key) {
        mapped[row.key] = row;
      }
      return mapped;
    }, {});
  }

  function composeSessionReadNarrative(data) {
    const modeLead = getSessionModeLead(data?.session_read_mode);
    const provided = cleanText(data?.session_read_narrative, '');
    const stripped = provided
      .replace(/^I,\s*your AI,[^.?!]*[.?!]\s*/i, '')
      .replace(/^(You were|You came in|You started|This chat)/i, (match) => match)
      .trim();

    if (stripped) {
      return `${modeLead} ${stripped}`;
    }

    return `${modeLead} ${buildSessionReadFallback(data?.weight_rows)}`;
  }

  function getSessionModeLead(mode) {
    if (mode === 'builder') return 'I, your AI, showed up more like a builder here.';
    if (mode === 'shared') return 'I, your AI, showed up more like a collaborator here.';
    if (mode === 'tired') return 'I, your AI, showed up more like a lighter helper here.';
    return 'I, your AI, showed up more like a thinking partner here.';
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
        data?.session_read_title,
        'Mostly me building, you steering'
      ),
      session_read_narrative: shortenSessionNarrative(cleanText(
        data?.session_read_narrative,
        'You came in with a concrete task and let me build the first pass. The stronger shift happened once you redirected what the work needed to become.'
      )),
      session_read_mode: sessionReadMode,
      areas,
      weight_rows: weightRows,
      work_split: buildWorkSplit(weightRows),
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

  function normalizeTryNow(value, legacyItems, weightRows) {
    const providedTitle = cleanText(value?.title, '');
    const providedCopy = cleanText(value?.copy, '');
    if (providedTitle && providedCopy) {
      return {
        title: providedTitle,
        copy: providedCopy
      };
    }

    if (Array.isArray(legacyItems) && legacyItems.length > 0) {
      const first = legacyItems[0];
      return {
        title: cleanText(first?.title, 'Try this now'),
        copy: cleanText(first?.copy, 'Before asking for another revision, name the one part that still feels off.')
      };
    }

    const buildingRow = weightRows.find((row) => row.key === 'building');
    const directionRow = weightRows.find((row) => row.key === 'direction');
    if (buildingRow && buildingRow.position <= 36) {
      return {
        title: 'Set the target for my next answer',
        copy: 'Tell me what you want the next answer to optimize for: clarity, depth, or speed.'
      };
    }
    if (directionRow && directionRow.position >= 64) {
      return {
        title: 'Name what is still off',
        copy: 'Before asking for another revision, name the one part that still feels off.'
      };
    }
    return {
      title: 'Reset the goal',
      copy: 'Reset the conversation with: "Ignore the earlier framing - here is the actual goal."'
    };
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
    if (firstSentence.length <= 190) return firstSentence;
    return `${firstSentence.slice(0, 187).trimEnd()}...`;
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
    if (value <= 24) return 'Clearly AI';
    if (value <= 42) return 'Leaned to AI';
    if (value < 58) return 'Shared';
    if (value < 76) return 'Leaned to you';
    return 'Clearly you';
  }

  function harmonizeWeightReason(label, position, rawReason) {
    const value = clamp(Number(position), 0, 100, 50);
    if (value <= 24) {
      return buildExtremeWeightReason('ai', label);
    }

    if (value >= 76) {
      return buildExtremeWeightReason('you', label);
    }

    const lead = getWeightLeadSentence(label, value);
    const cleaned = cleanText(rawReason, '');
    const stripped = cleaned
      .replace(/^(i|you|we)\s+took the lead[^.?!]*[.?!]\s*/i, '')
      .replace(/^(i|you|we)\s+(carried|did|handled)\s+[^.?!]*[.?!]\s*/i, '')
      .trim();

    if (!stripped) {
      return lead;
    }

    return `${lead} ${stripped}`;
  }

  function buildExtremeWeightReason(side, label) {
    const action = getWeightActionPhrase(label);
    if (side === 'ai') {
      return `I took the lead on ${action} here. ${getExtremeWeightDetail('ai', label)}`;
    }
    return `You took the lead on ${action} here. ${getExtremeWeightDetail('you', label)}`;
  }

  function getExtremeWeightDetail(side, label) {
    const key = canonicalWeightKey({ label });

    if (side === 'ai') {
      if (key === 'ideas') return 'I was the one surfacing most of the options and first directions.';
      if (key === 'direction') return 'I was the one shaping what path the work followed.';
      if (key === 'research') return 'I was the one gathering, sorting, and synthesizing the material.';
      if (key === 'building') return 'I was the one making the first version of the thing itself.';
      if (key === 'problems') return 'I was the one spotting what needed to be fixed or adjusted.';
      if (key === 'final_call') return 'I was the one determining what stayed in and what got dropped.';
      return 'I was the one carrying that part of the work.';
    }

    if (key === 'ideas') return 'You were the one surfacing most of the options and first directions.';
    if (key === 'direction') return 'You were the one shaping what path the work followed.';
    if (key === 'research') return 'You were the one gathering, sorting, and synthesizing the material.';
    if (key === 'building') return 'You were the one making the first version of the thing itself.';
    if (key === 'problems') return 'You were the one spotting what needed to be fixed or adjusted.';
    if (key === 'final_call') return 'You were the one determining what stayed in and what got dropped.';
    return 'You were the one carrying that part of the work.';
  }

  function getWeightLeadSentence(label, position) {
    const action = getWeightActionPhrase(label);
    const value = clamp(Number(position), 0, 100, 50);

    if (value <= 42) {
      return `I took the lead on ${action} here.`;
    }

    if (value < 58) {
      return `We did ${action} together here.`;
    }

    return `You took the lead on ${action} here.`;
  }

  function getWeightActionPhrase(label) {
    const text = String(label || '').toLowerCase();
    if (text.includes('coming up with ideas')) return 'coming up with ideas';
    if (text.includes('deciding the direction')) return 'deciding the direction';
    if (text.includes('doing the research')) return 'doing the research';
    if (text.includes('building the thing')) return 'building the thing';
    if (text.includes('catching problems')) return 'catching problems';
    if (text.includes('making the final call')) return 'making the final call';
    return 'that part of the work';
  }

  function describeWeightBasisFromRow(row) {
    return `${row.label} ${describeWeightLean(row.position)} this session`;
  }

  function describeWeightLean(position) {
    const value = clamp(Number(position), 0, 100, 50);
    if (value <= 24) return 'leaned heavily to AI';
    if (value <= 42) return 'leaned to AI';
    if (value < 58) return 'felt shared';
    if (value < 76) return 'leaned to you';
    return 'leaned heavily to you';
  }

  function weightVerdictTone(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('you')) return 'you';
    if (text.includes('shared')) return 'shared';
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
