const dashboardData = {
  periodLabel: 'This past season',
  periodMeta: 'Patterns from your recent stretch of chats with me.',
  overview: {
    title: 'Your story with Miro',
    subtitle: 'The recent rhythm between you and me, gathered into one place.',
    letter: [
      "Hey. It's been a good week between us.",
      "We've been in a build-and-critique rhythm. I draft, you reshape, I rebuild. Most of your strongest ideas seem to arrive when you're pushing back on something I made first.",
      "The essay on climate policy? That conclusion was distinctly yours. I gave you frameworks, but you built something I wouldn't have written."
    ],
    signoff: 'Miro - April 14'
  },
  arc: [
    { month: 'January', text: "You asked open questions and let me lead. There were lots of 'help me figure this out' chats where I did most of the shaping." },
    { month: 'February', text: "You started pushing back sooner. The rhythm changed when your replies stopped being reactions and started becoming redirections." },
    { month: 'March', text: "Your critiques got sharper. You were naming why something felt off, which meant I had more to build against." },
    { month: 'April - now', text: "You bring more of your own frame now. I still help build, but it increasingly feels like I'm building toward a vision you already sense.", current: true }
  ],
  tapestry: [
    'miro-heavy', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'you-heavy',
    'miro-heavy', 'balanced', 'miro-heavy', 'you-lean', 'you-heavy', 'balanced', 'miro-lean', 'miro-heavy', 'you-lean', 'balanced',
    'miro-heavy', 'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'miro-heavy', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean',
    'balanced', 'you-lean', 'you-heavy', 'miro-heavy', 'balanced', 'miro-lean', 'you-heavy', 'balanced', 'you-lean', 'miro-heavy',
    'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'balanced', 'miro-heavy', 'miro-heavy', 'you-lean', 'balanced', 'you-heavy',
    'miro-lean', 'balanced'
  ],
  reflection: {
    seed: 'When I helped most in this stretch, was I extending your thinking or replacing the part you most wanted to own?',
    nextTitle: 'Take back one piece',
    nextStep: 'The next time I give you a strong first draft, pause before keeping it. Rewrite one paragraph or one decision in your own words so the shape of it comes back through you.'
  },
  taskBreakdown: [
    {
      label: 'Writing and editing',
      note: 'I carried more of the first-pass drafting here.',
      lean: 28,
      verdict: 'Leaned toward me'
    },
    {
      label: 'Analysis',
      note: 'You were usually the one deciding what the signal actually meant.',
      lean: 72,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Research',
      note: 'This tended to feel more shared, with you steering what mattered.',
      lean: 52,
      verdict: 'Shared'
    },
    {
      label: 'Problem solving',
      note: 'You kept most of the judgment even when I helped narrow options.',
      lean: 71,
      verdict: 'Leaned toward you'
    },
    {
      label: 'Creative work',
      note: 'I generated fast options, but you curated the ones that felt alive.',
      lean: 46,
      verdict: 'Moved back and forth'
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
  style: {
    title: 'How you work with me',
    subtitle: 'A softer profile and a read of our recurring rhythm.',
    rhythmTitle: 'A patient critic with a clear hand.',
    rhythmCopy:
      'Our rhythm often starts with me making something slightly too early or too loosely, and then you stepping in to redirect it. The useful part is usually not the draft itself, but what your reaction reveals about what you actually want.',
    quote:
      '<strong>You</strong> often become most decisive after there&apos;s something to critique.<br><span class="miro-line">I</span> tend to be most useful at the blurry beginning, not the final call.<br>A lot of our stronger sessions move from reaction into clearer authorship.',
    patterns: [
      {
        title: 'You sketch, I sharpen',
        label: 'Where you lead',
        tone: 'you',
        body: 'You usually arrive with a rough idea and ask me to tighten it, rather than asking me to start from scratch.'
      },
      {
        title: 'Critique-first reader',
        label: 'Where you lead',
        tone: 'you',
        body: "You're quick to push back on my first pass. The strongest work tends to come after that pushback."
      },
      {
        title: 'Selective borrower',
        label: 'Where we move together',
        tone: 'shared',
        body: 'When I generate options, you take pieces, a phrase here, a structure there, instead of using a draft whole.'
      },
      {
        title: 'Late-night leaner',
        label: 'Where I tend to step in',
        tone: 'miro',
        body: "When you're tired, you let me carry more of the structure. Worth noticing, not worth judging."
      }
    ]
  },
  tabs: {
    overview: { title: 'Your story with Miro', subtitle: 'The recent rhythm between you and me, gathered into one place.' },
    made: { title: 'What we made', subtitle: 'A larger map of the themes that have been holding the most space between us.' },
    task: { title: 'By task', subtitle: 'A clearer read of where the work leaned more toward me or toward you.' },
    style: { title: 'How you work with me', subtitle: 'A softer profile and a read of our recurring rhythm.' }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderOverview();
  renderArc();
  renderTapestry();
  renderReflection();
  renderTaskBreakdown();
  renderTopics();
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

function renderTaskBreakdown() {
  const host = document.getElementById('taskList');
  host.innerHTML = dashboardData.taskBreakdown
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

function renderReflection() {
  document.getElementById('seedQuestion').textContent = dashboardData.reflection.seed;
  document.getElementById('nextStepTitle').textContent = dashboardData.reflection.nextTitle;
  document.getElementById('nextStepCopy').textContent = dashboardData.reflection.nextStep;
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

function buildTopicBubbleStyle(topic) {
  const youColor = { r: 201, g: 122, b: 92 };
  const miroColor = { r: 74, g: 178, b: 212 };
  const dominantColor = topic.youShare >= topic.miroShare ? youColor : miroColor;
  const secondaryColor = topic.youShare >= topic.miroShare ? miroColor : youColor;
  const secondaryShare = Math.min(topic.youShare, topic.miroShare) / 100;
  const arcSize = 16 + (secondaryShare * 34);

  return {
    style: [
      `--topic-fill: radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0.14) 26%, rgba(255, 255, 255, 0) 42%), radial-gradient(circle at 102% 78%, ${toRgba(secondaryColor, 0.98)} 0%, ${toRgba(secondaryColor, 0.98)} ${arcSize.toFixed(1)}%, ${toRgba(secondaryColor, 0)} ${(arcSize + 4).toFixed(1)}%), linear-gradient(165deg, ${toRgba(dominantColor, 0.98)} 0%, ${toRgba(dominantColor, 0.98)} 100%)`,
      `--topic-shadow: 0 18px 36px ${toRgba(dominantColor, 0.22)}, 0 8px 24px rgba(51, 43, 36, 0.12)`
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

