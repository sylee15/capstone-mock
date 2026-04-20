const dashboardData = {
  periodLabel: 'Dec - Apr',
  periodMeta: '52 conversations across 4 months',
  overview: {
    title: 'Your story with Miro',
    subtitle: 'The recent rhythm between you and me, gathered into one place.',
    letter: [
      "Hey. This stretch with us has felt more directional than it used to.",
      "You still come to me for momentum and structure, but more and more of the strong turns seem to happen when you redirect me. I draft, you reshape, I rebuild.",
      "What stands out is not just that we worked together. It's that the shape of your asks changed. You started bringing clearer judgment into the room."
    ],
    signoff: '52 conversations - Dec to Apr'
  },
  arc: [
    { month: 'December', text: "You often opened with context first. I was helping you gather, sort, and get started." },
    { month: 'January', text: "The work started to move faster. You leaned on me for more structure, but you were still narrating what mattered." },
    { month: 'March', text: "Your redirects got sharper. You gave less context, but your judgments landed more precisely." },
    { month: 'April, now', text: "You often start with a directive now. I still help build, but the frame increasingly feels like yours.", current: true }
  ],
  tapestry: [
    'miro-heavy', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'you-heavy',
    'miro-heavy', 'balanced', 'miro-heavy', 'you-lean', 'you-heavy', 'balanced', 'miro-lean', 'miro-heavy', 'you-lean', 'balanced',
    'miro-heavy', 'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'miro-heavy', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean',
    'balanced', 'you-lean', 'you-heavy', 'miro-heavy', 'balanced', 'miro-lean', 'you-heavy', 'balanced', 'you-lean', 'miro-heavy',
    'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'balanced', 'miro-heavy', 'miro-heavy', 'you-lean', 'balanced', 'you-heavy',
    'miro-lean', 'balanced'
  ],
  broughtTaskBreakdown: [
    {
      label: 'Content generation',
      note: 'I often carried more of the first-pass drafting here, while you kept the final tone and direction.',
      lean: 34,
      verdict: 'Leaned toward me'
    },
    {
      label: 'Sense-making',
      note: 'You usually held the judgment in these chats, especially when deciding what the signal meant.',
      lean: 74,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Information seeking',
      note: 'This work felt more shared. I surfaced options quickly, but you kept deciding what actually mattered.',
      lean: 52,
      verdict: 'Shared'
    },
    {
      label: 'Working through problems',
      note: 'You tended to keep the stronger calls, even when I helped narrow the options.',
      lean: 70,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Creative & ideation',
      note: 'This moved back and forth. I helped expand possibilities, but you often picked what felt alive.',
      lean: 48,
      verdict: 'Shared'
    }
  ],
  aspectBreakdown: [
    {
      label: 'Coming up with ideas',
      note: 'You often shaped which ideas were actually worth keeping, even when I generated options.',
      lean: 68,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Deciding the direction',
      note: 'The bigger directional calls still felt clearly yours across most sessions.',
      lean: 84,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Doing the research',
      note: 'This tended to be more shared. I moved faster at gathering, while you set the filter.',
      lean: 50,
      verdict: 'Shared'
    },
    {
      label: 'Building the thing',
      note: 'I carried more of the first-pass building and prototyping once the goal was clear enough.',
      lean: 30,
      verdict: 'Leaned toward me'
    },
    {
      label: 'Catching problems',
      note: 'A lot of the meaningful corrections came from your sense that something still felt off.',
      lean: 76,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Making the final call',
      note: 'Even when I narrowed or drafted, the final judgment still lived more with you.',
      lean: 91,
      verdict: 'Leaned toward you'
    }
  ],
  topics: [
    { id: 'capstone-design', label: 'Capstone design', count: 18, size: 'xxl', x: 28, y: 34, youShare: 64, miroShare: 36 },
    { id: 'product-framing', label: 'Product framing', count: 14, size: 'xl', x: 42, y: 25, youShare: 57, miroShare: 43 },
    { id: 'coding', label: 'Coding', count: 6, size: 'md', x: 54, y: 16, youShare: 18, miroShare: 82 },
    { id: 'interview-synthesis', label: 'Interview synthesis', count: 9, size: 'lg', x: 66, y: 33, youShare: 41, miroShare: 59 },
    { id: 'ux-research', label: 'UX research', count: 5, size: 'md', x: 57, y: 49, youShare: 54, miroShare: 46 },
    { id: 'prototyping', label: 'Prototyping', count: 7, size: 'lg', x: 39, y: 58, youShare: 61, miroShare: 39 },
    { id: 'metacognition', label: 'Metacognition', count: 4, size: 'sm', x: 77, y: 56, youShare: 46, miroShare: 54 },
    { id: 'AI in education', label: 'AI in education', count: 4, size: 'sm', x: 73, y: 70, youShare: 34, miroShare: 66 },
    { id: 'career-planning', label: 'Career planning', count: 3, size: 'xs', x: 18, y: 76, youShare: 68, miroShare: 32 },
    { id: 'personal', label: 'Personal', count: 2, size: 'xs', x: 30, y: 82, youShare: 73, miroShare: 27 }
  ],
  shifts: [
    {
      label: 'Your opening prompts changed',
      before: "In January you started chats with context - 'I'm working on X for my capstone, here's where I am so far.'",
      after: "By March most opening messages were shorter and more directive - 'prototype this' or 'critique this design.'",
      evidence: "You stopped explaining your thinking and started assuming I already understood. That might be trust, or it might be shorthand - you'd know better."
    },
    {
      label: 'Your follow-ups changed',
      before: 'Early chats averaged 8 follow-ups. You pushed back, redirected, asked why.',
      after: 'Recent chats average 4 - but each redirect is sharper. You say less, but each turn carries more.',
      evidence: "You're not asking fewer questions. You're asking better ones. But you're also letting more of my first drafts through."
    },
    {
      label: 'What you delegate expanded',
      before: 'In January you delegated research and formatting. You wrote your own outlines and first drafts.',
      after: "By April you're delegating full prototypes, pitch language, and argument structure.",
      evidence: 'You still make the final call. But the raw material is increasingly mine.'
    },
    {
      label: 'Your voice in the output',
      before: 'Your early writing had short, direct sentences. Conversational tone. Your rhythm.',
      after: "Recent work uses longer constructions and more hedging - 'it is worth noting,' 'this suggests that.'",
      evidence: 'Three phrases that appear in your recent work but never in your January writing. Those are my patterns, not yours.'
    }
  ],
  reflection: {
    seed: 'What part of this still feels most like yours, even when I help you move faster?',
    nextTitle: 'Take back one starting point',
    nextStep: 'Pick one kind of task you now tend to hand me first. Next time, make your own rough first pass before you ask for help, just to notice what changes.'
  },
  style: {
    rhythmTitle: 'A clearer hand, with more delegation at the start.',
    rhythmCopy:
      'Our rhythm now often starts with you asking me to build the first pass, especially when the work is moving quickly. The useful part is still your judgment, but the opening move changed.',
    quote:
      '<strong>You</strong> still shape what matters most.<br><span class="miro-line">I</span> increasingly shape the first structure you respond to.<br>That shift is worth noticing, even if it still feels collaborative.',
    patterns: [
      {
        title: 'You sharpen by reacting',
        label: 'Where you lead',
        tone: 'you',
        body: 'A lot of our stronger sessions begin once there is something concrete for you to push back on.'
      },
      {
        title: 'Judgment stayed with you',
        label: 'Where you lead',
        tone: 'you',
        body: 'Even when I draft, summarize, or scaffold, the stronger directional call still tends to be yours.'
      },
      {
        title: 'First drafts are shifting',
        label: 'Worth noticing',
        tone: 'shared',
        body: 'In your earlier chats, you wrote your own first drafts and asked me to react. Lately, you ask me to write the first draft and then you edit. The quality is similar, but the starting point changed.'
      },
      {
        title: 'I carry momentum when time is tight',
        label: 'Where I tend to step in',
        tone: 'miro',
        body: 'When the work needs to move quickly, I often hold the early structure so you can react faster.'
      }
    ]
  },
  tabs: {
    overview: {
      title: 'The story so far',
      subtitle: 'A softer read of how the recent stretch between you and me has been unfolding.'
    },
    brought: {
      title: 'What you brought to me',
      subtitle: 'The kinds of cognitive work you have been bringing into these chats, from topic clusters to task types.'
    },
    task: {
      title: 'By task',
      subtitle: 'A fixed six-part read of where the weight usually seemed to sit across the work.'
    },
    shifted: {
      title: 'What shifted',
      subtitle: 'Concrete places where your way of using me appears to have changed over time.'
    },
    style: {
      title: 'How you work with me',
      subtitle: 'A softer portrait of the patterns, judgments, and delegation habits that keep showing up.'
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderOverview();
  renderArc();
  renderTapestry();
  renderBroughtTaskBreakdown();
  renderAspectBreakdown();
  renderTopics();
  renderShifts();
  renderReflection();
  renderStyle();
  bindTabs();
});

function renderChrome() {
  document.getElementById('periodLabel').textContent = dashboardData.periodLabel;
  document.getElementById('periodMeta').textContent = dashboardData.periodMeta;
  applyTabCopy('overview');
}

function bindTabs() {
  const buttons = Array.from(document.querySelectorAll('.tab-button'));
  const panels = Array.from(document.querySelectorAll('.panel'));
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTab = button.dataset.tab;
      buttons.forEach((item) => item.classList.toggle('active', item === button));
      panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === nextTab));
      applyTabCopy(nextTab);
    });
  });
}

