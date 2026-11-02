'use strict';
// Behaviour checks in a DOM emulator; these do not replace visual browser QA.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {JSDOM} = require('../.qa/node_modules/jsdom');
const root = path.resolve(__dirname,'..');
const script = fs.readFileSync(path.join(root,'assets/site.js'),'utf8');
const pages = Object.keys(JSON.parse(fs.readFileSync(path.join(root,'site-pages.json'),'utf8')));
const key = 'cereaxis.preferences.v2';

function openPage(file='index.html',query='',preference=null,fileMode=false) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  const dom = new JSDOM(html,{url:fileMode?'file:///'+path.join(root,file).replaceAll('\\','/')+query:'https://example.test/'+file+query,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  if(preference) w.localStorage.setItem(key,JSON.stringify(preference));
  for(const item of w.document.querySelectorAll('script:not([src])')) w.eval(item.textContent);
  w.eval(script);
  return dom;
}
function click(w,selector){const el=w.document.querySelector(selector);assert.ok(el,selector);el.click();return el;}
function assertTranslated(w,lang){
  for(const el of w.document.querySelectorAll('[data-pl][data-en]')){
    assert.equal(el.tagName==='META'?el.content:el.textContent,el.dataset[lang],`${el.tagName} translation`);
  }
}
for(const file of pages){
  const dom=openPage(file);const w=dom.window;
  assert.equal(w.document.querySelectorAll('h1').length,1,file);
  assert.equal(w.document.documentElement.dataset.theme,'light',file);
  assert.equal(w.document.documentElement.lang,'pl',file);
  assert.equal(w.localStorage.length,0,`${file}: no storage before opt-in`);
  click(w,'#language-toggle');
  assert.equal(w.document.documentElement.lang,'en');
  assertTranslated(w,'en');
  assert.equal(w.localStorage.length,0,'language alone must not store data');
  assert.equal(new w.URL(w.location.href).searchParams.get('lang'),'en');
  click(w,'#theme-toggle');
  assert.equal(w.document.documentElement.dataset.theme,'dark');
  assert.equal(w.localStorage.length,0,'theme alone must not store data');
  assert.equal(new w.URL(w.document.querySelector('.nav-links a').href).searchParams.get('theme'),'dark');
  assert.equal(w.document.querySelectorAll('img').length>0,true);
  dom.window.close();
}
console.log('PASS: 11 pages start in Polish/light, translate fully, and navigate without storage.');
{
 const dom=openPage();const w=dom.window;
 click(w,'[data-open-settings]');
 assert.equal(w.document.querySelector('#site-settings').open,true);
 w.document.querySelector('#remember-preferences').checked=true;
 w.document.querySelector('[name=language][value=en]').checked=true;
 w.document.querySelector('[name=theme][value=dark]').checked=true;
 w.document.querySelector('#settings-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const stored=JSON.parse(w.localStorage.getItem(key));
 assert.equal(stored.consent,true);assert.equal(stored.lang,'en');assert.equal(stored.theme,'dark');
 assert.ok(Math.abs(stored.expires-Date.now()-180*24*60*60*1000)<5000);
 assert.equal(w.document.querySelector('#site-settings').open,false);
 const returning=openPage('kontakt.html','',stored);
 assert.equal(returning.window.document.documentElement.lang,'en');
 assert.equal(returning.window.document.documentElement.dataset.theme,'dark');
 returning.window.close();
 click(w,'[data-open-settings]');
 w.document.querySelector('#remember-preferences').checked=false;
 w.document.querySelector('#settings-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(w.localStorage.getItem(key),null);
 click(w,'[data-open-settings]');click(w,'#reset-preferences');
 assert.equal(w.document.documentElement.lang,'pl');assert.equal(w.document.documentElement.dataset.theme,'light');
 assert.equal(w.location.search,'');assert.equal(w.localStorage.getItem(key),null);
 dom.window.close();
}
console.log('PASS: optional storage, 180-day validity, saved preference loading, withdrawal and reset.');
{
 const dom=openPage('index.html','',{consent:true,lang:'en',theme:'dark',expires:Date.now()-1000});
 assert.equal(dom.window.document.documentElement.lang,'pl');
 assert.equal(dom.window.localStorage.getItem(key),null);
 dom.window.close();
 const next=openPage('uslugi.html','?lang=en&theme=dark');
 assert.equal(next.window.document.documentElement.lang,'en');
 assert.equal(next.window.document.documentElement.dataset.theme,'dark');
 assert.equal(next.window.localStorage.length,0);
 next.window.close();
 const local=openPage('michal-florczak.html','?lang=en&theme=dark',null,true);
 assert.equal(local.window.document.documentElement.lang,'en');
 assert.equal(local.window.document.documentElement.dataset.theme,'dark');
 local.window.close();
}
console.log('PASS: expired settings, query navigation and file:// operation without localStorage access.');
{
 const dom=openPage();const w=dom.window;
 click(w,'#menu-toggle');
 assert.equal(w.document.querySelector('#menu-toggle').getAttribute('aria-expanded'),'true');
 assert.equal(w.document.querySelector('main').inert,true);
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(w.document.querySelector('#menu-toggle').getAttribute('aria-expanded'),'false');
 assert.equal(w.document.querySelector('main').inert,false);
 assert.equal(w.document.activeElement.id,'menu-toggle');
 click(w,'#menu-toggle');click(w,'.nav-links a[href*="index.html"]');
 assert.equal(w.document.querySelector('#menu-toggle').getAttribute('aria-expanded'),'false');
 dom.window.close();
}
console.log('PASS: navigation opens, closes, restores focus and responds to Escape.');
