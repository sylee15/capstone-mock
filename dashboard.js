const slimeSrc = "sprites/cute.png";

const D = {
  areas: [
    { id:'research', label:'Research', pct:26, sessions:31, size:'xxl', x:35, y:28, color:'#d7cfbe',
      includes:'Finding sources, summarizing readings, comparing frameworks, and pulling together background material.',
      patterns:'You often let AI do the first sweep of the landscape, then decide what is actually worth following.',
      helps:'This area gives you speed when the material is dense and the starting point is still unclear.',
      risk:'If AI becomes the main reader, it can start shaping what counts as important before you do.',
      try:'After the first summary, name one idea, quote, or tension you want to trace yourself before moving on.' },
    { id:'writing', label:'Writing', pct:23, sessions:27, size:'xl', x:60, y:24, color:'#e7c4ab',
      includes:'Drafting discussion posts, outlining ideas, rewriting sections, and getting something on the page.',
      patterns:'You use AI here to create momentum. The draft is rarely the end point - it is the thing you push against.',
      helps:'This area helps you get past the blank page and into a more concrete editing mode faster.',
      risk:'It gets easier to inherit AI phrasing before you have fully decided what you want to sound like.',
      try:'Before asking for a draft, write one sentence that says what you already know you want the piece to do.' },
    { id:'coding', label:'Coding', pct:18, sessions:19, size:'lg', x:78, y:42, color:'#8ec7a1',
      includes:'Writing code, debugging, explaining errors, and building functional prototypes.',
      patterns:'You increasingly hand AI the artifact itself - code, files, or errors - instead of only describing the problem.',
      helps:'This area gives you immediate feedback. You can test quickly, compare outputs, and iterate fast.',
      risk:'The more complete the handoff, the easier it is to stay in reaction mode instead of building from first principles.',
      try:'Before pasting the full file, write a two-line guess about what you think is broken and why.' },
    { id:'design', label:'Design', pct:14, sessions:16, size:'md', x:44, y:54, color:'#d7c079',
      includes:'Layouts, wireframes, UI prototyping, visual critique, and structuring user-facing work.',
      patterns:'Your strongest design moves happen right after you reject AI first version. The taste is yours; AI gives you something visible to refine.',
      helps:'This area helps you externalize a rough shape quickly so you can respond to something concrete.',
      risk:'AI can over-normalize the work visually, especially if you accept the first structure without pushing back.',
      try:'When you dislike a first pass, name the specific design principle it violated before asking for the next version.' },
    { id:'studying', label:'Studying', pct:9, sessions:14, size:'sm', x:22, y:64, color:'#a8c7dd',
      includes:'Exam prep, understanding lecture concepts, generating practice questions, and reviewing material.',
      patterns:'You use AI here to compress a lot of information fast, especially when time pressure is high.',
      helps:'This area can lower the friction of getting oriented and turn overwhelming material into something more approachable.',
      risk:'Fast understanding can feel like real understanding. The explanation may land before you know whether it stuck.',
      try:'After reading an explanation, close it and restate the concept in your own words before asking another question.' },
    { id:'career', label:'Career', pct:5, sessions:9, size:'xs', x:68, y:68, color:'#d8b9c3',
      includes:'Resume editing, cover letters, interview prep, networking messages, and professional decisions.',
      patterns:'You give AI more influence over tone here than in most other areas because the stakes feel high.',
      helps:'This area gives you speed and a second opinion when the language feels loaded or consequential.',
      risk:'Professional polish can drift into generic polish, especially when you optimize for sounding right over sounding like you.',
      try:'Before revising, highlight one sentence that sounds most like you and keep it as the tone anchor.' },
    { id:'presenting', label:'Presenting', pct:3, sessions:7, size:'xs', x:84, y:62, color:'#a9d7de',
      includes:'Slide decks, talk structure, speaker notes, and presentation prep.',
      patterns:'You often know the ideas already; what you want from AI is sequencing, framing, and narrative shape.',
      helps:'This area helps you move from a pile of points to a cleaner story faster.',
      risk:'If AI determines the flow too early, the presentation can sound coherent without really sounding like your argument.',
      try:'Before building slides, write the one-sentence takeaway you want the audience to leave with.' },
    { id:'personal', label:'Personal', pct:2, sessions:5, size:'xs', x:56, y:76, color:'#cbbcd9',
      includes:'Life advice, exploring ideas, decision-making, and casual conversations.',
      patterns:'This is the area where you talk to AI least like a tool and most like a sounding board.',
      helps:'This area creates space to think out loud without needing everything to resolve into an output.',
      risk:'Because it feels conversational, weak advice can slip by more easily than it would in academic work.',
      try:'When the question matters, ask yourself what you would still believe if AI had not answered at all.' }
  ],

  aspects: [
    { label:'Coming up with ideas', position:68, lo:52, hi:82, verdict:'Mostly you', tone:'you',
      trendLine:'Trending toward you since January.',
      detail:'You come up with most of the conceptual direction. AI contributes options but you decide which ones matter.' },
    { label:'Deciding the direction', position:84, lo:70, hi:94, verdict:'Clearly you', tone:'you',
      trendLine:'Consistent over time.',
      detail:'The strategic call - what to pursue, what to drop - stays with you across almost every session.' },
    { label:'Doing the research', position:50, lo:32, hi:66, verdict:'Shared', tone:'shared',
      trendLine:'Trending toward AI since February.',
      detail:'You set the direction. AI does the legwork. You filter what comes back.' },
    { label:'Building the thing', position:30, lo:16, hi:48, verdict:'Mostly AI', tone:'ai',
      trendLine:'Trending toward AI since January.',
      detail:'Execution is increasingly AI job. You give the spec, AI produces, you refine.' },
    { label:'Catching problems', position:76, lo:58, hi:88, verdict:'Mostly you', tone:'you',
      trendLine:'Trending toward you since March.',
      detail:'Your eye for what is off is getting sharper. You catch things AI misses, especially around tone and fit.' },
    { label:'Making the final call', position:91, lo:78, hi:98, verdict:'Clearly you', tone:'you',
      trendLine:'Consistent over time.',
      detail:'What to keep, what to cut, what to change - that decision is always yours.' }
  ],

  profile: {
    summary: 'You usually shape by reacting. AI gets something moving; you decide what survives.',
    dynamicPill:'You refine, AI scaffolds',
    you: {
      title:'The Redirector',
      body:'You think by reacting. Your best work starts after you see something concrete to push against. You rarely begin from zero - you begin from <strong>"not quite."</strong>',
      tags:['Thinks by critiquing','Hands off first drafts','Keeps the final say']
    },
    ai: {
      title:'The Eager Builder',
      body:'You have shaped AI into a fast production partner. It shows up with drafts, code, and structure - then waits for you to reshape it.',
      tags:['Drafts quickly','Scaffolds structure','Rarely pushes back']
    },
    together: {
      title:'Draft -> Redirect -> Rebuild',
      body:'The first version is rarely the final one. AI gets the material into the room; your judgment changes its shape.',
      tags:['Fast first passes','Strong second thoughts','Deliberate final choices']
    },
    helps:'This dynamic keeps you from stalling at the blank-page stage and lets you sharpen ideas by reacting to something concrete.',
    risk:'When AI always provides the starting material, your own voice or first instincts can arrive later than they should.',
    next:'Before asking for a first pass, write one sentence about what you already know you want so the collaboration starts from your intent, not just AI momentum.'
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  renderBubbles();
  renderSliders();
  renderProfile();
  bindNav();
});

