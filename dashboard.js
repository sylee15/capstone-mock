const D = {
  periodLabel: 'Dec - Apr',
  periodMeta: '52 chats over 4 months',

  overview: {
    title: 'Your story so far',
    letter: [
      'This stretch has felt more directional than it used to.',
      'You still come to me for momentum and structure, but the strong turns happen when you redirect me. I draft, you reshape, I rebuild.',
      'The shape of your asks changed. You started bringing clearer judgment into the room.'
    ],
    signoff: '52 conversations - Dec to Apr'
  },

  arc: [
    { month: 'December', text: 'You opened with context. I helped you gather and get started.' },
    { month: 'January', text: 'Work moved faster. You leaned on me for structure but still narrated what mattered.' },
    { month: 'March', text: 'Your redirects got sharper. Less context, more precise judgment.' },
    { month: 'April', text: 'You start with directives now. I build, but the frame is yours.', current: true }
  ],

  tapestry: [
    'miro-heavy', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean', 'balanced',
    'you-lean', 'you-heavy', 'miro-heavy', 'balanced', 'miro-heavy', 'you-lean', 'you-heavy', 'balanced',
    'miro-lean', 'miro-heavy', 'you-lean', 'balanced', 'miro-heavy', 'miro-lean', 'balanced', 'you-heavy',
    'you-lean', 'miro-heavy', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean',
    'you-heavy', 'miro-heavy', 'balanced', 'miro-lean', 'you-heavy', 'balanced', 'you-lean', 'miro-heavy',
    'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'balanced', 'miro-heavy', 'miro-heavy', 'you-lean',
    'balanced', 'you-heavy', 'miro-lean', 'balanced'
  ],

  topics: [
    { label: 'Capstone design', count: 18, size: 'xxl', x: 28, y: 34, youShare: 64, miroShare: 36 },
    { label: 'Product framing', count: 14, size: 'xl', x: 44, y: 24, youShare: 57, miroShare: 43 },
    { label: 'Coding', count: 6, size: 'md', x: 56, y: 14, youShare: 18, miroShare: 82 },
    { label: 'Interview synthesis', count: 9, size: 'lg', x: 68, y: 32, youShare: 41, miroShare: 59 },
    { label: 'UX research', count: 5, size: 'md', x: 60, y: 50, youShare: 54, miroShare: 46 },
    { label: 'Prototyping', count: 7, size: 'lg', x: 38, y: 58, youShare: 61, miroShare: 39 },
    { label: 'Metacognition', count: 4, size: 'sm', x: 78, y: 54, youShare: 46, miroShare: 54 },
    { label: 'AI in education', count: 4, size: 'sm', x: 74, y: 70, youShare: 34, miroShare: 66 },
    { label: 'Career planning', count: 3, size: 'xs', x: 20, y: 74, youShare: 68, miroShare: 32 },
    { label: 'Personal', count: 2, size: 'xs', x: 32, y: 80, youShare: 73, miroShare: 27 }
  ],

  aspects: [
    {
      label: 'Coming up with ideas',
      position: 68,
      lo: 52,
      hi: 82,
      verdict: 'Mostly you',
      tone: 'you',
      trendLine: 'Shifting toward you since January.',
      aiLine: 'AI generated most of the ideas in',
      aiTopics: ['Coding', 'AI in education'],
      youLine: 'You came up with more of the ideas in',
      youTopics: ['Capstone design', 'Prototyping']
    },
    {
      label: 'Deciding the direction',
      position: 84,
      lo: 70,
      hi: 94,
      verdict: 'Clearly you',
      tone: 'you',
      trendLine: 'Stayed consistent over time.',
      aiLine: 'AI set more of the direction in',
      aiTopics: ['Coding'],
      youLine: 'You decided the direction in',
      youTopics: ['Capstone design', 'Product framing', 'Prototyping']
    },
    {
      label: 'Doing the research',
      position: 50,
      lo: 32,
      hi: 66,
      verdict: 'Shared',
      tone: 'shared',
      trendLine: 'Shifting toward AI since February.',
      aiLine: 'AI did more of the gathering and synthesis in',
      aiTopics: ['Interview synthesis', 'AI in education'],
      youLine: 'You drove the research yourself in',
      youTopics: ['UX research', 'Career planning']
    },
    {
      label: 'Building the thing',
      position: 30,
      lo: 16,
      hi: 48,
      verdict: 'Leaned to AI',
      tone: 'miro',
      trendLine: 'Shifting toward AI since January.',
      aiLine: 'AI did most of the building in',
      aiTopics: ['Coding', 'Prototyping', 'Product framing'],
      youLine: 'You built more of the work yourself in',
      youTopics: ['Personal']
    },
    {
      label: 'Catching problems',
      position: 76,
      lo: 58,
      hi: 88,
      verdict: 'Mostly you',
      tone: 'you',
      trendLine: 'Shifting toward you since March.',
      aiLine: 'AI caught more of the issues in',
      aiTopics: ['Coding'],
      youLine: 'Your corrections drove most fixes in',
      youTopics: ['Capstone design', 'Product framing', 'UX research']
    },
    {
      label: 'Making the final call',
      position: 91,
      lo: 78,
      hi: 98,
      verdict: 'Clearly you',
      tone: 'you',
      trendLine: 'Stayed consistent over time.',
      aiLine: '',
      aiTopics: [],
      youLine: 'You made the final call in',
      youTopics: ['Capstone design', 'Product framing', 'Prototyping', 'Interview synthesis']
    }
  ],

  strengths: [
    {
      title: 'Your judgment is getting sharper',
      note: 'Your redirects are more precise - fewer follow-ups, but each one changes the direction more. Keep pushing back on first drafts, even when they look fine.'
    },
    {
      title: 'You still own the final call',
      note: 'Across almost every session, the final judgment - what to keep, cut, or change direction on - stayed with you. Keep making that decision deliberately.'
    },
    {
      title: 'You sharpen by reacting',
      note: 'Our strongest sessions start once you have something concrete to push back on. That instinct to reshape rather than accept is doing real work.'
    }
  ],

  watchItems: [
    {
      title: "You're delegating more of the starting point",
      body: 'In January you wrote your own outlines and first drafts. Now you ask me to write them. The final quality is similar, but the raw material is increasingly mine. Over time, this can make it harder to generate ideas without AI.',
      actionIcon: 'rework',
      actionTitle: 'Write one first draft yourself this week',
      actionCopy: "Pick a task you'd hand me. Write it rough first. Then ask me to critique, not create."
    },
    {
      title: 'My writing patterns are showing up in yours',
      body: 'Three phrases in your recent work - longer constructions, more hedging - never appeared in your January writing. Those are my patterns, not yours. Your natural voice is more direct.',
      actionIcon: 'reclaim',
      actionTitle: 'Read your output aloud before submitting',
      actionCopy: "If a sentence doesn't sound like something you'd say in conversation, rewrite it."
    },
    {
      title: 'Your prompts got shorter',
      body: 'Your opening messages went from paragraph-length context to short directives. This can mean you know what you want - but it also means I get less of your reasoning, which changes what I produce.',
      actionIcon: 'reframe',
      actionTitle: 'Add your reasoning to your next prompt',
      actionCopy: "Before the task, write one sentence about why you're doing it or what you've already decided."
    }
  ],

  reflection: {
    seed: 'What part of this still feels most like yours?'
  },

  tabs: {
    overview: {
      title: 'The story so far',
      subtitle: 'How the stretch between you and your AI has unfolded.'
    },
    who: {
      title: 'Who did what',
      subtitle: 'The topics you brought and how the work split between us.'
    },
    watch: {
      title: 'What to watch for',
      subtitle: "What's working, what to keep an eye on, and what to try next."
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderOverview();
  renderArc();
  renderTapestry();
  renderTopics();
  renderSliders();
  renderStrengths();
  renderWatchItems();
  renderReflection();
  bindTabs();
});

function renderChrome() {
  document.getElementById('periodLabel').textContent = D.periodLabel;
  document.getElementById('periodMeta').textContent = D.periodMeta;
  applyTabCopy('overview');
}

function bindTabs() {
  const buttons = Array.from(document.querySelectorAll('.tab-button'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      buttons.forEach((item) => item.classList.toggle('active', item === button));
      panels.forEach((item) => item.classList.toggle('active', item.dataset.panel === tab));
      applyTabCopy(tab);
    });
  });
}

