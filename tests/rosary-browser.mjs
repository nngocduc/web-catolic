import assert from "node:assert/strict";
import fs from "node:fs";
import { loadTypeScript } from "./load-typescript.mjs";

// Run against `next start` on 3100 and Chromium CDP on 9223; optional args override those endpoints.
const appBase = process.argv[2] ?? "http://127.0.0.1:3100";
const cdpEndpoint = process.argv[3] ?? "http://127.0.0.1:9223";
const { prayers } = loadTypeScript("src/content/prayers.ts");
const pages = await (await fetch(`${cdpEndpoint}/json`)).json();
const socket = new WebSocket(pages.find(page => page.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, {once:true}));
const pending = new Map();
let nextId = 0;
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  const request = pending.get(message.id);
  if (request) {
    pending.delete(message.id);
    if (message.error) request.reject(message.error);
    else request.resolve(message.result);
  }
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, {resolve, reject});
  socket.send(JSON.stringify({id, method, params}));
});
const evaluate = async expression => {
  const result = await call("Runtime.evaluate", {expression, awaitPromise:true, returnByValue:true});
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = () => new Promise(resolve => setTimeout(resolve, 80));
let salveDetailText;
async function navigate(route) {
  await call("Page.navigate", {url:appBase + route});
  for (let i = 0; i < 60; i++) {
    if (await evaluate(`location.pathname === ${JSON.stringify(route)} && document.readyState === 'complete'`)) {
      await evaluate("document.fonts.ready.then(() => true)");
      await pause();
      return;
    }
    await pause();
  }
  throw new Error(`Page did not load: ${route}`);
}
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await pause();
}
async function dimensions(width, height) {
  await call("Emulation.setDeviceMetricsOverride", {width,height,deviceScaleFactor:1,mobile:width<768});
}
async function checkLayout(width, label, controls = false) {
  const errors = await evaluate(`(() => {
    const errors=[];
    if (innerWidth!==${width} || document.documentElement.scrollWidth>innerWidth) errors.push('horizontal overflow');
    for (const p of document.querySelectorAll('.bilingual-text p')) {
      const r=p.getBoundingClientRect();
      if(r.left<0 || r.right>innerWidth+0.1 || getComputedStyle(p).whiteSpace!=='pre-line') errors.push('paragraph '+p.className+' bounds '+r.left.toFixed(1)+'..'+r.right.toFixed(1)+' / white-space '+getComputedStyle(p).whiteSpace);
    }
    for (const element of document.querySelectorAll('.navigation a, .rosary-experience button, .rosary-opening-option')) {
      const r=element.getBoundingClientRect();
      if(r.width<44 || r.height<44 || r.left<0 || r.right>innerWidth+0.1) errors.push('touch target / bounds');
    }
    if (${controls}) {
      const bar=document.querySelector('.rosary-controls').getBoundingClientRect();
      if(bar.bottom>innerHeight+0.1 || bar.top<0) errors.push('controls offscreen');
      for(const button of document.querySelectorAll('.rosary-controls button')) {
        const r=button.getBoundingClientRect();
        if(!button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))) errors.push('controls covered');
      }
      const orientation=document.querySelector('.rosary-orientation').getBoundingClientRect();
      if(orientation.bottom>bar.top) errors.push('sticky orientation overlaps controls');
    }
    return errors;
  })()`);
  assert.deepEqual(errors, [], label);
}
async function disclosures(width, label, controls = false) {
  const count = await evaluate("document.querySelectorAll('details').length");
  for (let i=0; i<count; i++) {
    await evaluate(`document.querySelectorAll('details')[${i}].querySelector('summary').click()`);
    assert(await evaluate(`document.querySelectorAll('details')[${i}].open`), label + " open");
    await checkLayout(width, label + " open disclosure", controls);
    await evaluate(`document.querySelectorAll('details')[${i}].querySelector('summary').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('details')[${i}].open`), false);
  }
}
async function canonical(id) {
  const actual = await evaluate(`(() => {
    const article=document.querySelector('.rosary-prayer');
    return {ja:article.querySelector('.japanese').textContent,reading:article.querySelector('.reading').textContent,vi:article.querySelector('.translation').textContent};
  })()`);
  assert.deepEqual(actual, prayers.find(prayer => prayer.id === id).text, id);
  if (id === "salve-regina") assert.deepEqual(actual, salveDetailText, "Rosary equals the canonical detail page");
}
const results = [];
try {
  // Mass foundation: exact short/tall phone, tablet and desktop matrix.
  for (const [width,height] of [[320,568],[375,667],[430,932],[768,1024],[1024,768],[1440,900]]) {
    await dimensions(width,height);
    await navigate("/mass");
    await checkLayout(width, `Mass@${width}x${height}`);
    assert.equal(await evaluate("document.querySelectorAll('.mass-section').length"),5);
    assert(await evaluate("document.querySelectorAll('[data-mass-kind=spoken]').length>15"));
    assert.equal(await evaluate("document.querySelectorAll('[data-mass-kind=variable]').length"),20);
    assert(await evaluate("document.querySelectorAll('[data-mass-kind=rubric]').length>10"));
    assert.equal(await evaluate("document.querySelectorAll('[data-mass-kind=prayer]').length"),1);
    assert.equal(await evaluate("document.querySelectorAll('[data-mass-kind=prayer-variant]').length"),2);
    assert.equal(await evaluate("document.querySelectorAll('.mass-choice').length"),14);
    assert.deepEqual(await evaluate("[...document.querySelectorAll('#concluding .mass-subsection')].map(section=>section.id)"),["concluding-notices","concluding-greeting","concluding-blessing","concluding-dismissal"]);
    assert(await evaluate("document.querySelector('.sample-notice[aria-label=ミサの収録状況]').textContent.includes('まだ部分的') && document.querySelector('.sample-notice[aria-label=ミサの収録状況]').textContent.includes('省略')"));
    assert(await evaluate("document.querySelector('#concluding').textContent.includes('このアプリのミサ式次第表示はここで終わります')"));
    for(const id of ["concluding-presider-greeting","concluding-proper-blessing","concluding-dismissal-form"]) {
      await click(`[data-choice-id='${id}'] > summary`);
      assert(await evaluate(`document.querySelector('[data-choice-id=${id}]').open`));
      assert(await evaluate(`document.querySelectorAll('[data-choice-id=${id}] .mass-choice-option').length>=2`));
      await click(`[data-choice-id='${id}'] > summary`);
    }
    assert.equal(await evaluate("document.querySelectorAll('#concluding [data-slot=solemn-blessing],#concluding [data-slot=prayer-over-the-people]').length"),2);
    assert.equal(await evaluate("document.querySelectorAll('#concluding [data-slot=solemn-blessing] .mass-empty,#concluding [data-slot=prayer-over-the-people] .mass-empty').length"),2);
    assert.deepEqual(await evaluate("[...document.querySelectorAll('#communion .mass-subsection')].map(section=>section.id)"),["communion-transition","communion-lords-prayer","communion-church-peace-prayer","communion-peace-greeting","communion-fraction","communion-priest-preparation","communion-invitation","communion-priest-reception","communion-distribution","communion-purification","communion-after-silence"]);
    assert(await evaluate("document.querySelector('#communion .ep-selector')===null"));
    assert(await evaluate("document.querySelector('#communion .mass-variant').textContent.includes('ミサ用本文未収録')"));
    assert(await evaluate("document.querySelector('#communion .mass-variant').textContent.includes('lords-prayer')===false"));
    assert.equal(await evaluate("document.querySelectorAll('#communion [data-slot=prayer-after-communion]').length"),1);
    assert.equal(await evaluate("document.querySelectorAll('#communion [data-slot=communion-song],#communion [data-slot=post-communion-song]').length"),2);
    assert.equal(await evaluate("document.querySelectorAll('#communion [data-slot=communion-song]').length"),1);
    assert(await evaluate("document.querySelector('#communion-priest-reception').compareDocumentPosition(document.querySelector('#communion-distribution')) & Node.DOCUMENT_POSITION_FOLLOWING"));
    assert(await evaluate("document.querySelector('#communion-distribution').compareDocumentPosition(document.querySelector('#communion-purification')) & Node.DOCUMENT_POSITION_FOLLOWING"));
    assert(await evaluate("document.querySelector('#communion-purification').compareDocumentPosition(document.querySelector('#communion-after-silence')) & Node.DOCUMENT_POSITION_FOLLOWING"));
    assert(await evaluate("document.querySelector('#communion-distribution').textContent.includes('配布中も続くことを示しています')"));
    assert(await evaluate("document.querySelector('#communion-priest-reception').textContent.includes('拝領の歌を始める')"));
    assert(await evaluate("document.querySelector('#communion-purification').textContent.includes('司祭の静かな祈り')"));
    assert.equal(await evaluate("document.querySelectorAll('.mass-unavailable .content-sources').length"), await evaluate("document.querySelectorAll('.mass-unavailable').length"), "each unavailable block has exactly one source disclosure");
    assert.equal(await evaluate("document.querySelectorAll('.mass-passage > .badge').length"),0,"ordinary unverified dialogue has no prominent per-line badge");
    assert(await evaluate("document.querySelector('.mass-passage .content-sources').textContent.includes('未確認')"),"status remains in the source disclosure");
    assert.equal(await evaluate("document.querySelectorAll('.mass-section[aria-labelledby] .mass-unavailable .mass-empty').length>0"),true,"unavailable bodies remain prominent");
    assert.equal(await evaluate("document.querySelectorAll('.sample-notice[aria-label=ミサの収録状況]').length"),1,"one page-level partial notice");
    assert(await evaluate("document.querySelector('#second-reading h3').textContent.includes('行われる場合')"),"second reading is explicitly conditional");
    assert(await evaluate("document.querySelector('#communion-transition').textContent.includes('奉献文の本文はこの案内に未収録です')"));
    await click("[data-choice-id='concluding-proper-blessing'] > summary");
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=concluding-proper-blessing] .mass-choice-option').length"),3);
    assert(await evaluate("document.querySelector('[data-choice-id=concluding-proper-blessing]').textContent.includes('固有の祝福形式なし')"));
    assert(await evaluate("document.querySelector('#concluding-dismissal .mass-rubric').textContent.includes('他の祭儀が続く場合')"));
    await click("[data-choice-id='concluding-proper-blessing'] > summary");
    await click(".mass-passage .content-sources > summary");
    assert(await evaluate("document.querySelector('.mass-passage .content-sources[open] .metadata-verification').textContent.includes('未確認')"),"verification is discoverable from native disclosure");
    await click(".mass-passage .content-sources > summary");
    await click("#communion-priest-reception .mass-unavailable .content-sources > summary");
    assert.equal(await evaluate("document.querySelectorAll('#communion-priest-reception .mass-unavailable .content-sources').length"),await evaluate("document.querySelectorAll('#communion-priest-reception .mass-unavailable').length"));
    assert(await evaluate("Boolean(document.querySelector('#communion-priest-reception .mass-unavailable .content-sources[open]'))"));
    await click("#communion-priest-reception .mass-unavailable .content-sources > summary");
    await click("[data-choice-id='priest-communion-preparation-form'] > summary");
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=priest-communion-preparation-form] .mass-choice-option').length"),2);
    await click("[data-choice-id='priest-communion-preparation-form'] > summary");
    await click("[data-choice-id='communion-response-form'] > summary");
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=communion-response-form] .mass-choice-option').length"),2);
    assert(await evaluate("document.querySelectorAll('[data-choice-id=communion-response-form] .mass-choice-option .mass-unavailable').length===2"));
    await click("[data-choice-id='communion-response-form'] > summary");
    await click("[data-choice-id='communion-species-form'] > summary");
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=communion-species-form] .mass-choice-option').length"),2);
    assert(await evaluate("document.querySelectorAll('[data-choice-id=communion-species-form] .mass-unavailable').length===4"));
    await click("[data-choice-id='communion-species-form'] > summary");
    assert.deepEqual(await evaluate("[...document.querySelectorAll('#eucharist .mass-subsection')].map(section=>section.id)"),["gift-preparation","prayer-over-offerings","eucharistic-prayer-transition"]);
    for(const id of ["bread-presentation-mode","wine-presentation-mode"]) {
      await click(`[data-choice-id='${id}'] > summary`);
      assert.equal(await evaluate(`document.querySelectorAll('[data-choice-id=${id}] .mass-choice-option').length`),2);
      assert(await evaluate(`document.querySelector('[data-choice-id=${id}]').textContent.includes('小声')`));
      assert(await evaluate(`document.querySelector('[data-choice-id=${id}]').textContent.includes('任意の応答')`));
      await click(`[data-choice-id='${id}'] > summary`);
    }
    assert(await evaluate("Boolean(document.querySelector('#eucharist [data-slot=prayer-over-offerings] .mass-empty'))"));
    assert(await evaluate("Boolean(document.querySelector('#eucharist [data-slot=preface] .mass-empty'))"));
    assert.equal(await evaluate("document.querySelectorAll('.ep-option').length"),4);
    assert.equal(await evaluate("document.querySelectorAll('.ep-option input:disabled').length"),4);
    assert.equal(await evaluate("document.querySelectorAll('.ep-option input:checked').length"),0);
    assert.equal(await evaluate("document.querySelectorAll('.ep-option-state').length"),4);
    assert(await evaluate("document.querySelector('.ep-selector').textContent.includes('省略される意味ではありません')"));
    await click(".ep-structure-source > summary");
    assert(await evaluate("document.querySelector('.ep-structure-source').open"));
    await click(".ep-structure-source > summary");
    assert.deepEqual(await evaluate("[...document.querySelectorAll('#word .mass-subsection')].map(section=>section.id)"),["first-reading","responsorial-psalm","second-reading","gospel-acclamation","gospel-reading","homily","profession-of-faith","universal-prayer"]);
    await click("[data-choice-id='gospel-acclamation-form'] > summary");
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=gospel-acclamation-form] .mass-choice-option').length"),2);
    assert.equal(await evaluate("document.querySelectorAll('#word [data-slot=gospel-acclamation],#word [data-slot=gospel-chant]').length"),2);
    await click("[data-choice-id='gospel-acclamation-form'] > summary");
    await click("[data-choice-id='creed-form'] > summary");
    const massApostles = await evaluate(`(() => {
      const content=document.querySelector('[data-choice-id=creed-form] .mass-choice-option:last-of-type .mass-reference > .bilingual-text');
      return Object.fromEntries(['ja','reading','vi'].map((lang,index)=>[lang,content.querySelector(index===0?'.japanese':index===1?'.reading':'.translation').textContent]));
    })()`);
    assert.deepEqual(massApostles,prayers.find(prayer=>prayer.id==='apostles-creed').text);
    await click("[data-choice-id='creed-form'] > summary");
    await click("[data-choice-id='intentions-response-form'] > summary");
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=intentions-response-form] .mass-choice-option').length"),2);
    await click("[data-choice-id='intentions-response-form'] > summary");
    assert(await evaluate("[...document.querySelectorAll('.mass-choice')].every(choice=>!choice.open)"),"alternatives start collapsed");
    assert(await evaluate("document.querySelector('#communion').textContent.includes('感謝の典礼の中で')"));
    assert(await evaluate("document.querySelector('#communion .mass-variant').textContent.includes('主の祈り')"));
    const variantText=await evaluate(`(() => {
      const parts=[...document.querySelectorAll('.mass-variant .mass-passage .bilingual-text')];
      return Object.fromEntries(['ja','reading','vi'].map((lang,index)=>[lang,parts.map(part=>part.querySelector(index===0?'.japanese':index===1?'.reading':'.translation').textContent).join('\\n')]));
    })()`);
    assert.deepEqual(variantText,prayers.find(prayer=>prayer.id==='sign-of-cross').text);
    await click("[data-choice-id='greeting-formula'] > summary");
    assert(await evaluate("document.querySelector('[data-choice-id=greeting-formula]').open && document.querySelector('[data-choice-id=greeting-formula] .mass-choice-instruction').textContent.includes('一つ')"));
    assert.equal(await evaluate("document.querySelectorAll('[data-choice-id=greeting-formula] .mass-choice-option').length"),4);
    assert(await evaluate("document.querySelector('[data-choice-id=greeting-formula] .mass-choice-option:last-of-type').textContent.includes('司教')"));
    await checkLayout(width, `Mass greeting alternatives@${width}x${height}`);
    await click("[data-choice-id='greeting-formula'] > summary");
    assert(await evaluate(`(() => {
      for(const element of document.querySelectorAll('.mass-content a,.mass-content summary')) {
        if(!element.getClientRects().length) continue;
        const r=element.getBoundingClientRect();
        if(r.width<44 || r.height<44 || r.left<0 || r.right>innerWidth+0.1) return false;
      }
      return true;
    })()`), "Mass touch targets >=44px and within viewport");
    await disclosures(width, `Mass@${width}x${height}`);
    // Native keyboard-operated disclosure and visible focus, no custom widget.
    await evaluate("document.querySelector('.mass-structure-sources summary').focus()");
    await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,modifiers:8});
    await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,modifiers:8});
    await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    assert(await evaluate("document.activeElement===document.querySelector('.mass-structure-sources summary')"));
    assert(await evaluate("parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=3"));
    await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
    await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
    assert(await evaluate("document.querySelector('.mass-structure-sources').open"));
    await click(".mass-structure-sources summary");
    await click('.section-index a[href="#word"]');
    assert.equal(await evaluate("location.hash"),"#word");
    await checkLayout(width, `Mass Word@${width}x${height}`);
    const screenshot = await call("Page.captureScreenshot",{format:"png"});
    fs.writeFileSync(`.next/task12-mass-${width}x${height}.png`,Buffer.from(screenshot.data,"base64"));
    await click('.section-index a[href="#communion"]');
    assert(await evaluate("document.querySelector('#communion .mass-variant').textContent.includes('ミサ用本文未収録')"));
    assert.equal(await evaluate("document.querySelectorAll('#communion .mass-variant .mass-passage').length"),0);
    assert.equal(await evaluate("document.querySelector('#communion .mass-variant a.text-link').getAttribute('href')"),"/prayers/lords-prayer");
    assert(await evaluate("!document.querySelector('#communion').textContent.includes('国と力と栄光は、永遠にあなたのもの。\\nアーメン。')"));
    await evaluate("window.scrollTo(0,document.documentElement.scrollHeight)");
    assert(await evaluate("document.querySelector('.mass-section:last-child').getBoundingClientRect().bottom<=innerHeight"));
    assert(await evaluate("[...document.querySelectorAll('#concluding .mass-rubric')].some(node=>node.textContent.includes('このアプリのミサ式次第表示はここで終わります') && node.getBoundingClientRect().bottom<=innerHeight)"),"end marker remains reachable at page bottom");
    results.push(`/mass structure + roles + placeholders + canonical reference + disclosure/keyboard + wrapping @${width}x${height} passed`);
    console.log(results.at(-1));
  }
  // Existing-route regression matrix, including full long pages and open disclosures.
  for (const width of [320,375,768,1024,1440]) {
    await dimensions(width, 844);
    for (const route of ["/", "/mass", "/prayers", "/prayers/apostles-creed", "/prayers/sign-of-cross", "/prayers/lords-prayer", "/prayers/salve-regina", "/prayers/angelus"]) {
      await navigate(route);
      await checkLayout(width, `${route}@${width}`);
      await disclosures(width, `${route}@${width}`);
      if(route.endsWith("angelus")) assert.equal(await evaluate("document.querySelectorAll('.referenced-prayer').length"), 3);
      if(route.endsWith("salve-regina")) {
        salveDetailText = await evaluate(`(() => {
          const article=document.querySelector('.prayer-body');
          return {ja:article.querySelector('.japanese').textContent,reading:article.querySelector('.reading').textContent,vi:article.querySelector('.translation').textContent};
        })()`);
        assert.deepEqual(salveDetailText, prayers.find(prayer => prayer.id === "salve-regina").text);
      }
      results.push(`${route}@${width} passed`);
    }
  }
  // Six required widths, plus short/tall phones. Check selection and praying states.
  for (const [width,height] of [[320,568],[375,667],[430,932],[768,1024],[1024,768],[1440,900],[375,812]]) {
    await dimensions(width,height);
    await navigate("/rosary");
    await checkLayout(width, `selection@${width}x${height}`);
    for (let set=0; set<4; set++) {
      await click(`.mystery-choices button:nth-child(${set+1})`);
      assert.equal(await evaluate("document.querySelectorAll('.mystery-preview li').length"), 5);
      assert(await evaluate(`document.querySelectorAll('.mystery-choices button')[${set}].getAttribute('aria-pressed')==='true' && document.querySelectorAll('.mystery-choices button')[${set}].textContent.includes('✓')`));
      await checkLayout(width, `mystery${set}@${width}x${height}`);
    }
    await disclosures(width, `selection@${width}`);
    await click(".rosary-opening-option input"); // five decades only
    await click(".rosary-start");
    await checkLayout(width, `prayer@${width}x${height}`, true);
    assert(await evaluate("document.querySelector('.rosary-controls button:first-child').disabled"));
    await canonical("lords-prayer");
    await disclosures(width, `prayer@${width}`, true);
    // Controls remain reachable while reading at the bottom; content can clear the bar.
    await evaluate("window.scrollTo(0,document.documentElement.scrollHeight)");
    await checkLayout(width, `bottom@${width}`, true);
    assert(await evaluate("document.querySelector('.rosary-praying-layout').getBoundingClientRect().bottom <= document.querySelector('.rosary-controls').getBoundingClientRect().top"));
    await click(".rosary-controls button:last-child");
    await canonical("ave-maria");
    await checkLayout(width, `Ave@${width}`, true);
    assert(await evaluate("document.querySelector('.rosary-prayer .japanese').getBoundingClientRect().top + parseFloat(getComputedStyle(document.querySelector('.rosary-prayer .japanese')).lineHeight) <= document.querySelector('.rosary-controls').getBoundingClientRect().top"), "prayer first line visible on entry");
    await disclosures(width, `Ave@${width}`, true);
    const screenshot = await call("Page.captureScreenshot", {format:"png"});
    fs.writeFileSync(`.next/task10-rosary-${width}x${height}.png`, Buffer.from(screenshot.data,"base64"));
    await evaluate("window.scrollTo(0,document.documentElement.scrollHeight)");
    const previousScroll = await evaluate("window.scrollY");
    await click(".rosary-controls button:last-child");
    assert.equal(await evaluate("window.scrollY"), previousScroll, "identical Ave Maria keeps scroll position");
    // Reach the closing through actual Next interactions, never by changing React state.
    await evaluate(`(async () => {
      while(Number(document.querySelector('.rosary-current').dataset.step)<59) {
        const before=Number(document.querySelector('.rosary-current').dataset.step);
        document.querySelector('.rosary-controls button:last-child').click();
        for(let i=0;i<50 && Number(document.querySelector('.rosary-current').dataset.step)===before;i++) await new Promise(r=>setTimeout(r,10));
        if(Number(document.querySelector('.rosary-current').dataset.step)!==before+1) throw new Error('Next failed');
      }
    })()`);
    await canonical("glory-be");
    assert(await evaluate("document.querySelector('.rosary-orientation').textContent.includes('第5の黙想 / 5')"));
    await click(".rosary-controls button:last-child");
    await canonical("salve-regina");
    assert.equal(await evaluate("document.querySelector('progress').max"), 61);
    assert.equal(await evaluate("document.querySelector('progress').value"), 60);
    assert(await evaluate("document.querySelector('.rosary-orientation').textContent.includes('結びの祈り') && document.querySelector('.rosary-orientation').textContent.includes('Kinh kết thúc') && !document.body.textContent.includes('第6の黙想')"));
    assert.equal(await evaluate("document.querySelectorAll('.rosary-theme').length"), 0);
    await checkLayout(width, `closing@${width}x${height}`, true);
    await disclosures(width, `closing@${width}`, true);
    const closingScreenshot = await call("Page.captureScreenshot", {format:"png"});
    fs.writeFileSync(`.next/task10-closing-${width}x${height}.png`, Buffer.from(closingScreenshot.data,"base64"));
    await evaluate("window.scrollTo(0,document.documentElement.scrollHeight)");
    assert(await evaluate("document.querySelector('.rosary-prayer .bilingual-text').getBoundingClientRect().bottom <= document.querySelector('.rosary-controls').getBoundingClientRect().top"), "closing final lines clear the controls");
    await checkLayout(width, `closing bottom@${width}`, true);
    await click(".rosary-controls button:last-child");
    assert(await evaluate("document.querySelector('.rosary-controls button:last-child').disabled"));
    assert.equal(await evaluate("document.querySelector('progress').value"), 61);
    await click(".rosary-controls button:first-child");
    await canonical("salve-regina");
    await click(".rosary-controls button:first-child");
    await canonical("glory-be");
    results.push(`/rosary selection + prayer + closing + sources + final-line clearance + reversal @${width}x${height} passed`);
    console.log(results.at(-1));
  }
  // Full interactive five-decade sequence; exact data, counters and all transitions.
  await dimensions(375,812);
  await navigate("/rosary");
  await new Promise(resolve => setTimeout(resolve, 300));
  await click(".rosary-opening-option input");
  await click(".rosary-start");
  for (let index=0; index<60; index++) {
    assert.equal(await evaluate("Number(document.querySelector('.rosary-current').dataset.step)"), index);
    const within = index % 12;
    const id = within === 0 ? "lords-prayer" : within === 11 ? "glory-be" : "ave-maria";
    await canonical(id);
    assert(await evaluate(`document.querySelector('.rosary-orientation').textContent.includes('第${Math.floor(index/12)+1}の黙想 / 5')`));
    if (within>=1 && within<=10) assert.equal(await evaluate("document.querySelector('.rosary-count').textContent"), `${within} / 10`);
    assert.equal(await evaluate("document.querySelector('progress').value"), index);
    await click(".rosary-controls button:last-child");
  }
  await canonical("salve-regina");
  assert.equal(await evaluate("document.querySelector('.rosary-current').dataset.step"), "60");
  await click(".rosary-controls button:last-child");
  assert(await evaluate("document.querySelector('.rosary-current h2').textContent.includes('終わりました')"));
  assert(await evaluate("document.querySelector('.rosary-controls button:last-child').disabled"));
  assert.equal(await evaluate("document.querySelector('progress').value"), 61);
  await click(".rosary-controls button:first-child");
  assert.equal(await evaluate("document.querySelector('.rosary-current').dataset.step"), "60");
  await canonical("salve-regina");
  await click(".rosary-controls button:first-child");
  assert.equal(await evaluate("document.querySelector('.rosary-current').dataset.step"), "59");
  await canonical("glory-be");
  await click(".rosary-controls button:first-child");
  await canonical("ave-maria");
  assert.equal(await evaluate("document.querySelector('.rosary-count').textContent"), "10 / 10");
  results.push("Full 61-step interaction, 60 decade steps, Salve closing, all counters, completion and Previous reversal passed");
  // Keyboard: real Tab focus, visible focus style, Enter activation.
  await navigate("/rosary");
  await evaluate("document.querySelector('.mystery-choices button').focus()");
  await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  assert(await evaluate("document.activeElement===document.querySelectorAll('.mystery-choices button')[1]"));
  assert(await evaluate("parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=3"));
  await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
  await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await pause();
  assert(await evaluate("document.querySelectorAll('.mystery-choices button')[1].getAttribute('aria-pressed')==='true'"));
  await click(".rosary-start");
  assert.equal(await evaluate("document.querySelector('progress').max"), 68);
  await canonical("sign-of-cross");
  await evaluate("document.querySelector('.rosary-controls button:last-child').focus()");
  await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
  await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await pause();
  await canonical("apostles-creed");
  await click(".rosary-outline button");
  await click(".rosary-start");
  assert.equal(await evaluate("document.querySelector('.rosary-current').dataset.step"), "1");
  await evaluate(`(async () => {
    while(Number(document.querySelector('.rosary-current').dataset.step)<67) {
      document.querySelector('.rosary-controls button:last-child').click();
      await new Promise(r=>setTimeout(r,30));
    }
  })()`);
  await canonical("salve-regina");
  await evaluate("document.querySelector('.rosary-controls button:last-child').focus()");
  await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
  await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await pause();
  assert.equal(await evaluate("document.querySelector('progress').value"), 68);
  await evaluate("document.querySelector('.rosary-controls button:first-child').focus()");
  await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
  await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await pause();
  await canonical("salve-regina");
  results.push("Keyboard Tab/Enter, visible focus, sourced opening and in-session resume passed");
  const manifest = JSON.parse(fs.readFileSync(".next/prerender-manifest.json","utf8"));
  assert(manifest.routes["/rosary"]);
  for(const prayer of prayers) assert(manifest.routes["/prayers/"+prayer.id]);
  fs.writeFileSync(".next/task11-browser-results.json",JSON.stringify(results,null,2));
  console.log(results.join("\n"));
} finally {
  await call("Browser.close");
  socket.close();
}