function renderBubbles(){
  const stage=document.getElementById('bubbleStage');
  stage.innerHTML = '';
  D.areas.forEach(a=>{
    const el=document.createElement('div');
    el.className=`bubble ${a.size}`;
    el.style.cssText=`left:${a.x}%;top:${a.y}%;transform:translate(-50%,-50%);--bubble-fill:${a.color};--bubble-edge:rgba(52,44,37,0.10)`;
    el.innerHTML=`<div class="bubble-label">${esc(a.label)}</div><div class="bubble-pct">${a.pct}% of use</div>`;
    el.addEventListener('click',(e)=>openBubble(a,el,e));
    stage.appendChild(el);
  });
}

function openBubble(area,el,e){
  e.stopPropagation();
  const all=document.querySelectorAll('.bubble');
  const was=el.classList.contains('active');
  all.forEach(b=>b.classList.remove('active','dimmed'));

  if(was){
    closeBubble();
    return;
  }

  el.classList.add('active');
  all.forEach(b=>{if(b!==el)b.classList.add('dimmed')});

  document.getElementById('bpPlaceholder').style.display='none';
  const c=document.getElementById('bpContent');
  c.className='bp-content open';
  c.innerHTML=`
    <div class="bp-top">
      <div class="bp-title">${esc(area.label)}</div>
      <button class="bp-close" type="button" aria-label="Close area detail">×</button>
    </div>
    <div class="bp-pct">${area.pct}% of your AI activity · ${area.sessions} sessions</div>
    <div class="bp-section">
      <div class="bp-label">What this usually involves</div>
      <div class="bp-text">${esc(area.includes)}</div>
    </div>
    <div class="bp-section">
      <div class="bp-label">Patterns</div>
      <div class="bp-text">${esc(area.patterns)}</div>
    </div>
    <div class="bp-section">
      <div class="bp-label">Where this helps</div>
      <div class="bp-text">${esc(area.helps)}</div>
    </div>
    <div class="bp-section">
      <div class="bp-label">Where this can get in the way</div>
      <div class="bp-text">${esc(area.risk)}</div>
    </div>
    <div class="bp-section">
      <div class="bp-label">Try this next time</div>
      <div class="bp-text"><strong>${esc(area.try)}</strong></div>
    </div>
  `;
  c.querySelector('.bp-close')?.addEventListener('click', closeBubble);
}

