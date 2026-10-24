(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const EMAIL = 'raj62000date@gmail.com';
  const LINKEDIN = 'https://www.linkedin.com/in/priyanshu-raj2';

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  const toast = $('#toast'); let tT;
  function say(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(tT); tT = setTimeout(() => toast.classList.remove('show'), 2200); }

  /* ---------- theme ---------- */
  const themeBtn = $('#themeBtn');
  function setTheme(t){
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('pr-theme', t); } catch(e) {}
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    $('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0b1220' : '#f6f4ee');
  }
  const toggleTheme = () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  setTheme(root.getAttribute('data-theme') || 'dark');
  themeBtn.addEventListener('click', toggleTheme);

  /* ---------- mobile menu ---------- */
  const menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
  function closeMenu(){ navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); menuBtn.setAttribute('aria-label','Open menu'); }
  menuBtn.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', navLinks).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navLinks.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

  /* ---------- copy email ---------- */
  async function copyEmail(){
    try { await navigator.clipboard.writeText(EMAIL); say('Email copied: ' + EMAIL); }
    catch(e){ say(EMAIL); }
  }
  $('#copyEmail').addEventListener('click', copyEmail);

  /* ---------- scroll progress, timeline fill, active section ---------- */
  const bar = $('#progressBar'), tl = $('#timeline'), tlFill = $('#tlFill');
  let ticking = false;
  function onScroll(){
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    tlFill.style.height = (p * 100) + '%';
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();

  const sections = ['hero','about','services','experience','projects','skills','education','contact'].map(id => document.getElementById(id));
  const railLinks = $$('.rail a'), topLinks = $$('.nav-links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id, idx = sections.findIndex(s => s.id === id);
      railLinks.forEach((a, i) => { a.classList.toggle('active', i === idx); a.classList.toggle('done', i < idx); a.toggleAttribute('aria-current', i === idx); });
      topLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (reduce.matches || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- counters ---------- */
  const counters = $$('[data-count]');
  if (!reduce.matches) {
    const cio = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); cio.unobserve(el);
    }), { threshold: .6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- services tabs ---------- */
  const tabs = $$('.mode-switch [role="tab"]'), pill = $('.mode-pill');
  function selectTab(i, focus){
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    const twoCol = matchMedia('(max-width:720px)').matches;
    pill.style.transform = twoCol ? `translate(${(i % 2) * 100}%, ${Math.floor(i / 2) * 100}%)` : `translateX(${i * 100}%)`;
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      const n = tabs.length;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); selectTab((i + 1) % n, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); selectTab((i - 1 + n) % n, true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(0, true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(n - 1, true); }
    });
  });
  addEventListener('resize', () => selectTab(tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')));

  /* ---------- flip cards ---------- */
  $$('.flip-inner').forEach(b => {
    const base = b.getAttribute('aria-label').replace(/ — show details$/, '');
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      b.setAttribute('aria-label', base + (open ? ' — showing details, press to flip back' : ' — show details'));
    });
  });

  /* ---------- skill explorer ---------- */
  const CAT = { dev:['Dev','var(--c1)'], cms:['CMS','var(--c3)'], ai:['AI & Automation','var(--c4)'], tools:['Tools','var(--c2)'], mgmt:['Management','#38bdf8'] };
  const SKILLS = [
    ['JavaScript','dev'],['PHP','dev'],['Java','dev'],['HTML','dev'],['CSS','dev'],['Git','dev'],
    ['WordPress','cms'],['WooCommerce','cms'],['Shopify','cms'],['Wix','cms'],['Strapi','cms'],['Storyblok','cms'],
    ['Claude Code','ai'],['ChatGPT','ai'],['Prompt Engineering','ai'],['AI Tools','ai'],['Grokbot','ai'],
    ['SAP','tools'],['Google Workspace','tools'],['Microsoft Office','tools'],['Photoshop','tools'],['Premiere Pro','tools'],
    ['Jira','mgmt'],['Trello','mgmt'],['Cross-functional coordination','mgmt'],['Process optimization','mgmt'],['Problem-solving','mgmt'],
    ['Vendor coordination','mgmt'],['Budgeting','mgmt'],['Staffing','mgmt']
  ];
  const cloud = $('#skillCloud'), count = $('#skillCount'), search = $('#skillSearch');
  cloud.innerHTML = SKILLS.map(([n, c]) => `<li class="skill" data-c="${c}" style="--k:${CAT[c][1]}"><i aria-hidden="true"></i>${n}<small>${CAT[c][0]}</small></li>`).join('');
  let filter = 'all';
  function applySkills(){
    const q = search.value.trim().toLowerCase(); let shown = 0;
    $$('.skill', cloud).forEach((el, i) => {
      const ok = (filter === 'all' || el.dataset.c === filter) && (!q || el.textContent.toLowerCase().includes(q));
      el.classList.toggle('hide', !ok);
      if (ok) { shown++; el.classList.remove('enter'); void el.offsetWidth; el.style.animationDelay = (shown * 0.025) + 's'; el.classList.add('enter'); }
    });
    count.textContent = `Showing ${shown} of ${SKILLS.length} skills` + (filter !== 'all' ? ` · ${CAT[filter][0]}` : '');
  }
  $$('#skillFilters button').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.f;
    $$('#skillFilters button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    applySkills();
  }));
  search.addEventListener('input', applySkills);
  applySkills();

  /* ---------- mini terminal ---------- */
  const body = $('#termBody'), form = $('#termForm'), input = $('#termIn');
  const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const CMDS = {
    help: () => [
      '<span class="k">Available commands</span>',
      '  <span class="cmd">whoami</span>      who is Priyanshu?',
      '  <span class="cmd">experience</span>  roles, newest first',
      '  <span class="cmd">projects</span>    featured builds',
      '  <span class="cmd">skills</span>      the toolkit',
      '  <span class="cmd">education</span>   degrees & certifications',
      '  <span class="cmd">contact</span>     how to reach me',
      '  <span class="cmd">resume</span>      download the PDF',
      '  <span class="cmd">goto</span> &lt;section&gt;  e.g. goto projects',
      '  <span class="cmd">theme</span>       toggle dark / light',
      '  <span class="cmd">clear</span>       clear the screen'
    ],
    whoami: () => [
      '<span class="k">Priyanshu Raj</span> — Gorakhpur, India',
      'AI Automation | Project Management | Business Operations | Full-Stack Development',
      '<span class="m">Builds the tech and runs the operations behind it.</span>'
    ],
    experience: () => [
      '<span class="p">2026–now</span>  Founder & Operations Manager · WeFit Gym',
      '<span class="p">2025–26 </span>  Web Team Lead · Koda  <span class="k">(+40% load speed)</span>',
      '<span class="p">2024    </span>  Frontend Developer · KaroStartup',
      '<span class="p">2023    </span>  Web Developer · TGO',
      '<span class="p">2023    </span>  Digital Solutions Specialist · Branding Venture',
      '<span class="p">2022    </span>  Software Engineer · Capgemini',
      '<span class="p">2019–21 </span>  Freelancer · Fiverr',
      '<span class="m">→ type "goto experience" for details</span>'
    ],
    projects: () => [
      '✦ AI Multi-Model Content Summarizer  <span class="m">ChatGPT · Claude · Perplexity</span>',
      '✦ E-Commerce Platform with AI Recommendations  <span class="m">Stripe · Razorpay</span>',
      `✦ Diligent Global  <a href="https://diligentglobal.com" target="_blank" rel="noopener">diligentglobal.com</a>`,
      `✦ BBSampaark  <a href="https://bbsampaark.in" target="_blank" rel="noopener">bbsampaark.in</a>`
    ],
    skills: () => Object.keys(CAT).map(c => `<span class="k">${CAT[c][0].padEnd(16)}</span>${SKILLS.filter(s => s[1] === c).map(s => s[0]).join(', ')}`),
    education: () => [
      'B.Tech, Information Technology — KIET Group of Institution, Ghaziabad (2018–2022)',
      'ISC — Little Flower School, Gorakhpur (2017–2018)',
      'ICSE — Little Flower School, Gorakhpur (2015–2016)',
      '<span class="k">Certs:</span> Full stack generative and Agentic AI with python · Web Design for Everybody · The Complete Android N Development Course'
    ],
    contact: () => [
      `email     <a href="mailto:${EMAIL}">${EMAIL}</a>`,
      `linkedin  <a href="${LINKEDIN}" target="_blank" rel="noopener">linkedin.com/in/priyanshu-raj2</a>`
    ],
    resume: () => { const a = document.createElement('a'); a.href = 'resume.pdf'; a.download = 'Priyanshu-Raj-Resume.pdf'; document.body.appendChild(a); a.click(); a.remove(); return ['Downloading resume.pdf …']; },
    theme: () => { toggleTheme(); return ['Theme switched to ' + root.getAttribute('data-theme') + '.']; },
    sudo: () => ['<span class="m">Nice try 😄 — but you can hire me instead: type "contact".</span>'],
    hire: () => CMDS.contact(),
    ls: () => ['about  services  experience  projects  skills  education  contact  resume.pdf'],
  };
  function print(lines){ lines.forEach(l => { const d = document.createElement('div'); d.className = 'ln'; d.innerHTML = l; body.appendChild(d); }); body.scrollTop = body.scrollHeight; }
  function run(raw){
    const cmd = raw.trim(); if (!cmd) return;
    print([`<span class="cmd">$ ${esc(cmd)}</span>`]);
    const [name, ...args] = cmd.toLowerCase().split(/\s+/);
    if (name === 'clear') { body.innerHTML = ''; return; }
    if (name === 'goto' || name === 'cd') {
      const id = (args[0] || '').replace(/^#/, '');
      const el = document.getElementById(id);
      if (el && sections.includes(el)) { print(['Jumping to ' + esc(id) + ' …']); el.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' }); }
      else print(['<span class="m">Unknown section. Try: about, services, experience, projects, skills, education, contact</span>']);
      return;
    }
    const fn = CMDS[name];
    print(fn ? fn() : [`<span class="m">command not found: ${esc(name)} — type "help"</span>`]);
  }
  const hist = []; let hi = 0;
  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; if (v.trim()) { hist.push(v); hi = hist.length; } run(v); input.value = ''; });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi]; }
    if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
  });
  $$('.term-chips button').forEach(b => b.addEventListener('click', () => run(b.dataset.cmd)));
  // intro "typing"
  const intro = ['<span class="m">Welcome! This is an interactive résumé.</span>', 'Type <span class="cmd">help</span> or tap a command below.'];
  if (reduce.matches) print(intro); else intro.forEach((l, i) => setTimeout(() => print([l]), 500 + i * 450));

  /* ---------- command palette ---------- */
  const pal = $('#palette'), pIn = $('#paletteIn'), pList = $('#paletteList');
  const go = id => () => document.getElementById(id).scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
  const ACTIONS = [
    ['Go to About', 'section', go('about')], ['Go to What I can do for you', 'section', go('services')],
    ['Go to Experience', 'section', go('experience')], ['Go to Projects', 'section', go('projects')],
    ['Go to Skills', 'section', go('skills')], ['Go to Education & certifications', 'section', go('education')],
    ['Go to Contact', 'section', go('contact')],
    ['Download resume (PDF)', 'action', () => CMDS.resume()],
    ['Copy email address', 'action', copyEmail],
    ['Open LinkedIn profile', 'link', () => window.open(LINKEDIN, '_blank', 'noopener')],
    ['Visit diligentglobal.com', 'link', () => window.open('https://diligentglobal.com', '_blank', 'noopener')],
    ['Visit bbsampaark.in', 'link', () => window.open('https://bbsampaark.in', '_blank', 'noopener')],
    ['Toggle dark / light theme', 'action', toggleTheme],
    ['Use the terminal', 'action', () => { go('hero')(); setTimeout(() => input.focus({ preventScroll: true }), 400); }],
  ];
  let filtered = ACTIONS, sel = 0, lastFocus = null;
  function renderPal(){
    const q = pIn.value.trim().toLowerCase();
    filtered = ACTIONS.filter(a => a[0].toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, filtered.length - 1));
    pList.innerHTML = filtered.length ? filtered.map((a, i) => `<li role="option" id="opt${i}" aria-selected="${i === sel}" data-i="${i}">${a[0]}<small>${a[1]}</small></li>`).join('') : '<li aria-disabled="true">No matches</li>';
    pIn.setAttribute('aria-activedescendant', filtered.length ? 'opt' + sel : '');
    const cur = $('#opt' + sel); if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function openPal(){ lastFocus = document.activeElement; pal.hidden = false; pIn.value = ''; sel = 0; renderPal(); pIn.focus(); closeMenu(); }
  function closePal(){ pal.hidden = true; if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  function choose(i){ const a = filtered[i]; if (!a) return; closePal(); a[2](); }
  $('#paletteBtn').addEventListener('click', openPal);
  pIn.addEventListener('input', () => { sel = 0; renderPal(); });
  pIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, filtered.length); renderPal(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(1, filtered.length); renderPal(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); } // keep focus trapped in the dialog
  });
  pList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) choose(+li.dataset.i); });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
    else if (e.key === 'Escape' && !pal.hidden) closePal();
  });

  /* ---------- hero canvas: "systems" network that reacts to the pointer ---------- */
  const cv = $('#flow'), ctx = cv.getContext('2d');
  let W, H, nodes = [], raf = null, mouse = { x: -999, y: -999 };
  const colors = () => { const cs = getComputedStyle(root); return ['--c1','--c2','--c3','--c4'].map(v => cs.getPropertyValue(v).trim()); };
  let pal4 = colors();
  new MutationObserver(() => { pal4 = colors(); if (reduce.matches) draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  function size(){
    const dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect();
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, Math.max(24, W * H / 22000)));
    nodes = Array.from({ length: n }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 2 + 1.2, c: i % 4 }));
  }
  function draw(){
    ctx.clearRect(0, 0, W, H);
    const D = Math.min(150, W / 6);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < D) { ctx.strokeStyle = pal4[a.c]; ctx.globalAlpha = (1 - d / D) * .35; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 180) { ctx.strokeStyle = pal4[a.c]; ctx.globalAlpha = (1 - md / 180) * .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.globalAlpha = .9; ctx.fillStyle = pal4[a.c]; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function tick(){
    nodes.forEach(n => { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1; });
    draw(); raf = requestAnimationFrame(tick);
  }
  function start(){ cancelAnimationFrame(raf); raf = null; size(); if (reduce.matches) draw(); else tick(); }
  const hero = $('#hero');
  hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  // pause animation when hero is off-screen (saves battery)
  new IntersectionObserver(([en]) => { if (reduce.matches) return; if (en.isIntersecting) { if (!raf) tick(); } else { cancelAnimationFrame(raf); raf = null; } }).observe(hero);
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(start, 150); });
  reduce.addEventListener?.('change', start);
  start();
})();
