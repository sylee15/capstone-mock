const dashboardData = {
  chats: 52,
  months: 4,
  overview: {
    title: 'Creating Together',
    description:
      "We've been in a build-and-critique rhythm. I draft, you reshape, I rebuild. Most of your strongest ideas seem to arrive when you're pushing back on something I made first.",
    statOne: 'I carried more',
    statTwo: 'Growing share',
    statThree: '52 chats'
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
  aspects: [
    ['Coming up with ideas', 35, 65, 'mostly you'],
    ['Deciding direction', 22, 78, 'almost all you'],
    ['Doing the research', 79, 21, 'mostly me'],
    ['Building the thing', 84, 16, 'mostly me'],
    ['Catching problems', 18, 82, 'mostly you'],
    ['Making the final call', 8, 92, 'always you']
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
      who: 'You noticed',
      quote: "This was drifting toward a message you didn't actually want to send.",
      context: 'That correction pulled the project away from a generic anti-AI framing and back toward reflection.',
      meta: 'Apr 11 - Framing chat'
    },
    {
      type: 'you',
      who: 'You named',
      quote: 'The slime is the AI companion, not just a mascot around it.',
      context: 'Once that landed, the whole concept became simpler and more legible.',
      meta: 'Apr 12 - Concept chat'
    },
    {
      type: 'miro',
      who: 'I reflected back',
      quote: 'What you wanted was a way to make invisible thinking show up in the work.',
      context: "That line seemed to give the project a stronger center. It wasn't new from nowhere, just your thinking coming back with shape.",
      meta: 'Apr 13 - Pitch conversation',
      wide: true
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
    "A lot of your strongest turns happen when you stop asking for help and start naming what doesn't fit.",
    'The richest chats seem to land between 8 and 15 turns. Long enough to shift, short enough to stay sharp.'
  ],
  portrait: {
    title: '"A thinker who finds the shape of their answer by refusing the wrong ones first."',
    text:
      "You rarely arrive with a full plan. You arrive with a sense that something matters, then use me as a surface to test it against. That's not indecision. It's a way of thinking that needs something to push on. We seem to work best when I'm willing to be wrong out loud so you have something real to sharpen."
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderOverview();
  renderWeightChart();
  renderAspects();
  renderTopics();
  renderArc();
  renderMoments();
  renderTapestry();
  renderInsights();
  renderPortrait();
});

function renderHeader() {
  document.getElementById('chipChats').textContent = dashboardData.chats;
  document.getElementById('chipMonths').textContent = dashboardData.months;
}

function renderOverview() {
  const { title, description, statOne, statTwo, statThree } = dashboardData.overview;
  document.getElementById('overviewTitle').textContent = title;
  document.getElementById('overviewDesc').textContent = description;
  document.getElementById('overviewStatOne').textContent = statOne;
  document.getElementById('overviewStatTwo').textContent = statTwo;
  document.getElementById('overviewStatTwo').style.color = 'var(--you-dark)';
  document.getElementById('overviewStatThree').textContent = statThree;
  document.getElementById('overviewStatThree').style.color = 'var(--ink)';
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

function renderAspects() {
  const host = document.getElementById('aspectsList');
  host.innerHTML = dashboardData.aspects.map(([label, miro, you, lean]) => `
    <div class="aspect-row">
      <div class="aspect-label">${escapeHtml(label)}</div>
      <div class="aspect-bar">
        <div class="aspect-bar-miro" style="width:${miro}%"></div>
        <div class="aspect-bar-you" style="width:${you}%"></div>
      </div>
      <div class="aspect-lean ${you > miro ? 'you-lean' : 'miro-lean'}">${escapeHtml(lean)}</div>
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
    <div class="moment-card ${moment.type}-moment${moment.wide ? ' wide' : ''}">
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

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (match) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}
