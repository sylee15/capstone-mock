const dashboardData = {
  chats: 52,
  months: 4,
  periodLabel: 'December to April',
  periodMeta: '52 chats in this prototype monthset',
  overview: {
    title: 'Creating Together',
    description:
      "We've been in a build-and-critique rhythm. I draft, you reshape, I rebuild. Most of your strongest ideas seem to arrive when you're pushing back on something I made first.",
    note: 'I still carried a lot of the first pass, but your share has been growing and the directional calls have stayed clearly yours.'
  },
  taskBreakdown: [
    { label: 'Writing and editing', note: 'I carried more of the first-pass drafting here.', you: 32, miro: 68 },
    { label: 'Analysis', note: 'You were usually the one deciding what the signal actually meant.', you: 68, miro: 32 },
    { label: 'Research', note: 'This tended to feel more shared, with you steering what mattered.', you: 56, miro: 44 },
    { label: 'Problem solving', note: 'You kept most of the judgment even when I helped narrow options.', you: 58, miro: 42 },
    { label: 'Creative work', note: 'I generated fast options, but you curated the ones that felt alive.', you: 42, miro: 58 }
  ],
  topics: [
    {
      id: 'capstone-design',
      label: 'Capstone design',
      count: 18,
      size: 'xxl',
      x: 23,
      y: 34,
      youShare: 62,
      miroShare: 38,
      cluster: 'build',
      links: ['product-framing', 'prototyping', 'ux-research']
    },
    {
      id: 'product-framing',
      label: 'Product framing',
      count: 14,
      size: 'xl',
      x: 42,
      y: 20,
      youShare: 54,
      miroShare: 46,
      cluster: 'build',
      links: ['capstone-design', 'interview-synthesis', 'coding']
    },
    {
      id: 'interview-synthesis',
      label: 'Interview synthesis',
      count: 9,
      size: 'lg',
      x: 66,
      y: 26,
      youShare: 43,
      miroShare: 57,
      cluster: 'research',
      links: ['product-framing', 'ux-research', 'metacognition']
    },
    {
      id: 'prototyping',
      label: 'Prototyping',
      count: 7,
      size: 'lg',
      x: 35,
      y: 60,
      youShare: 58,
      miroShare: 42,
      cluster: 'build',
      links: ['capstone-design', 'ux-research', 'personal']
    },
    {
      id: 'ux-research',
      label: 'UX research',
      count: 5,
      size: 'md',
      x: 56,
      y: 56,
      youShare: 52,
      miroShare: 48,
      cluster: 'research',
      links: ['capstone-design', 'prototyping', 'interview-synthesis', 'career-planning']
    },
    {
      id: 'metacognition',
      label: 'Metacognition',
      count: 4,
      size: 'sm',
      x: 81,
      y: 52,
      youShare: 49,
      miroShare: 51,
      cluster: 'reflection',
      links: ['interview-synthesis', 'ai-in-education']
    },
    {
      id: 'ai-in-education',
      label: 'AI in education',
      count: 4,
      size: 'sm',
      x: 74,
      y: 71,
      youShare: 37,
      miroShare: 63,
      cluster: 'reflection',
      links: ['metacognition']
    },
    {
      id: 'coding',
      label: 'Coding',
      count: 3,
      size: 'sm',
      x: 60,
      y: 10,
      youShare: 10,
      miroShare: 90,
      cluster: 'build',
      links: ['product-framing']
    },
    {
      id: 'career-planning',
      label: 'Career planning',
      count: 2,
      size: 'xs',
      x: 18,
      y: 76,
      youShare: 65,
      miroShare: 35,
      cluster: 'life',
      links: ['ux-research', 'personal']
    },
    {
      id: 'personal',
      label: 'Personal',
      count: 2,
      size: 'xs',
      x: 33,
      y: 82,
      youShare: 71,
      miroShare: 29,
      cluster: 'life',
      links: ['prototyping', 'career-planning']
    }
  ],
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
  profile: {
    paragraph:
      "You seem to think best when there is something visible enough to push against. A first pass gives you a surface for judgment, and that is often when your clearest direction starts to show."
  },
  portrait: {
    title: 'a draft, a pushback, then a clearer shape',
    text:
      "Our rhythm often starts with me making something slightly too early or too loosely, and then you stepping in to redirect it. The useful part is usually not the draft itself, but what your reaction reveals about what you actually want.",
    fragments: [
      'You often become most decisive after there is something to critique.',
      'I tend to be most useful at the blurry beginning, not the final call.',
      'A lot of our stronger sessions move from reaction into clearer authorship.'
    ]
  },
  reflection: {
    seed: 'When I helped most in this stretch, was I extending your thinking or replacing the part you most wanted to own?',
    nextTitle: 'Take back one piece',
    nextStep: 'The next time I give you a strong first draft, pause before keeping it. Rewrite one paragraph or one decision in your own words so the shape of it comes back through you.'
  },
  tabs: {
    overview: { title: 'Overview', subtitle: 'The recent rhythm between you and me, gathered into one place.' },
    made: { title: 'What we made', subtitle: 'A larger map of the themes that have been holding the most space.' },
    task: { title: 'By task', subtitle: 'A clearer read of where the work leaned more toward me or toward you.' },
    style: { title: 'How you work with me', subtitle: 'A softer profile and a read of our recurring rhythm.' }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderOverview();
  renderTaskBreakdown();
  renderTopics();
  renderArc();
  renderTapestry();
  renderPortrait();
  renderProfile();
  renderReflection();
  bindTabs();
});