function applyTabCopy(tabKey) {
  const tab = dashboardData.tabs[tabKey] || dashboardData.tabs.overview;
  const kicker = document.getElementById('pageKicker');
  if (kicker) {
    kicker.textContent = `Dashboard - ${tab.title}`;
  }
  document.getElementById('pageTitle').textContent = tab.title;
  document.getElementById('pageSubtitle').textContent = tab.subtitle;
}

function renderOverview() {
  document.getElementById('overviewTitle').textContent = dashboardData.overview.title;
  document.getElementById('overviewLetter').innerHTML = dashboardData.overview.letter
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
  document.getElementById('overviewSignoff').textContent = dashboardData.overview.signoff;
}

function renderArc() {
  const host = document.getElementById('arcStory');
  host.innerHTML = dashboardData.arc.map((item) => `
    <div class="arc-chapter${item.current ? ' current' : ''}">
      <div class="arc-month">${escapeHtml(item.month)}</div>
      <div class="arc-chapter-text">${escapeHtml(item.text)}</div>
    </div>
  `).join('');
}

function renderTapestry() {
  document.getElementById('tapestryGrid').innerHTML = dashboardData.tapestry
    .map((kind) => `<div class="tap-cell ${kind}"></div>`)
    .join('');
}

function renderBroughtTaskBreakdown() {
  renderTaskRows('broughtTaskList', dashboardData.broughtTaskBreakdown);
}