function applyTabCopy(key) {
  const tab = D.tabs[key] || D.tabs.overview;
  document.getElementById('pageKicker').textContent = `Dashboard - ${tab.title}`;
  document.getElementById('pageTitle').textContent = tab.title;
  document.getElementById('pageSubtitle').textContent = tab.subtitle;
}

function renderOverview() {
  document.getElementById('overviewTitle').textContent = D.overview.title;
  document.getElementById('overviewLetter').innerHTML = D.overview.letter.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');
  document.getElementById('overviewSignoff').textContent = D.overview.signoff;
}

function renderArc() {
  document.getElementById('arcStory').innerHTML = D.arc.map((item) => (
    `<div class="arc-chapter${item.current ? ' current' : ''}"><div class="arc-month">${esc(item.month)}</div><div class="arc-chapter-text">${esc(item.text)}</div></div>`
  )).join('');
}

function renderTapestry() {
  document.getElementById('tapestryGrid').innerHTML = D.tapestry.map((kind) => `<div class="tap-cell ${kind}"></div>`).join('');
}

function renderTopics() {
  document.getElementById('topicsViz').innerHTML = D.topics.map((topic) => {
    const style = bubbleStyle(topic);
    return `<div class="topic-bubble ${topic.size}" style="left:${topic.x}%;top:${topic.y}%;${style}"><div class="topic-bubble-label">${esc(topic.label)}</div><div class="topic-bubble-count">${topic.count} chats</div></div>`;
  }).join('');
}

