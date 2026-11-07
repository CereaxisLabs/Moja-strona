(() => {
  'use strict';
  const root = document.documentElement;
  const inEnglish = () => root.lang === 'en';
  const wording = (pl,en) => inEnglish() ? en : pl;
  const entry = document.getElementById('site-entry');
  const entryKey = 'cereaxis.terms.accepted';
  const entryCheckbox = document.getElementById('entry-accept');
  const entryContinue = document.getElementById('entry-continue');
  let entryConfirmed=false;
  const hasAccepted = () => {
    try { return sessionStorage.getItem(entryKey) === entry.dataset.version; }
    catch (_) { return false; }
  };
  function syncEntryLanguages() {
    document.querySelectorAll('[data-entry-language]').forEach(button => {
      button.setAttribute('aria-pressed',String(button.dataset.entryLanguage === root.lang));
    });
  }
  function showEntry() {
    if (!entry || document.body.dataset.entryRequired !== 'true' || entryConfirmed || hasAccepted()) return;
    document.body.classList.add('entry-open');
    if (!entry.open) entry.showModal();
    syncEntryLanguages();
  }
  if (entry) {
    entry.addEventListener('cancel',event => event.preventDefault());
    document.addEventListener('keydown',event=>{if(entry.open&&event.key==='Escape')event.preventDefault();},true);
    entry.addEventListener('close',()=>{if(!entryConfirmed&&!hasAccepted()&&document.body.dataset.entryRequired==='true')requestAnimationFrame(showEntry);});
    entryCheckbox.addEventListener('change',() => {entryContinue.disabled = !entryCheckbox.checked;});
    document.getElementById('entry-form').addEventListener('submit',event => {
      event.preventDefault();
      if (!entryCheckbox.checked) {entryCheckbox.focus();return;}
      entryConfirmed=true;
      try {sessionStorage.setItem(entryKey,entry.dataset.version);} catch (_) {}
      entry.close();
      document.body.classList.remove('entry-open');
      document.getElementById('main').focus({preventScroll:true});
    });
    document.querySelectorAll('[data-entry-language]').forEach(button => button.addEventListener('click',() => {
      if (root.lang !== button.dataset.entryLanguage) document.getElementById('language-toggle').click();
    }));
    window.addEventListener('pageshow',showEntry);
    showEntry();
  }
  document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click',() => {
    const selected=button.dataset.scenario;
    document.querySelectorAll('[data-scenario]').forEach(other => other.setAttribute('aria-pressed',String(other===button)));
    document.querySelectorAll('[data-scenario-panel]').forEach(panel => {panel.hidden=panel.dataset.scenarioPanel!==selected;});
  }));
  let scrollQueued=false;
  function updateScroll() {
    scrollQueued=false;
    const max=root.scrollHeight-innerHeight;
    root.style.setProperty('--reading-progress',(max>0 ? Math.min(100,100*scrollY/max) : 0)+'%');
    document.body.classList.toggle('has-scrolled',scrollY>500);
    document.querySelector('.site-header')?.classList.toggle('is-scrolled',scrollY>16);
  }
  function queueScroll() {if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}}
  addEventListener('scroll',queueScroll,{passive:true});
  addEventListener('resize',queueScroll,{passive:true});
  updateScroll();
  const form=document.getElementById('website-order-form');
  let refreshPreview=()=>{};
  let refreshOrderLocale=()=>{};
  if (form) {
    const review=document.getElementById('order-review');
    const summary=document.getElementById('order-summary');
    const emailLink=document.getElementById('order-open-email');
    const note=document.getElementById('order-review-note');
    const status=document.getElementById('order-status');
    const errorBox=document.getElementById('order-errors');
    const errorList=document.getElementById('order-error-list');
    const submit=document.getElementById('order-submit');
    const automation=form.dataset.service==='automation';
    const fields=automation ? ['name','email','company','phone','processDescription','currentTools','repetitiveTasks','targetGoal','teamSize','budget','deadline'] : ['name','email','company','phone','websiteType','existingUrl','description','sections[]','languages[]','otherLanguage','materialsReadiness','domainHosting','budget','deadline','integrations'];
    const labels={
      name:['Imię i nazwisko','Full name'],email:['Adres e-mail','Email address'],company:['Firma lub marka','Company or brand'],phone:['Telefon','Phone'],websiteType:['Rodzaj strony','Website type'],existingUrl:['Obecna strona / inspiracja','Existing website / reference'],description:['Opis projektu i cel','Project description and goal'],'sections[]':['Planowane sekcje','Planned sections'],'languages[]':['Wersje językowe','Language versions'],otherLanguage:['Inny język','Other language'],materialsReadiness:['Treści i materiały','Content and materials'],domainHosting:['Domena i hosting','Domain and hosting'],budget:['Orientacyjny budżet (PLN)','Indicative budget (PLN)'],deadline:['Preferowany termin','Preferred deadline'],integrations:['Funkcje, integracje i uwagi','Features, integrations and notes']
    };
    Object.assign(labels,{processDescription:['Proces i problem do uporządkowania','The process and problem to improve'],currentTools:['Obecnie używane narzędzia','Current tools'],repetitiveTasks:['Powtarzalne zadania','Repetitive tasks'],targetGoal:['Oczekiwany rezultat doradztwa','Desired consulting outcome'],teamSize:['Wielkość zespołu','Team size']});
    function setStatus(pl,en){status.dataset.pl=pl;status.dataset.en=en;status.textContent=wording(pl,en);}
    submit.disabled=false;
    // JS handles validation and prepares text only. No network request is made.
    form.noValidate=true;
    const deadline=document.getElementById('order-deadline');
    if(deadline){const d=new Date();deadline.min=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
    function valueFor(name) {
      const nodes=Array.from(form.elements).filter(el=>el.name===name);
      const first=nodes[0];
      if(!first)return '';
      if(first.type==='checkbox')return nodes.filter(el=>el.checked).map(el=>el.closest('label')?.textContent.trim()||el.value).join(', ');
      if(first.tagName==='SELECT')return first.selectedOptions[0]?.textContent.trim()||'';
      return first.value.trim();
    }
    function makeBrief() {
      const lines=[automation?wording('ZAPYTANIE O DORADZTWO W AUTOMATYZACJI','AUTOMATION CONSULTING ENQUIRY'):wording('ZAPYTANIE O STRONĘ INTERNETOWĄ','WEBSITE PROJECT ENQUIRY'),'Cereaxis Labs',''];
      for(const name of fields){const value=valueFor(name);if(value)lines.push(wording(...labels[name])+':\n'+value+'\n');}
      lines.push(wording('To zapytanie o indywidualną wycenę. Zakres, cena i warunki współpracy wymagają osobnego uzgodnienia.','This is an enquiry for an individual quote. Scope, pricing and collaboration terms require a separate agreement.'));
      return lines.join('\n');
    }
    refreshPreview=()=>{
      if(review.hidden)return;
      summary.value=makeBrief();
      const subject=automation ? wording('Doradztwo w automatyzacji — Cereaxis Labs','Automation consulting — Cereaxis Labs') : wording('Zapytanie o stronę internetową — Cereaxis Labs','Website project enquiry — Cereaxis Labs');
      const base='mailto:cereaxislabs@gmail.com?subject='+encodeURIComponent(subject);
      const complete=base+'&body='+encodeURIComponent(summary.value);
      const long=complete.length>1800;
      emailLink.href=long?base:complete;
      emailLink.removeAttribute('aria-disabled');
      document.getElementById('order-copy').disabled=false;
      // Mail applications have different URI limits; the full brief always stays available.
      const span=emailLink.querySelector('[data-pl]');
      if(span){span.dataset.pl=long?'Otwórz pocztę i wklej brief':'Otwórz gotowy e-mail';span.dataset.en=long?'Open email and paste the brief':'Open the prepared email';span.textContent=span.dataset[root.lang];}
      note.textContent=long ? wording('Brief jest długi. Aby zachować całą treść, skopiuj go przyciskiem poniżej, otwórz pocztę i wklej do wiadomości.','This brief is long. To preserve every detail, copy it using the button below, open your email application and paste it into the message.') : wording('Sprawdź podsumowanie. Przycisk otworzy wiadomość w Twojej aplikacji pocztowej. Wyślij ją samodzielnie na cereaxislabs@gmail.com.','Review the summary. The button opens a draft in your email application. Send it yourself to cereaxislabs@gmail.com.');
    };
    function fieldIsInvalid(field) {
      const trimmed=field.required && typeof field.value==='string' && field.type!=='checkbox' && !field.value.trim();
      const tooShort=field.minLength>0 && field.value && field.value.trim().length<field.minLength;
      const tooLong=field.maxLength>0 && field.value && field.value.length>field.maxLength;
      const badUrl=field.type==='url' && field.value && !/^https?:\/\//i.test(field.value);
      return trimmed||tooShort||tooLong||badUrl||!field.checkValidity();
    }
    function allFieldsValid(){return Array.from(form.elements).filter(field=>field.willValidate).every(field=>!fieldIsInvalid(field));}
    function validate(focus=true) {
      errorList.replaceChildren();
      let valid=true;
      for(const field of Array.from(form.elements)) {
        if(!field.willValidate)continue;
        const bad=fieldIsInvalid(field);
        const message=document.getElementById(field.id+'-error');
        field.toggleAttribute('aria-invalid',bad);
        if(bad)field.setAttribute('aria-invalid','true');
        if(message)message.hidden=!bad;
        if(bad){
          valid=false;
          const item=document.createElement('li');const link=document.createElement('a');
          link.href='#'+field.id;
          link.textContent=message?.textContent || wording('Sprawdź wymagane pole.','Check the required field.');
          link.addEventListener('click',event=>{event.preventDefault();field.focus();});
          item.append(link);errorList.append(item);
        }
      }
      errorBox.hidden=valid;
      if(!valid&&focus){errorBox.setAttribute('tabindex','-1');errorBox.focus();}
      return valid;
    }
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(document.getElementById('form-website').value)return;
      if(!validate())return;
      review.hidden=false;refreshPreview();
      setStatus('Podsumowanie jest gotowe. Wiadomość nie została jeszcze wysłana.','Your brief is ready. The email has not been sent yet.');
      document.getElementById('order-review-title').focus();
      review.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
    form.addEventListener('input',()=>{
      if(!review.hidden && !allFieldsValid()){
        review.hidden=true;emailLink.removeAttribute('href');emailLink.setAttribute('aria-disabled','true');document.getElementById('order-copy').disabled=true;
        setStatus('Uzupełnij wymagane pola i przygotuj wiadomość ponownie.','Complete the required fields and prepare your message again.');
        return;
      }
      refreshPreview();
      if(!review.hidden)setStatus('Podsumowanie zaktualizowano. Wyślij je ze swojej poczty.','Your brief has been updated. Send it from your email application.');
    });
    document.getElementById('order-copy').addEventListener('click',async()=>{
      try {await navigator.clipboard.writeText(summary.value);setStatus('Pełny brief skopiowany. Możesz wkleić go do wiadomości e-mail.','The full brief has been copied. You can paste it into an email.');}
      catch(_){summary.focus();summary.select();setStatus('Zaznaczono pełny brief. Skopiuj go ręcznie i wklej do wiadomości.','The full brief is selected. Copy it manually and paste it into your email.');}
    });
    emailLink.addEventListener('click',event=>{
      if(!allFieldsValid()){event.preventDefault();validate();return;}
      setStatus('Dokończ wysyłkę w swojej aplikacji pocztowej. Jeśli się nie otworzyła, skopiuj brief i wyślij go ręcznie.','Complete sending in your email application. If it did not open, copy the brief and send it manually.');
    });
    refreshOrderLocale=()=>{if(!errorBox.hidden)validate(false);refreshPreview();};
  }
  document.addEventListener('cereaxis:languagechange',()=>{syncEntryLanguages();refreshOrderLocale();});
})();