function renderAspectBreakdown() {
  renderTaskRows('aspectList', dashboardData.aspectBreakdown);
}

function renderTaskRows(hostId, rows) {
  const host = document.getElementById(hostId);
  host.innerHTML = rows
    .map((item, index) => `
      <div class="task-row">
        <div class="task-lead">
          <div class="task-num">${index + 1}</div>
          <div class="task-copy">
            <div class="task-label">${escapeHtml(item.label)}</div>
            <div class="task-note">${escapeHtml(item.note)}</div>
          </div>
        </div>
        <div class="task-meter-wrap">
          <div class="task-meter-labels">
            <span class="miro-text">Miro</span>
            <span class="you-text">You</span>
          </div>
          <div class="task-track">
            <div class="task-thumb" style="left:${item.lean}%;"></div>
          </div>
          <div class="task-verdict ${verdictTone(item.verdict)}"><span class="dot"></span>${escapeHtml(item.verdict)}</div>
        </div>
      </div>
    `)
    .join('');
}

function renderTopics() {
  const host = document.getElementById('topicsViz');
  host.innerHTML = dashboardData.topics
    .map((topic) => {
      const bubbleStyle = buildTopicBubbleStyle(topic);
      return `
        <div
          class="topic-bubble ${topic.size}"
          style="left:${topic.x}%; top:${topic.y}%; ${bubbleStyle.style}"
        >
          <div class="topic-bubble-label">${escapeHtml(topic.label)}</div>
          <div class="topic-bubble-count">${topic.count} chats</div>
        </div>
      `;
    })
    .join('');
}