function renderSliders() {
  document.getElementById('sliderRows').innerHTML = D.aspects.map((aspect) => {
    const topicPill = (name, type) => `<span class="slider-topic-pill ${type}-pill">${esc(name)}</span>`;
    const joinTopics = (items, type) => items.map((item) => topicPill(item, type)).join(' and ');
    const lines = [`<div class="slider-exp-line trend">${esc(aspect.trendLine)}</div>`];

    if (aspect.aiLine && aspect.aiTopics.length) {
      lines.push(`<div class="slider-exp-line">${esc(aspect.aiLine)} ${joinTopics(aspect.aiTopics, 'ai')}.</div>`);
    }

    if (aspect.youLine && aspect.youTopics.length) {
      lines.push(`<div class="slider-exp-line">${esc(aspect.youLine)} ${joinTopics(aspect.youTopics, 'you')}.</div>`);
    }

    return `
      <button class="slider-row" type="button" aria-expanded="false">
        <div class="slider-row-top">
          <div class="slider-label">${esc(aspect.label)}</div>
          <div class="slider-row-right">
            <div class="slider-verdict ${aspect.tone}">${esc(aspect.verdict)}</div>
            <div class="slider-chevron">+</div>
          </div>
        </div>
        <div class="slider-scale-labels"><span>AI</span><span>You</span></div>
        <div class="slider-track has-range">
          <div class="slider-track-left"></div>
          <div class="slider-track-right"></div>
          <div class="slider-range-fill" style="left:${aspect.lo}%;width:${aspect.hi - aspect.lo}%"></div>
          <div class="slider-tick" style="left:${aspect.lo}%"></div>
          <div class="slider-tick" style="left:${aspect.hi}%"></div>
          <div class="slider-dot" style="left:${aspect.position}%"></div>
        </div>
        <div class="slider-expanded">
          ${lines.join('')}
        </div>
      </button>
    `;
  }).join('');

  document.querySelectorAll('.slider-row').forEach((row) => {
    row.addEventListener('click', () => {
      const wasOpen = row.classList.contains('open');
      document.querySelectorAll('.slider-row').forEach((item) => {
        item.classList.remove('open');
        item.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        row.classList.add('open');
        row.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function renderStrengths() {
  document.getElementById('strengthsRow').innerHTML = D.strengths.map((item) => `
    <div class="strength-card">
      <div class="strength-icon">✓</div>
      <div>
        <div class="strength-title">${esc(item.title)}</div>
        <div class="strength-note">${esc(item.note)}</div>
      </div>
    </div>
  `).join('');
}

function renderWatchItems() {
  document.getElementById('watchList').innerHTML = D.watchItems.map((item, index) => `
    <article class="watch-card">
      <div class="watch-card-summary">
        <div class="watch-card-summary-top">
          <div class="watch-card-title">${esc(item.title)}</div>
          <div class="watch-card-chevron">+</div>
        </div>
        <div class="watch-card-action-inline">
          <div class="watch-action-icon ${item.actionIcon}">${index + 1}</div>
          <div class="watch-action-content">
            <div class="watch-action-title">${esc(item.actionTitle)}</div>
            <div class="watch-action-copy">${esc(item.actionCopy)}</div>
          </div>
        </div>
      </div>
      <div class="watch-card-detail">
        <div class="watch-card-detail-label">Why this matters</div>
        <div class="watch-card-body">${esc(item.body)}</div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.watch-card-summary').forEach((summary) => {
    summary.addEventListener('click', () => {
      const card = summary.closest('.watch-card');
      const wasOpen = card.classList.contains('open');
      document.querySelectorAll('.watch-card').forEach((item) => item.classList.remove('open'));
      if (!wasOpen) {
        card.classList.add('open');
      }
    });
  });
}

function renderReflection() {
  document.getElementById('seedQuestion').textContent = D.reflection.seed;
}

function bubbleStyle(topic) {
  const miroColor = { r: 74, g: 178, b: 212 };
  const youColor = { r: 201, g: 122, b: 92 };
  const sharedColor = { r: 201, g: 161, b: 100 };
  const delta = Math.abs((topic.youShare || 0) - (topic.miroShare || 0));
  const color = delta <= 14 ? sharedColor : (topic.youShare >= topic.miroShare ? youColor : miroColor);
  return `--topic-fill:radial-gradient(circle at 28% 24%,rgba(255,255,255,0.5) 0%,rgba(255,255,255,0.16) 24%,rgba(255,255,255,0) 42%),linear-gradient(165deg,${rgba(color, 0.98)} 0%,${rgba(color, 0.92)} 100%);--topic-shadow:0 18px 36px ${rgba(color, 0.2)},0 8px 24px rgba(51,43,36,0.12)`;
}

function rgba(color, alpha) {
  return `rgba(${color.r},${color.g},${color.b},${alpha.toFixed(2)})`;
}

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, (match) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}
