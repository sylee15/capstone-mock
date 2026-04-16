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
  weightSummary:
    "Lately your bars have been growing taller. You've been bringing more of your own structure into each chat, even when I still carry the first pass.",
  weightData: [
    [70, 30], [65, 35], [55, 45], [76, 24], [62, 38], [78, 22],
    [56, 44], [48, 52], [67, 33], [58, 42], [63, 37], [52, 48],
    [60, 40], [42, 58], [57, 43], [45, 55], [50, 50], [68, 32],
    [54, 46], [59, 41], [39, 61], [52, 48], [44, 56], [58, 42],
    [40, 60], [54, 46], [36, 64], [46, 54], [42, 58], [49, 51]
  ],
  taskBreakdown: [
    {
      label: 'Writing and editing',
      note: 'I carried more of the first-pass drafting here.',
      you: 32,
      miro: 68,
      count: 16
    },
    {
      label: 'Analysis',
      note: 'You were usually the one deciding what the signal actually meant.',
      you: 68,
      miro: 32,
      count: 14
    },
    {
      label: 'Research',
      note: 'This tended to feel more shared, with you steering what mattered.',
      you: 56,
      miro: 44,
      count: 10
    },
    {
      label: 'Problem solving',
      note: 'You kept most of the judgment even when I helped narrow options.',
      you: 58,
      miro: 42,
      count: 8
    },
    {
      label: 'Creative work',
      note: 'I generated fast options, but you curated the ones that felt alive.',
      you: 42,
      miro: 58,
      count: 6
    }
  ],
  topics: [
    ['Capstone design', 18, 'large'],
    ['Product framing', 14, 'large'],
    ['Interview synthesis', 9, 'med'],
    ['Prototyping', 7, 'med'],
    ['UX research', 5, 'base'],
    ['Metacognition', 4, 'base'],
    ['AI in education', 4, 'base'],
    ['Coding', 3, 'sm'],
    ['Career planning', 2, 'sm'],
    ['Personal', 2, 'sm']
  ],
  arc: [
    {
      month: 'January',
      text:
        "You asked open questions and let me lead. There were lots of 'help me figure this out' chats where I did most of the shaping."
    },
    {
      month: 'February',
      text:
        "You started pushing back sooner. The rhythm changed when your replies stopped being reactions and started becoming redirections."
    },
    {
      month: 'March',
      text:
        "Your critiques got sharper. You were naming why something felt off, which meant I had more to build against."
    },
    {
      month: 'April - now',
      text:
        "You bring more of your own frame now. I still help build, but it increasingly feels like I'm building toward a vision you already sense.",
      current: true
    }
  ],
  moments: [
    {
      type: 'you',
      who: 'You',
      quote: "This was drifting toward a message you didn't actually want to send.",
      context: 'That correction pulled the project away from a generic anti-AI framing and back toward reflection.',
      meta: 'Apr 11 - Framing chat'
    },
    {
      type: 'you',
      who: 'You',
      quote: 'The slime is the AI companion, not just a mascot around it.',
      context: 'Once that landed, the whole concept became simpler and more legible.',
      meta: 'Apr 12 - Concept chat'
    },
    {
      type: 'miro',
      who: 'Miro',
      quote: 'What you wanted was a way to make invisible thinking show up in the work.',
      context: "That line seemed to give the project a stronger center. It wasn't new from nowhere, just your thinking coming back with shape.",
      meta: 'Apr 13 - Pitch conversation'
    }
  ],
  tapestry: [
    'miro-heavy', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean', 'balanced', 'you-lean', 'you-heavy',
    'miro-heavy', 'balanced', 'miro-heavy', 'you-lean', 'you-heavy', 'balanced', 'miro-lean', 'miro-heavy', 'you-lean', 'balanced',
    'miro-heavy', 'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'miro-heavy', 'balanced', 'you-lean', 'miro-heavy', 'miro-lean',
    'balanced', 'you-lean', 'you-heavy', 'miro-heavy', 'balanced', 'miro-lean', 'you-heavy', 'balanced', 'you-lean', 'miro-heavy',
    'miro-lean', 'balanced', 'you-heavy', 'you-lean', 'balanced', 'miro-heavy', 'miro-heavy', 'you-lean', 'balanced', 'you-heavy',
    'miro-lean', 'balanced'
  ],
  insights: [
    "Your chats get more generative once you've rejected the first obvious path.",
    "When you start with a feeling instead of a plan, the conversation usually ends up somewhere more interesting.",
    "A lot of your strongest turns happen when you stop asking for help and start naming what doesn't fit."
  ],
  portrait: {
    title: '"A thinker who finds the shape of their answer by refusing the wrong ones first."',
    text:
      "You rarely arrive with a full plan. You arrive with a sense that something matters, then use me as a surface to test it against. That's not indecision. It's a way of thinking that needs something to push on. We seem to work best when I'm willing to be wrong out loud so you have something real to sharpen."
  },
  brought: {
    you: [
      'the directional judgment for what was actually worth keeping',
      'the sharper critiques that made the work more specific',
      'the instinct for tone, audience, and what still felt true',
      'the final say when a draft was close, but not quite right'
    ],
    miro: [
      'first-pass structure you could push against',
      'faster iteration when the shape was still blurry',
      'language for patterns that were already there in your thinking',
      'momentum when you needed something concrete to react to'
    ]
  },
  reflection: {
    seed: 'When I helped most in this stretch, was I extending your thinking or replacing the part you most wanted to own?',
    nextTitle: 'Take back one piece',
    nextStep:
      'The next time I give you a strong first draft, pause before keeping it. Rewrite one paragraph or one decision in your own words so the shape of it comes back through you.'
  },
  tabs: {
    overview: {
      title: 'Overview',
      subtitle: 'The recent rhythm between you and me, gathered into one place.'
    },
    made: {
      title: 'What we made',
      subtitle: 'The topics and moments that seemed to hold the most weight.'
    },
    task: {
      title: 'By task',
      subtitle: 'A cleaner look at which kinds of work leaned more toward you or me.'
    },
    style: {
      title: 'How you work with me',
      subtitle: 'More tendency than verdict. A description of the collaboration as it has felt.'
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderOverview();
  renderWeightChart();
  renderTaskBreakdown();
  renderTopics();
  renderArc();
  renderMoments();
  renderTapestry();
  renderInsights();
  renderPortrait();
  renderBrought();
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

function renderWeightChart() {
  const weightBars = document.getElementById('weightBars');
  dashboardData.weightData.forEach(([miro, you]) => {
    const col = document.createElement('div');
    col.className = 'weight-bar-col';

    const miroBar = document.createElement('div');
    miroBar.className = 'weight-bar-miro';
    miroBar.style.height = `${miro}%`;

    const youBar = document.createElement('div');
    youBar.className = 'weight-bar-you';
    youBar.style.height = `${you}%`;

    col.appendChild(miroBar);
    col.appendChild(youBar);
    weightBars.appendChild(col);
  });

  document.getElementById('weightSummary').textContent = dashboardData.weightSummary;
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
      <div class="task-bar-meta">
        <span>You ${item.you}%</span>
        <span>Miro ${item.miro}%</span>
      </div>
      <div class="task-bar">
        <div class="task-bar-you" style="width:${item.you}%"></div>
        <div class="task-bar-miro" style="width:${item.miro}%"></div>
      </div>
    </div>
  `).join('');
}

function renderTopics() {
  const host = document.getElementById('topicsViz');
  host.innerHTML = dashboardData.topics.map(([topic, count, size]) => `
    <div class="topic-chip ${size === 'base' ? '' : size}">
      ${escapeHtml(topic)} <span class="topic-count">${count}</span>
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
    <div class="moment-card ${moment.type}-moment">
      <div class="mc-who ${moment.type}-who">${escapeHtml(moment.who)}</div>
      <div class="mc-quote">${escapeHtml(moment.quote)}</div>
      <div class="mc-context">${escapeHtml(moment.context)}</div>
      <div class="mc-meta">${escapeHtml(moment.meta)}</div>
    </div>
  `).join('');
}

function renderTapestry() {
  const host = document.getElementById('tapestryGrid');
  host.innerHTML = dashboardData.tapestry.map((kind) => `<div class="tap-cell ${kind}"></div>`).join('');
}

function renderInsights() {
  const host = document.getElementById('insightsList');
  host.innerHTML = dashboardData.insights.map((text, index) => `
    <div class="insight-row">
      <div class="insight-icon">${String.fromCharCode(97 + index)}</div>
      <div class="insight-text">${escapeHtml(text)}</div>
    </div>
  `).join('');
}

function renderPortrait() {
  document.getElementById('portraitTitle').textContent = dashboardData.portrait.title;
  document.getElementById('portraitText').textContent = dashboardData.portrait.text;
}

function renderBrought() {
  document.getElementById('youBroughtList').innerHTML = dashboardData.brought.you
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  document.getElementById('miroBroughtList').innerHTML = dashboardData.brought.miro
    .map((item) => `<li>${escapeHtml(item)}</li>`)
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
