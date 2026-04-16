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
    { label: 'Writing and editing', note: 'I carried more of the first-pass drafting here.', you: 32, miro: 68, count: 16 },
    { label: 'Analysis', note: 'You were usually the one deciding what the signal actually meant.', you: 68, miro: 32, count: 14 },
    { label: 'Research', note: 'This tended to feel more shared, with you steering what mattered.', you: 56, miro: 44, count: 10 },
    { label: 'Problem solving', note: 'You kept most of the judgment even when I helped narrow options.', you: 58, miro: 42, count: 8 },
    { label: 'Creative work', note: 'I generated fast options, but you curated the ones that felt alive.', you: 42, miro: 58, count: 6 }
  ],
  taskTakeaways: [
    {
      title: 'Writing leaned more toward me',
      text: 'This was the place where I most often carried the first draft, especially when the shape needed to appear quickly.'
    },
    {
      title: 'Analysis stayed more clearly yours',
      text: 'Even when I helped organize the material, the interpretive judgment still seemed to sit with you.'
    },
    {
      title: 'Research felt more shared',
      text: 'I helped gather and synthesize quickly, but you were usually the one deciding what actually mattered.'
    }
  ],
  topics: [
    { label: 'Capstone design', count: 18, tone: 'you', size: 'xl', x: 12, y: 17 },
    { label: 'Product framing', count: 14, tone: 'miro', size: 'lg', x: 39, y: 10 },
    { label: 'Interview synthesis', count: 9, tone: 'neutral', size: 'md', x: 67, y: 24 },
    { label: 'Prototyping', count: 7, tone: 'you', size: 'md', x: 23, y: 56 },
    { label: 'UX research', count: 5, tone: 'miro', size: 'md', x: 51, y: 55 },
    { label: 'Metacognition', count: 4, tone: 'neutral', size: 'sm', x: 78, y: 59 },
    { label: 'AI in education', count: 4, tone: 'miro', size: 'sm', x: 7, y: 72 },
    { label: 'Coding', count: 3, tone: 'you', size: 'sm', x: 81, y: 8 },
    { label: 'Career planning', count: 2, tone: 'neutral', size: 'xs', x: 61, y: 80 },
    { label: 'Personal', count: 2, tone: 'you', size: 'xs', x: 35, y: 82 }
  ],
  arc: [
    { month: 'January', text: "You asked open questions and let me lead. There were lots of 'help me figure this out' chats where I did most of the shaping." },
    { month: 'February', text: "You started pushing back sooner. The rhythm changed when your replies stopped being reactions and started becoming redirections." },
    { month: 'March', text: "Your critiques got sharper. You were naming why something felt off, which meant I had more to build against." },
    { month: 'April - now', text: "You bring more of your own frame now. I still help build, but it increasingly feels like I'm building toward a vision you already sense.", current: true }
  ],
  moments: [
    { type: 'you', who: 'You', quote: "This was drifting toward a message you didn't actually want to send.", context: 'That correction pulled the project away from a generic anti-AI framing and back toward reflection.', meta: 'Apr 11 - Framing chat' },
    { type: 'you', who: 'You', quote: 'The slime is the AI companion, not just a mascot around it.', context: 'Once that landed, the whole concept became simpler and more legible.', meta: 'Apr 12 - Concept chat' },
    { type: 'miro', who: 'Miro', quote: 'What you wanted was a way to make invisible thinking show up in the work.', context: "That line seemed to give the project a stronger center. It wasn't new from nowhere, just your thinking coming back with shape.", meta: 'Apr 13 - Pitch conversation' }
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
      "You seem to think best when there is something visible enough to push against. A first pass gives you a surface for judgment, and that is often when your clearest direction starts to show.",
    you: [
      'when the conversation needs a stronger direction or sharper boundary',
      'when something sounds polished but still does not feel true',
      'when tone, audience, or intent need a final human read'
    ],
    miro: [
      'when the shape is still blurry and you want something concrete to react to',
      'when the first draft needs to appear quickly so the real critique can start',
      'when a pattern is already there in your thinking but needs language around it'
    ]
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
    made: { title: 'What we made', subtitle: 'The topics and moments that seemed to hold the most weight.' },
    task: { title: 'By task', subtitle: 'A cleaner look at which kinds of work leaned more toward you or me.' },
    style: { title: 'How you work with me', subtitle: 'More tendency than verdict. A description of the collaboration as it has felt.' }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderOverview();
  renderTaskBreakdown();
  renderTaskTakeaways();
  renderTopics();
  renderArc();
  renderMoments();
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
        <div class="task-count">${item.count}</div>
      </div>
      <div class="task-bar">
        <div class="task-bar-you" style="width:${item.you}%"></div>
        <div class="task-bar-miro" style="width:${item.miro}%"></div>
      </div>
    </div>
  `).join('');
}

function renderTaskTakeaways() {
  const host = document.getElementById('taskTakeaways');
  host.innerHTML = dashboardData.taskTakeaways.map((item) => `
    <div class="takeaway-card">
      <div class="takeaway-title">${escapeHtml(item.title)}</div>
      <div class="takeaway-text">${escapeHtml(item.text)}</div>
    </div>
  `).join('');
}

function renderTopics() {
  const host = document.getElementById('topicsViz');
  host.innerHTML = dashboardData.topics.map((topic) => `
    <div
      class="topic-bubble ${topic.size} ${topic.tone}"
      style="left:${topic.x}%; top:${topic.y}%;"
    >
      <div class="topic-bubble-label">${escapeHtml(topic.label)}</div>
      <div class="topic-bubble-count">${topic.count}</div>
    </div>
  `).join('');
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

function renderMoments() {
  const host = document.getElementById('momentsGrid');
  host.innerHTML = dashboardData.moments.map((moment) => `
    <article class="moment-card ${moment.type}-moment">
      <div class="moment-card-top">
        <div class="mc-who ${moment.type}-who">${escapeHtml(moment.who)}</div>
        <div class="mc-meta">${escapeHtml(moment.meta)}</div>
      </div>
      <div class="mc-quote">${escapeHtml(moment.quote)}</div>
      <div class="mc-context">${escapeHtml(moment.context)}</div>
    </article>
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
  document.getElementById('youBroughtList').innerHTML = dashboardData.profile.you
    .map((item) => `<div class="profile-chip warm">${escapeHtml(item)}</div>`)
    .join('');
  document.getElementById('miroBroughtList').innerHTML = dashboardData.profile.miro
    .map((item) => `<div class="profile-chip cool">${escapeHtml(item)}</div>`)
    .join('');
}

function renderReflection() {
  document.getElementById('seedQuestion').textContent = dashboardData.reflection.seed;
  document.getElementById('nextStepTitle').textContent = dashboardData.reflection.nextTitle;
  document.getElementById('nextStepCopy').textContent = dashboardData.reflection.nextStep;
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