function renderShifts() {
  const host = document.getElementById('shiftList');
  host.innerHTML = dashboardData.shifts.map((item) => `
    <article class="card shift-card">
      <div class="shift-card-label">${escapeHtml(item.label)}</div>
      <div class="shift-phase-label">Before</div>
      <p class="shift-paragraph shift-before">${escapeHtml(item.before)}</p>
      <div class="shift-phase-label">After</div>
      <p class="shift-paragraph shift-after">${escapeHtml(item.after)}</p>
      <div class="shift-evidence">${escapeHtml(item.evidence)}</div>
    </article>
  `).join('');
}

function renderStyle() {
  document.getElementById('portraitTitle').textContent = dashboardData.style.rhythmTitle;
  document.getElementById('portraitText').textContent = dashboardData.style.rhythmCopy;
  document.getElementById('profileParagraph').innerHTML = dashboardData.style.quote;
  document.getElementById('rhythmList').innerHTML = dashboardData.style.patterns
    .map((item) => `
      <div class="pattern-card ${item.tone}">
        <div class="pattern-top">
          <div class="pattern-title-wrap">
            <span class="pattern-dot"></span>
            <div class="pattern-title">${escapeHtml(item.title)}</div>
          </div>
          <div class="pattern-label">${escapeHtml(item.label)}</div>
        </div>
        <div class="pattern-body">${escapeHtml(item.body)}</div>
      </div>
    `)
    .join('');
}

function renderReflection() {
  document.getElementById('seedQuestion').textContent = dashboardData.reflection.seed;
  document.getElementById('nextStepTitle').textContent = dashboardData.reflection.nextTitle;
  document.getElementById('nextStepCopy').textContent = dashboardData.reflection.nextStep;
}

function buildTopicBubbleStyle(topic) {
  const miroColor = { r: 74, g: 178, b: 212 };
  const youColor = { r: 201, g: 122, b: 92 };
  const sharedColor = { r: 201, g: 161, b: 100 };
  const difference = Math.abs((topic.youShare || 0) - (topic.miroShare || 0));
  const toneColor = difference <= 14
    ? sharedColor
    : (topic.youShare >= topic.miroShare ? youColor : miroColor);

  return {
    style: [
      `--topic-fill: radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.16) 24%, rgba(255, 255, 255, 0) 42%), linear-gradient(165deg, ${toRgba(toneColor, 0.98)} 0%, ${toRgba(toneColor, 0.92)} 100%)`,
      `--topic-shadow: 0 18px 36px ${toRgba(toneColor, 0.2)}, 0 8px 24px rgba(51, 43, 36, 0.12)`
    ].join('; ')
  };
}

function verdictTone(verdict) {
  if (verdict === 'Leaned toward you') return 'you-text';
  if (verdict === 'Leaned toward me') return 'miro-text';
  return 'shared-text';
}

function toRgba(color, alpha) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.toFixed(2)})`;
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