function closeBubble(){
  document.querySelectorAll('.bubble').forEach(b=>b.classList.remove('active','dimmed'));
  document.getElementById('bpPlaceholder').style.display='flex';
  document.getElementById('bpContent').className='bp-content';
  document.getElementById('bpContent').innerHTML='';
}

function renderSliders(){
  const card=document.getElementById('slidersCard');
  card.innerHTML=D.aspects.map(a=>`
    <button class="slider-row" type="button">
      <div class="slider-row-top">
        <div class="slider-label">${esc(a.label)}</div>
        <div class="slider-row-right">
          <div class="slider-verdict ${a.tone}">${esc(a.verdict)}</div>
          <div class="slider-chevron">+</div>
        </div>
      </div>
      <div class="slider-scale-labels"><span class="ai-label">AI</span><span class="you-label">You</span></div>
      <div class="slider-track">
        <div class="slider-track-left"></div>
        <div class="slider-track-right"></div>
        <div class="slider-range-fill" style="left:${a.lo}%;width:${a.hi-a.lo}%"></div>
        <div class="slider-tick" style="left:${a.lo}%"></div>
        <div class="slider-tick" style="left:${a.hi}%"></div>
        <div class="slider-dot" style="left:${a.position}%"></div>
      </div>
      <div class="slider-expanded">
        <div class="slider-exp-line trend">${esc(a.trendLine)}</div>
        <div class="slider-exp-line">${esc(a.detail)}</div>
      </div>
    </button>
  `).join('');
  document.querySelectorAll('.slider-row').forEach(row=>{
    row.addEventListener('click',()=>{
      const was=row.classList.contains('open');
      document.querySelectorAll('.slider-row').forEach(r=>r.classList.remove('open'));
      if(!was)row.classList.add('open');
    });
  });
}

function renderProfile(){
  const g=document.getElementById('profileGrid');
  const p=D.profile;
  g.innerHTML=`
    <div class="profile-hero">
      <div class="profile-hero-top">
        <img class="profile-sprite" src="${slimeSrc}" alt="Miro slime"/>
        <div class="profile-hero-text">
          <div class="profile-kicker">How we tend to work together</div>
          <div class="profile-hero-title">Draft quickly, refine deliberately</div>
          <div class="profile-hero-body">${p.summary}</div>
          <div class="profile-pill">${p.dynamicPill}</div>
        </div>
      </div>
      <div class="profile-triptych">
        <div class="profile-mini">
          <div class="pc-label you-l">You tend to be</div>
          <div class="pc-title">${esc(p.you.title)}</div>
          <div class="pc-body">${p.you.body}</div>
          <div class="pc-tags">${p.you.tags.map(t=>`<span class="pc-tag">${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="profile-mini">
          <div class="pc-label ai-l">AI tends to become</div>
          <div class="pc-title">${esc(p.ai.title)}</div>
          <div class="pc-body">${p.ai.body}</div>
          <div class="pc-tags">${p.ai.tags.map(t=>`<span class="pc-tag">${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="profile-mini">
          <div class="pc-label rel-l">Together, the pattern is</div>
          <div class="pc-title">${esc(p.together.title)}</div>
          <div class="pc-body">${p.together.body}</div>
          <div class="pc-tags">${p.together.tags.map(t=>`<span class="pc-tag">${esc(t)}</span>`).join('')}</div>
        </div>
      </div>
      <div class="slime-stack">
        <div class="slime-note helps">
          <div class="slime-copy"><div class="db-label">Where this helps</div>${esc(p.helps)}</div>
        </div>
        <div class="slime-note risk">
          <div class="slime-copy"><div class="db-label">Where this can get in the way</div>${esc(p.risk)}</div>
        </div>
        <div class="slime-note next">
          <div class="slime-copy"><div class="db-label">Try this next time</div>${esc(p.next)}</div>
        </div>
      </div>
    </div>
  `;
}

function bindNav(){
  const links=document.querySelectorAll('.tb-nav a');
  const sections=document.querySelectorAll('.section');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));
      }
    });
  },{rootMargin:'-30% 0px -50% 0px'});
  sections.forEach(s=>observer.observe(s));
}

function esc(v){return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