function renderChrome() {
  document.getElementById('chipChats').textContent = dashboardData.chats;
  document.getElementById('chipMonths').textContent = dashboardData.months;
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
  document.getElementById('pageTitle').textContent = tab.title;
  document.getElementById('pageSubtitle').textContent = tab.subtitle;
}

function renderOverview() {
  document.getElementById('overviewTitle').textContent = dashboardData.overview.title;
  document.getElementById('overviewDesc').textContent = dashboardData.overview.description;
  document.getElementById('overviewNote').textContent = dashboardData.overview.note;
}

function renderTaskBreakdown() {
  const host = document.getElementById('taskList');
  host.innerHTML = dashboardData.taskBreakdown.map((item) => `
    <div class="task-row">
      <div class="task-row-top">
        <div>
          <div class="task-label">${escapeHtml(item.label)}</div>
          <div class="task-note">${escapeHtml(item.note)}</div>
        </div>
      </div>
      <div class="task-bar">
        <div class="task-bar-miro" style="width:${item.miro}%"></div>
        <div class="task-bar-you" style="width:${item.you}%"></div>
      </div>
      <div class="task-scale">
        <span>More Miro</span>
        <span>More you</span>
      </div>
    </div>
  `).join('');
}

function renderTopics() {
  const host = document.getElementById('topicsViz');
  const topicMap = new Map(dashboardData.topics.map((topic) => [topic.id, topic]));
  const lineMarkup = [];
  const lineSeen = new Set();

  dashboardData.topics.forEach((topic) => {
    (topic.links || []).forEach((targetId) => {
      const target = topicMap.get(targetId);
      if (!target) return;
      const pairKey = [topic.id, targetId].sort().join(':');
      if (lineSeen.has(pairKey)) return;
      lineSeen.add(pairKey);
      lineMarkup.push(`
        <line
          class="topic-link"
          x1="${topic.x}%"
          y1="${topic.y}%"
          x2="${target.x}%"
          y2="${target.y}%"
        ></line>
      `);
    });
  });

  host.innerHTML = `
    <svg class="topic-link-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${lineMarkup.join('')}
    </svg>
    ${dashboardData.topics.map((topic) => {
      const bubbleStyle = buildTopicBubbleStyle(topic);
      const textClass = bubbleStyle.textClass;
      return `
        <div
          class="topic-bubble ${topic.size} ${textClass}"
          style="left:${topic.x}%; top:${topic.y}%; ${bubbleStyle.style}"
        >
          <div class="topic-bubble-label">${escapeHtml(topic.label)}</div>
          <div class="topic-bubble-count">${topic.count} chats</div>
        </div>
      `;
    }).join('')}
  `;
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

function renderPortrait() {
  document.getElementById('portraitTitle').textContent = dashboardData.portrait.title;
  document.getElementById('portraitText').textContent = dashboardData.portrait.text;
  document.getElementById('rhythmList').innerHTML = dashboardData.portrait.fragments
    .map((item) => `<div class="rhythm-item">${escapeHtml(item)}</div>`)
    .join('');
}

function renderProfile() {
  document.getElementById('profileParagraph').textContent = dashboardData.profile.paragraph;
}

function renderReflection() {
  document.getElementById('seedQuestion').textContent = dashboardData.reflection.seed;
  document.getElementById('nextStepTitle').textContent = dashboardData.reflection.nextTitle;
  document.getElementById('nextStepCopy').textContent = dashboardData.reflection.nextStep;
}

function buildTopicBubbleStyle(topic) {
  const youColor = { r: 191, g: 115, b: 84 };
  const miroColor = { r: 74, g: 178, b: 212 };
  const youWeight = topic.youShare / 100;
  const miroWeight = topic.miroShare / 100;
  const dominant = youWeight >= miroWeight ? 'you' : 'miro';
  const dominantWeight = Math.max(youWeight, miroWeight);
  const secondaryWeight = Math.min(youWeight, miroWeight);
  const baseRgb = mixRgb(youColor, miroColor, miroWeight);
  const softenedBase = mixRgb(baseRgb, { r: 255, g: 250, b: 244 }, 0.12);
  const dominantRgb = dominant === 'you' ? youColor : miroColor;
  const secondaryRgb = dominant === 'you' ? miroColor : youColor;
  const textClass = dominantWeight > 0.64 ? 'light-text' : 'dark-text';
  const sheenOpacity = 0.24 + (secondaryWeight * 0.12);
  const accentOpacity = 0.2 + (secondaryWeight * 0.28);
  const shadowOpacity = 0.08 + (dominantWeight * 0.06);

  return {
    textClass,
    style: [
      `--topic-fill: radial-gradient(circle at 30% 24%, rgba(255, 255, 255, ${sheenOpacity.toFixed(2)}) 0%, rgba(255, 255, 255, 0) 34%), radial-gradient(circle at 78% 78%, ${toRgba(secondaryRgb, accentOpacity)} 0%, ${toRgba(secondaryRgb, 0)} 52%), linear-gradient(155deg, ${toRgba(softenedBase, 0.94)} 0%, ${toRgba(baseRgb, 0.98)} 66%, ${toRgba(dominantRgb, 0.9)} 100%)`,
      `--topic-shadow: 0 16px 34px rgba(51, 43, 36, ${shadowOpacity.toFixed(2)})`
    ].join('; ')
  };
}

function mixRgb(colorA, colorB, amount) {
  return {
    r: Math.round(colorA.r + ((colorB.r - colorA.r) * amount)),
    g: Math.round(colorA.g + ((colorB.g - colorA.g) * amount)),
    b: Math.round(colorA.b + ((colorB.b - colorA.b) * amount))
  };
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
