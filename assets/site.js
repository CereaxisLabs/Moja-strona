(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'cereaxis.preferences.v2';
  const duration = 180 * 24 * 60 * 60 * 1000;
  const strings = {
    pl: {language:'Przełącz na język angielski',light:'Włącz jasny motyw',dark:'Włącz ciemny motyw',open:'Otwórz menu',close:'Zamknij menu',copied:'Adres e-mail skopiowany.',copyFailed:'Skopiuj adres: cereaxislabs@gmail.com',saved:'Ustawienia zostały zastosowane.',reset:'Przywrócono polski język i jasny motyw.'},
    en: {language:'Switch to Polish',light:'Switch to light mode',dark:'Switch to dark mode',open:'Open navigation',close:'Close navigation',copied:'Email address copied.',copyFailed:'Copy this address: cereaxislabs@gmail.com',saved:'Your preferences have been applied.',reset:'Polish and the light theme have been restored.'}
  };
  let lang = root.lang === 'en' ? 'en' : 'pl';
  let theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
  let remember = false;
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    remember = !!(stored && stored.consent === true && stored.expires > Date.now());
  } catch (_) {}
  const text = () => strings[lang];
  const languageButton = document.getElementById('language-toggle');
  const themeButton = document.getElementById('theme-toggle');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  const dialog = document.getElementById('site-settings');
  const settingsForm = document.getElementById('settings-form');
  const rememberBox = document.getElementById('remember-preferences');
  let settingsTrigger = null;
  let toastTimer;
  function savePreferences() {
    try {
      if (remember) localStorage.setItem(key, JSON.stringify({consent:true,lang,theme,expires:Date.now()+duration}));
      else localStorage.removeItem(key);
    } catch (_) {}
  }
  function updateLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/i.test(raw) || link.hasAttribute('download')) return;
      try {
        const url = new URL(raw, location.href);
        if (!url.pathname.endsWith('.html')) return;
        if (lang === 'en') url.searchParams.set('lang','en'); else url.searchParams.delete('lang');
        if (theme === 'dark') url.searchParams.set('theme','dark'); else url.searchParams.delete('theme');
        link.setAttribute('href',url.pathname.split('/').pop()+url.search+url.hash);
      } catch (_) {}
    });
    try {
      const current = new URL(location.href);
      if (lang === 'en') current.searchParams.set('lang','en'); else current.searchParams.delete('lang');
      if (theme === 'dark') current.searchParams.set('theme','dark'); else current.searchParams.delete('theme');
      history.replaceState(null,'',current.href);
    } catch (_) {}
  }
  function updateLabels() {
    languageButton.setAttribute('aria-label',text().language);
    languageButton.title = text().language;
    languageButton.querySelector('span').textContent = lang === 'pl' ? 'EN' : 'PL';
    languageButton.lang = lang;
    languageButton.querySelector('span').lang = lang === 'pl' ? 'en' : 'pl';
    const label = theme === 'dark' ? text().light : text().dark;
    themeButton.setAttribute('aria-label',label);
    themeButton.title = label;
    menuButton.setAttribute('aria-label',document.body.classList.contains('menu-open') ? text().close : text().open);
  }
  function applyPreferences(nextLang=lang,nextTheme=theme,persist=false) {
    lang = nextLang === 'en' ? 'en' : 'pl';
    theme = nextTheme === 'dark' ? 'dark' : 'light';
    root.lang = lang;
    root.dataset.theme = theme;
    document.querySelectorAll('[data-pl][data-en]').forEach(el => {
      if (el.tagName === 'META') el.content = el.dataset[lang];
      else if (el.tagName === 'TITLE') document.title = el.dataset[lang];
      else el.textContent = el.dataset[lang];
    });
    document.querySelectorAll('[data-aria-pl]').forEach(el => el.setAttribute('aria-label',el.dataset[lang === 'pl' ? 'ariaPl' : 'ariaEn']));
    document.querySelectorAll('[data-alt-pl]').forEach(el => el.alt = el.dataset[lang === 'pl' ? 'altPl' : 'altEn']);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0d1728' : '#ffffff';
    updateLabels();
    updateLinks();
    if (persist) savePreferences();
  }
  function announce(message) {
    const toast = document.getElementById('status-message');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'),3500);
  }
  languageButton.addEventListener('click',() => applyPreferences(lang === 'pl' ? 'en' : 'pl',theme,remember));
  themeButton.addEventListener('click',() => applyPreferences(lang,theme === 'dark' ? 'light' : 'dark',remember));
  function setMenu(open,restoreFocus=false) {
    document.body.classList.toggle('menu-open',open);
    menuButton.setAttribute('aria-expanded',String(open));
    document.querySelector('main').inert = open;
    document.querySelector('footer').inert = open;
    updateLabels();
    if (open) nav.querySelector('a').focus();
    else if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click',() => setMenu(!document.body.classList.contains('menu-open')));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click',() => setMenu(false)));
  document.addEventListener('keydown',event => {
    if (!document.body.classList.contains('menu-open')) return;
    if (event.key === 'Escape') {event.preventDefault();setMenu(false,true);return;}
    if (event.key === 'Tab') {
      const nodes = [...document.querySelectorAll('.site-header a,.site-header button')].filter(el => el.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length-1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
    }
  });
  const mobile = matchMedia('(max-width:790px)');
  const closeDesktopMenu = event => {if (!event.matches) setMenu(false);};
  if (mobile.addEventListener) mobile.addEventListener('change',closeDesktopMenu);
  else mobile.addListener(closeDesktopMenu);
  function openSettings(trigger) {
    settingsTrigger = trigger;
    settingsForm.querySelector(`input[name="language"][value="${lang}"]`).checked = true;
    settingsForm.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
    rememberBox.checked = remember;
    dialog.showModal();
  }
  document.querySelectorAll('[data-open-settings]').forEach(button => button.addEventListener('click',() => openSettings(button)));
  document.getElementById('close-settings').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => {if(settingsTrigger) settingsTrigger.focus();});
  settingsForm.addEventListener('submit',event => {
    event.preventDefault();
    remember = rememberBox.checked;
    applyPreferences(settingsForm.elements.language.value,settingsForm.elements.theme.value,true);
    dialog.close();
    announce(text().saved);
  });
  document.getElementById('reset-preferences').addEventListener('click',() => {
    remember = false;
    applyPreferences('pl','light',true);
    rememberBox.checked = false;
    dialog.close();
    announce(text().reset);
  });
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click',async () => {
    try {await navigator.clipboard.writeText('cereaxislabs@gmail.com');announce(text().copied);}
    catch (_) {announce(text().copyFailed);}
  }));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }),{threshold:.07});
    root.classList.add('motion');
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const showAll = () => {if(reducedMotion.matches){root.classList.remove('motion');observer.disconnect();}};
    if(reducedMotion.addEventListener) reducedMotion.addEventListener('change',showAll);
  }
  const year = document.getElementById('copyright-year');
  if(year) year.textContent = new Date().getFullYear();
  applyPreferences();
})();
