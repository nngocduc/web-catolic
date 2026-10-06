import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { loadTypeScript } from "./load-typescript.mjs";

const { massOrder } = loadTypeScript("src/content/mass.ts");
const { eucharisticPrayers, eucharisticPrayerIds } = loadTypeScript("src/content/eucharistic-prayers.ts");
const { massPrayerVariants } = loadTypeScript("src/content/mass-prayer-variants.ts");
const { massSectionLabels } = loadTypeScript("src/content/mass-labels.ts");
const { validateMass, massSpeakerLabel } = loadTypeScript("src/domain/mass.ts");
const { validateEucharisticPrayers } = loadTypeScript("src/domain/eucharistic-prayers.ts");
const { prayers, getPrayer } = loadTypeScript("src/content/prayers.ts");
const topBlocks=order=>order.sections.flatMap(section=>section.subsections.flatMap(part=>part.blocks));
const walk=order=>topBlocks(order).flatMap(block=>block.kind==="choice"?[block,...block.options.flatMap(option=>option.blocks)]:[block]);
const findBlock=(order,id)=>walk(order).find(block=>block.id===id);
const findChoice=(order,id)=>walk(order).find(block=>block.kind==="choice"&&block.choiceId===id);
const cloneWith=(id,changes)=>{const order=structuredClone(massOrder);Object.assign(findBlock(order,id),changes);return order;};

test("opening section order, CBCJ structure, incomplete state and variable Collect",()=>{
  validateMass(massOrder,{},massPrayerVariants);
  assert.deepEqual(massOrder.sections.map(section=>section.id),["introductory","word","eucharist","communion","concluding"]);
  assert.deepEqual(massOrder.sections[0].subsections.map(part=>part.id),["entrance","opening-sign","greeting","penitential","opening-proper"]);
  assert.equal(massSectionLabels.communion.within,"eucharist");
  assert.equal(massOrder.status,"partial");
  assert.equal(findBlock(massOrder,"collect-slot").kind,"variable");
  assert(!findBlock(massOrder,"collect-slot").text);
  const openingBeforeTask21=structuredClone(massOrder.sections[0]);
  openingBeforeTask21.subsections.find(part=>part.id==="penitential").blocks=openingBeforeTask21.subsections.find(part=>part.id==="penitential").blocks.filter(block=>block.id!=="gloria-body-unavailable");
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(openingBeforeTask21)).digest("hex"),"5ec2c3a7f157dd5ef077fabb63df7aa53c6f58f87bbbe998d40ac1d695d28d64","Task 12 opening preserved outside the scoped Gloria addition");
});

test("Word liturgy follows CBCJ order with fixed responses separated from variable readings",()=>{
  const word=massOrder.sections.find(section=>section.id==="word");
  assert.deepEqual(word.subsections.map(part=>part.id),["first-reading","responsorial-psalm","second-reading","gospel-acclamation","gospel-reading","homily","profession-of-faith","universal-prayer"]);
  assert.equal(findBlock(massOrder,"first-reading-slot").slot,"first-reading");
  assert.equal(findBlock(massOrder,"first-reading-slot").speaker,"reader");
  assert.equal(findBlock(massOrder,"first-reading-word-of-god").text.ja,"神のみことば。");
  assert.equal(findBlock(massOrder,"first-reading-thanks-to-god").text.ja,"神に感謝。");
  assert.equal(findBlock(massOrder,"second-reading-slot").kind,"variable");
  assert.match(massOrder.sections.find(section=>section.id==="word").subsections.find(part=>part.id==="second-reading").title.ja,/行われる場合/);
  assert.match(findBlock(massOrder,"second-reading-condition").text.ja,/第二朗読が行われる場合/);
  assert(!findBlock(massOrder,"first-reading-slot").text);
});

test("Gift preparation through the Preface/Sanctus transition follows CBCJ order and stops before the Eucharistic Prayer bodies",()=>{
  const eucharist=massOrder.sections.find(section=>section.id==="eucharist");
  assert.deepEqual(eucharist.subsections.map(part=>part.id),["gift-preparation","prayer-over-offerings","eucharistic-prayer-transition"]);
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(eucharist.subsections[0])).digest("hex"),"4f2d967f1e56cb5e1e7713f46a11efe04d787be1eb682c46ccd13d38bef9d5bf","Task 14 gift preparation unchanged");
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(eucharist.subsections[1])).digest("hex"),"c9d61d5ef53079381ef380bb76ee1795ea1b223635871b1b9b063f1fc4aade88","Task 14 prayer over offerings unchanged");
  assert.equal(findBlock(massOrder,"offerings-prayer-slot").slot,"prayer-over-offerings");
  assert.equal(findBlock(massOrder,"preface-slot").slot,"preface");
  assert(!findBlock(massOrder,"offerings-prayer-slot").text);
  assert(!findBlock(massOrder,"preface-slot").text);
  assert.deepEqual(findChoice(massOrder,"bread-presentation-mode").options.map(option=>option.id),["bread-quiet","bread-audible"]);
  assert.deepEqual(findChoice(massOrder,"wine-presentation-mode").options.map(option=>option.id),["wine-quiet","wine-audible"]);
  for(const id of ["bread-offering-response","wine-offering-response"]) {
    const response=findBlock(massOrder,id);
    assert.equal(response.speaker,"congregation");
    assert.equal(response.optional,true);
    assert.deepEqual(response.sources.map(source=>source.appliesTo),["ja","reading","vi"]);
  }
  assert.deepEqual(findBlock(massOrder,"water-and-wine-prayer").speaker.oneOf,["deacon","priest"]);
  for(const id of ["bread-quiet-rubric","wine-quiet-rubric","offering-bow-rubric","washing-hands-rubric","invitation-stand-rubric","prayer-over-offerings-silence","sanctus-rubric"]) {
    assert.equal(findBlock(massOrder,id).origin,"liturgical",id);
  }
  assert.equal(findBlock(massOrder,"offering-bow-prayer").speaker,"priest");
  assert.equal(findBlock(massOrder,"washing-hands-prayer").speaker,"priest");
  assert.equal(findBlock(massOrder,"prayer-over-offerings-invitation").speaker,"priest");
  assert.equal(findBlock(massOrder,"prayer-over-offerings-response").speaker,"congregation");
  assert.equal(findBlock(massOrder,"offerings-prayer-amen").text.ja,"アーメン。");
  assert.equal(findBlock(massOrder,"sanctus").text.ja,"聖なる、聖なる、聖なる神、すべてを治める神なる主。\n主の栄光は天地に満つ。\n天には神にホザンナ。\n主の名によって来られるかたに賛美。\n天には神にホザンナ。");
  assert(findBlock(massOrder,"sanctus").sources[0].reference.includes("印刷頁10"));
  assert.equal(findBlock(massOrder,"eucharistic-prayer-selector").kind,"eucharistic-prayer-selector");
  assert.equal(eucharist.subsections[2].blocks.at(-1).id,"eucharistic-prayer-selector");
  assert.equal(crypto.createHash("sha256").update(JSON.stringify({...eucharist.subsections[2],blocks:eucharist.subsections[2].blocks.slice(0,-1)})).digest("hex"),"364ddbfc67cc3d56371d5c26abc42953cddc1df7cdbab40872a51f4e2f93be2f","Task 14 transition content preserved before the selection UI");
  assert.equal(massOrder.sections[0].subsections.at(-1).id,"opening-proper");
  const word=massOrder.sections.find(section=>section.id==="word");
  const wordWithoutTask20Heading=structuredClone(word);
  wordWithoutTask20Heading.subsections.find(part=>part.id==="second-reading").title={ja:"第二朗読",reading:"だいにろうどく",vi:"Bài đọc II"};
  const creedChoice=wordWithoutTask20Heading.subsections.find(part=>part.id==="profession-of-faith").blocks.find(block=>block.id==="creed-choice");
  creedChoice.options.find(option=>option.id==="nicene-creed").blocks=[{
    id:"nicene-not-included",kind:"rubric",origin:"editorial",status:"sample",
    text:{ja:"この固定式文はまだ収録していません。未収録は省略の指示ではありません。",vi:"Bản văn cố định này chưa được đưa vào; việc chưa có nội dung không có nghĩa là bỏ qua."},
  }];
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(wordWithoutTask20Heading)).digest("hex"),"bf4ed4f4ec9ccbd21179af674e1dc5ba27bffc6cf42515787ba61c984e5398ac","Task 13 content preserved outside the scoped Nicene availability addition");
});

test("four Eucharistic Prayer identities are stable, explicit, and all currently unpopulated with no default",()=>{
  validateEucharisticPrayers(eucharisticPrayers);
  assert.deepEqual(eucharisticPrayerIds,["eucharistic-prayer-i","eucharistic-prayer-ii","eucharistic-prayer-iii","eucharistic-prayer-iv"]);
  assert.deepEqual(eucharisticPrayers.map(form=>form.title),["第一奉献文（ローマ典文）","第二奉献文","第三奉献文","第四奉献文"]);
  assert(eucharisticPrayers.every(form=>form.contentState==="unpopulated"&&form.sections.length===0));
  const second=eucharisticPrayers.find(form=>form.id==="eucharistic-prayer-ii");
  assert.equal(second.sources[0].url,"https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf");
  assert.match(second.sources[0].reference,/印刷頁17–20/);
  assert.match(second.sources[0].reference,/PDF頁16–19/);
  assert.deepEqual(second.structure.memorialAcclamationOptions,["memorial-acclamation-1","memorial-acclamation-2","memorial-acclamation-3"]);
  assert.equal(second.structure.optionalMemorialMassInsertion,true);
  assert.deepEqual(second.structure.contextualVariables,["pope-name","bishop-name","deceased-name"]);
  assert.equal(findBlock(massOrder,"eucharistic-prayer-selector").kind,"eucharistic-prayer-selector");
  assert.match(fs.readFileSync("src/components/eucharistic-prayer-selector.tsx","utf8"),/useState<EucharisticPrayerId \| null>\(null\)/);
  assert.match(fs.readFileSync("src/components/eucharistic-prayer-selector.tsx","utf8"),/disabled=\{!available\}/);
  assert.match(fs.readFileSync("src/components/eucharistic-prayer-selector.tsx","utf8"),/definition\?\.contentState === "available"/);
  assert(!Object.hasOwn(second,"defaultSelection"));
  assert.throws(()=>validateEucharisticPrayers(eucharisticPrayers.map(form=>form.id==="eucharistic-prayer-iii"?{...form,id:"eucharistic-prayer-ii"}:form)),/Unknown\/duplicate/);
  assert.throws(()=>validateEucharisticPrayers(eucharisticPrayers.map(form=>form.id==="eucharistic-prayer-ii"?{...form,sections:[{id:"unavailable-body",title:"test",headingOrigin:"editorial",blocks:[{}]}]}:form)),/availability\/body mismatch/);
});

test("Communion rite follows CBCJ order, distinguishes unavailable formulae from responses and keeps proper content variable",()=>{
  const communion=massOrder.sections.find(section=>section.id==="communion");
  assert.deepEqual(communion.subsections.map(section=>section.id),[
    "communion-transition","communion-lords-prayer","communion-church-peace-prayer","communion-peace-greeting",
    "communion-fraction","communion-priest-preparation","communion-invitation","communion-priest-reception","communion-distribution","communion-purification","communion-after-silence",
  ]);
  const unavailable=walk(massOrder).filter(block=>block.kind==="unavailable");
  assert(unavailable.length>10);
  assert(unavailable.every(block=>block.status==="unverified"&&block.sources.some(source=>source.appliesTo==="ja")));
  assert(unavailable.every(block=>block.sources.some(source=>source.appliesTo==="vi")));
  const prayerReference=findBlock(massOrder,"lords-prayer-mass-communion-reference");
  const variant=massPrayerVariants[prayerReference.variantId];
  assert.equal(variant.prayerId,"lords-prayer");
  assert.equal(variant.context,"mass-communion");
  assert.equal(variant.contentState,"unpopulated");
  assert.deepEqual(variant.blocks,[]);
  assert.equal(findBlock(massOrder,"lords-prayer-embolism-unavailable").speaker,"priest");
  assert.equal(findBlock(massOrder,"lords-prayer-congregation-conclusion").speaker,"congregation");
  assert.deepEqual(findBlock(massOrder,"peace-exchange-invitation").speaker.oneOf,["deacon","priest"]);
  assert(findBlock(massOrder,"peace-exchange-action").condition);
  assert.deepEqual(findBlock(massOrder,"lamb-of-god-unavailable").repeat,{rule:"while-fraction-in-progress",endsWith:"peace-invocation"});
  assert.equal(findBlock(massOrder,"communion-response-choice").options.length,2);
  assert.equal(findBlock(massOrder,"communion-response-choice").options[0].blocks[0].speaker,"congregation");
  const communionSpecies=findChoice(massOrder,"communion-species-form");
  assert.deepEqual(communionSpecies.options.map(option=>option.id),["communion-chalice-form","communion-both-species-form"]);
  assert.deepEqual(communionSpecies.options.map(option=>option.blocks.map(block=>block.speaker)),[["priest","communicant"],["priest","communicant"]]);
  assert.deepEqual(findBlock(massOrder,"communion-recipient-amen").sources.map(source=>source.appliesTo),["ja","reading","vi"]);
  const communionSubsections=communion.subsections;
  const communionSongSlots=walk(massOrder).filter(block=>block.kind==="variable"&&block.slot==="communion-song");
  assert.equal(communionSongSlots.length,1,"one semantic Communion song slot");
  assert.equal(communionSongSlots[0].id,"communion-song-slot");
  assert.equal(communionSubsections.findIndex(part=>part.blocks.some(block=>block.id==="communion-song-slot")),communionSubsections.findIndex(part=>part.id==="communion-priest-reception"),"song slot is at priest-reception/start boundary");
  const reception=communionSubsections.find(part=>part.id==="communion-priest-reception");
  assert.deepEqual(reception.blocks.map(block=>block.id),[
    "communion-priest-reception-boundary","communion-priest-host-reception-unavailable","communion-song-slot","communion-priest-chalice-reception-unavailable",
  ]);
  const startRubric=findBlock(massOrder,"communion-priest-reception-boundary");
  assert.equal(startRubric.kind,"rubric");
  assert.equal(startRubric.origin,"liturgical");
  assert.match(startRubric.text.ja,/拝領している間に、拝領の歌を始め/);
  assert(startRubric.sources.some(source=>source.appliesTo==="ja"&&/印刷 p\.33 \/ PDF p\.32/.test(source.reference)));
  const distribution=communionSubsections.find(part=>part.id==="communion-distribution");
  assert.equal(distribution.blocks[0].id,"communion-song-continues-during-distribution");
  assert.equal(distribution.blocks[0].kind,"rubric");
  assert.equal(distribution.blocks[0].origin,"editorial","continuation line is project explanation, not quoted CBCJ rubric");
  assert.match(distribution.blocks[0].text.ja,/この案内では.*配布中も続く/);
  assert(distribution.blocks[0].sources.some(source=>source.appliesTo==="ja"&&source.name==="プロジェクトによる案内"));
  assert(distribution.blocks.findIndex(block=>block.id==="communion-song-continues-during-distribution")<distribution.blocks.findIndex(block=>block.id==="communion-host-formula-unavailable"));
  const purification=communionSubsections.find(part=>part.id==="communion-purification");
  assert.deepEqual(purification.blocks.map(block=>block.id),["communion-vessels-purification","communion-priest-post-distribution-prayer-unavailable"]);
  assert.equal(purification.blocks[0].kind,"rubric");
  assert.equal(purification.blocks[0].origin,"liturgical");
  assert(purification.blocks[0].sources.some(source=>source.appliesTo==="ja"&&/印刷 p\.34 \/ PDF p\.33/.test(source.reference)));
  const postDistributionPrayer=findBlock(massOrder,"communion-priest-post-distribution-prayer-unavailable");
  assert.equal(postDistributionPrayer.kind,"unavailable");
  assert.equal(postDistributionPrayer.speaker,"priest");
  assert.equal(postDistributionPrayer.status,"unverified");
  assert.equal("text" in postDistributionPrayer,false,"no unavailable private prayer body is fabricated");
  const subsectionIndex=id=>communionSubsections.findIndex(part=>part.id===id);
  assert(subsectionIndex("communion-priest-reception")<subsectionIndex("communion-distribution"));
  assert(subsectionIndex("communion-distribution")<subsectionIndex("communion-purification"));
  assert(subsectionIndex("communion-purification")<subsectionIndex("communion-after-silence"));
  const afterSilence=communionSubsections.find(part=>part.id==="communion-after-silence");
  const afterSilenceIds=afterSilence.blocks.map(block=>block.id);
  assert(afterSilenceIds.indexOf("communion-silence-rubric")<afterSilenceIds.indexOf("optional-post-communion-song-slot"));
  assert(afterSilenceIds.indexOf("optional-post-communion-song-slot")<afterSilenceIds.indexOf("prayer-after-communion-slot"));
  assert(afterSilenceIds.indexOf("prayer-after-communion-slot")<afterSilenceIds.indexOf("prayer-after-communion-amen"));
  assert.equal(findBlock(massOrder,"communion-priest-host-reception-unavailable").kind,"unavailable");
  assert.equal(findBlock(massOrder,"communion-priest-chalice-reception-unavailable").kind,"unavailable");
  assert.equal(findBlock(massOrder,"communion-priest-chalice-reception-unavailable").speaker,"priest");
  for(const id of ["communion-silence-rubric","prayer-after-communion-silence"]) {
    const block=findBlock(massOrder,id);
    assert.equal(block.origin,"liturgical");
    assert(block.sources.some(source=>source.appliesTo==="ja"&&source.name.includes("中央協議会")&&/印刷 p\.34 \/ PDF p\.33/.test(source.reference)));
    assert(block.sources.some(source=>source.appliesTo==="reading"));
    assert(block.sources.some(source=>source.appliesTo==="vi"));
  }
  assert(findBlock(massOrder,"communion-priest-reception-boundary").sources.some(source=>source.appliesTo==="ja"&&/印刷 p\.33 \/ PDF p\.32/.test(source.reference)));
  assert.equal(findBlock(massOrder,"communion-song-continues-during-distribution").origin,"editorial");
  assert.equal(findBlock(massOrder,"communion-vessels-purification").origin,"liturgical");
  assert.equal(findBlock(massOrder,"optional-post-communion-song-slot").optional,true);
  assert.equal(findBlock(massOrder,"prayer-after-communion-slot").kind,"variable");
  assert.equal(findBlock(massOrder,"prayer-after-communion-amen").speaker,"congregation");
  assert(reception.blocks.filter(block=>block.kind==="unavailable").every(block=>!Object.hasOwn(block,"text")));
  assert(purification.blocks.filter(block=>block.kind==="unavailable").every(block=>!Object.hasOwn(block,"text")));
  assert.equal(findBlock(massOrder,"eucharistic-prayer-content-gap").origin,"editorial");
  assert(eucharisticPrayers.every(form=>form.contentState==="unpopulated"&&form.sections.length===0));
  assert.match(massPrayerVariants["lords-prayer-mass-communion"].sources[0].reference,/印刷頁30–31.*PDF頁29–30/);
});

test("CBCJ closing reaches an explicit end with conditional blessing forms and one-of dismissal alternatives",()=>{
  validateMass(massOrder,{},massPrayerVariants);
  const closing=massOrder.sections.find(section=>section.id==="concluding");
  assert.deepEqual(closing.subsections.map(part=>part.id),["concluding-notices","concluding-greeting","concluding-blessing","concluding-dismissal"]);
  assert.equal(findBlock(massOrder,"concluding-notices-rubric").origin,"liturgical");
  assert.deepEqual(findChoice(massOrder,"concluding-presider-greeting").options.map(option=>option.id),["concluding-priest-greeting","concluding-bishop-greeting"]);
  assert.deepEqual(findChoice(massOrder,"concluding-presider-greeting").options[1].blocks.filter(block=>block.kind==="spoken").map(block=>block.speaker),["bishop","congregation","bishop","congregation","bishop","congregation"]);
  const properBlessing=findChoice(massOrder,"concluding-proper-blessing");
  for(const choice of [findChoice(massOrder,"concluding-presider-greeting"),properBlessing,findChoice(massOrder,"concluding-dismissal-form")]) {
    assert.deepEqual(choice.sources.map(source=>source.appliesTo),["ja","reading","vi"]);
  }
  assert.deepEqual(properBlessing.options.map(option=>option.id),["concluding-no-proper-blessing","concluding-solemn-blessing","concluding-prayer-over-people"]);
  assert.deepEqual(properBlessing.options.map(option=>option.blocks.map(block=>block.kind==="variable"?block.slot:block.id)),[["concluding-no-proper-blessing-guidance"],["solemn-blessing"],["prayer-over-the-people"]]);
  assert(!Object.hasOwn(properBlessing,"defaultSelection"));
  assert.match(properBlessing.options[0].condition.ja,/通常の場合/);
  assert.equal(properBlessing.options[0].blocks[0].origin,"editorial");
  assert.equal(findBlock(massOrder,"concluding-blessing-formula").speaker.oneOf.join(","),"priest,bishop");
  assert.equal(findBlock(massOrder,"concluding-blessing-response").speaker,"congregation");
  const dismissal=findChoice(massOrder,"concluding-dismissal-form");
  assert.equal(dismissal.options.length,3);
  assert(dismissal.options.every(option=>option.blocks.length===1&&option.blocks[0].speaker.oneOf.join(",")==="deacon,priest"));
  assert.equal(findBlock(massOrder,"concluding-dismissal-response").speaker,"congregation");
  const dismissalSubsection=closing.subsections.find(part=>part.id==="concluding-dismissal");
  assert.equal(dismissalSubsection.blocks[0].id,"concluding-following-rite-rubric","following-rite condition precedes the dismissal group");
  assert.equal(dismissalSubsection.blocks[0].origin,"liturgical");
  assert.equal(findBlock(massOrder,"concluding-departure-rubric").origin,"liturgical");
  assert.equal(findBlock(massOrder,"concluding-end-marker").origin,"editorial");
  assert.equal(massOrder.status,"partial");
  assert(eucharisticPrayers.every(form=>form.contentState==="unpopulated"&&form.sections.length===0));
  const closingPassages=walk(massOrder).filter(block=>block.kind==="spoken"&&block.id.startsWith("concluding-"));
  assert(closingPassages.length>0);
  for(const passage of closingPassages) {
    assert.equal(passage.status,"unverified");
    assert(passage.sources.some(source=>source.appliesTo==="ja"&&source.url==="https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf"));
    assert(passage.sources.some(source=>source.appliesTo==="reading"));
    assert(passage.sources.some(source=>source.appliesTo==="vi"));
  }
  assert.equal(findBlock(massOrder,"concluding-solemn-blessing-slot").slot,"solemn-blessing");
  assert.equal(findBlock(massOrder,"concluding-prayer-over-people-slot").slot,"prayer-over-the-people");
});

test("closing alternatives and typed slots reject malformed IDs and roles",()=>{
  assert.throws(()=>validateMass(cloneWith("concluding-dismissal-choice",{choiceId:"bad id"}),{},massPrayerVariants),/choice/);
  assert.throws(()=>validateMass(cloneWith("concluding-blessing-formula",{speaker:"unknown"}),{},massPrayerVariants),/speaker/);
  assert.throws(()=>validateMass(cloneWith("concluding-solemn-blessing-slot",{slot:"unlisted-blessing"}),{},massPrayerVariants),/slot/);
  assert.throws(()=>validateMass(cloneWith("concluding-dismissal-choice",{options:[{id:"same",title:"a",blocks:[{id:"a",kind:"spoken",speaker:"priest",text:{ja:"a"},status:"unverified"}]},{id:"same",title:"b",blocks:[{id:"b",kind:"spoken",speaker:"priest",text:{ja:"b"},status:"unverified"}]}]}),{},massPrayerVariants),/alternative/);
});

test("Eucharistic Prayer validator accepts a future sourced body with ordered sections, roles, names, conditions and acclamation choices",()=>{
  const ja={appliesTo:"ja",name:"CBCJ test fixture",url:"https://example.test/ja"};
  const reading={appliesTo:"reading",name:"Project test fixture"};
  const vi={appliesTo:"vi",name:"Project test fixture"};
  const sources=[ja,reading,vi];
  const spoken=(id,speaker,jaText)=>({id,kind:"spoken",speaker,text:{ja:jaText,reading:"かな",vi:"Hỗ trợ"},status:"unverified",sources});
  const fixture=structuredClone(eucharisticPrayers).map(form=>form.id==="eucharistic-prayer-ii"?{
    ...form,contentState:"available",sections:[{id:"test-ordered-phase",title:"テスト用区分",headingOrigin:"editorial",blocks:[
      spoken("priest-text","priest","本文テスト"),
      {id:"pope-name-slot",kind:"variable",slot:"pope-name",speaker:"priest"},
      {id:"conditional-insertion",kind:"conditional",condition:{ja:"死者のためのミサの場合",vi:"Khi cử hành lễ cầu cho người qua đời"},sources:[ja],blocks:[{id:"deceased-name-slot",kind:"variable",slot:"deceased-name",speaker:"priest",optional:true}]},
      {id:"acclamation-options",kind:"choice",choiceType:"memorial-acclamation",title:{ja:"記念唱",vi:"Tung hô tưởng niệm"},instruction:{ja:"一つを選ぶ",vi:"Chọn một"},sources:[ja],status:"unverified",options:[
        {id:"response-a",title:"応唱A",blocks:[spoken("response-a-text","congregation","応唱A")]},
        {id:"response-b",title:"応唱B",blocks:[spoken("response-b-text","all","応唱B")]},
        {id:"response-c",title:"応唱C",blocks:[spoken("response-c-text","congregation","応唱C")]},
      ]},
    ]}],
  }:form);
  assert.doesNotThrow(()=>validateEucharisticPrayers(fixture));
  const withInvalid=(mutate)=>{const value=structuredClone(fixture);mutate(value.find(form=>form.id==="eucharistic-prayer-ii"));return value;};
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.id="eucharistic-prayer-v")),/Unknown\/duplicate/);
  assert.throws(()=>validateEucharisticPrayers([...eucharisticPrayers,eucharisticPrayers[0]]),/Exactly four/);
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.sections[0].blocks[0].speaker="lector")),/speaker/);
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.sections[0].blocks[1].slot="parish-name")),/variable/);
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.sections[0].blocks[3].options=[form.sections[0].blocks[3].options[0]])),/acclamation choice/);
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.sections[0].blocks[3].options[0].blocks[0].speaker="priest")),/congregation speech/);
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.sections[0].blocks.push({...form.sections[0].blocks[0],id:"priest-text"}))),/duplicate/);
  assert.throws(()=>validateEucharisticPrayers(withInvalid(form=>form.sections[0].blocks[0].sources=[{name:"bad",appliesTo:"unknown"}])),/scope/);
});

test("Responsorial psalm values support ordered alternating ministers and responses",()=>{
  const passages=[
    {id:"psalm-verse",speaker:"psalmist",text:{ja:"[詩編の節]"},status:"sample"},
    {id:"psalm-response",speaker:"congregation",text:{ja:"[会衆の答唱]"},status:"sample"},
    {id:"psalm-verse-2",speaker:"cantor",text:{ja:"[次の節]"},status:"sample"},
    {id:"psalm-response-2",speaker:"congregation",text:{ja:"[会衆の答唱]"},status:"sample"},
  ];
  validateMass(massOrder,{"responsorial-psalm":passages},massPrayerVariants);
  assert.deepEqual(passages.map(passage=>passage.speaker),["psalmist","congregation","cantor","congregation"]);
  assert.deepEqual(findBlock(massOrder,"psalm-slot").speaker.oneOf,["psalmist","cantor"]);
});

test("Alleluia and other seasonal acclamation are explicit alternatives with separate variable slots",()=>{
  const choice=findChoice(massOrder,"gospel-acclamation-form");
  assert.deepEqual(choice.options.map(option=>option.id),["alleluia-form","other-chant-form"]);
  assert.deepEqual(choice.options.map(option=>option.blocks[0].slot),["gospel-acclamation","gospel-chant"]);
  assert.match(findBlock(massOrder,"gospel-acclamation-rubric").text.ja,/典礼季節に応じて/);
  assert(choice.sources.some(source=>source.appliesTo==="ja"&&source.url.includes("henkou2022.pdf")));
  assert(!choice.options.some(option=>option.blocks.some(block=>block.kind==="spoken")));
});

test("Gospel dialogues and variable Gospel/title use only supported ministers",()=>{
  assert.deepEqual(findBlock(massOrder,"gospel-greeting").speaker.oneOf,["deacon","priest"]);
  assert.deepEqual(findBlock(massOrder,"gospel-title-slot").speaker.oneOf,["deacon","priest"]);
  assert.deepEqual(findBlock(massOrder,"gospel-slot").speaker.oneOf,["deacon","priest"]);
  assert.equal(findBlock(massOrder,"gospel-greeting-response").speaker,"congregation");
  assert.equal(findBlock(massOrder,"gospel-glory-response").text.ja,"主に栄光。");
  assert.equal(findBlock(massOrder,"gospel-word-of-the-lord").text.ja,"主のみことば。");
  assert.equal(findBlock(massOrder,"gospel-praise-response").text.ja,"キリストに賛美。");
  assert(!findBlock(massOrder,"gospel-slot").text);
  for(const id of ["gospel-dialogue-rubric","gospel-sign-and-response-rubric","gospel-ending-rubric"]) assert.equal(findBlock(massOrder,id).origin,"liturgical");
});

test("Homily stays an empty variable passage with sourced role and no sample sermon",()=>{
  const homily=findBlock(massOrder,"homily-slot");
  assert.equal(homily.kind,"variable");
  assert.deepEqual(homily.speaker.oneOf,["priest","deacon"]);
  assert(!homily.text);
  assert.match(findBlock(massOrder,"homily-obligation").text.ja,/守るべき祝日/);
  assert.equal(findBlock(massOrder,"homily-obligation").origin,"liturgical");
});

test("Gloria is represented once at its conditional opening position without reproducing its body",()=>{
  const opening=massOrder.sections.find(section=>section.id==="introductory");
  const penitential=opening.subsections.find(part=>part.id==="penitential");
  const gloriaIndex=penitential.blocks.findIndex(block=>block.id==="gloria-body-unavailable");
  assert(gloriaIndex>penitential.blocks.findIndex(block=>block.id==="gloria-rubric"));
  const gloria=penitential.blocks[gloriaIndex];
  assert.equal(gloria.kind,"unavailable");
  assert.equal(gloria.speaker,"all");
  assert.match(gloria.condition.ja,/規定に従って/);
  assert.equal(gloria.status,"unverified");
  assert(!("text" in gloria));
  assert(gloria.sources.some(source=>source.appliesTo==="ja"&&/印刷 pp\. 3–4 \/ PDF pp\. 2–3/.test(source.reference)));
  assert.equal(penitential.blocks.filter(block=>block.id==="gloria-body-unavailable").length,1);
});

test("Creed alternatives reuse Apostles' Creed only for the same spoken formula; Nicene body remains honestly unavailable",()=>{
  const choice=findChoice(massOrder,"creed-form");
  assert.deepEqual(choice.options.map(option=>option.id),["nicene-creed","apostles-creed"]);
  assert.equal(choice.defaultOption,undefined,"no Creed is silently selected");
  const nicene=choice.options.find(option=>option.id==="nicene-creed");
  assert.deepEqual(nicene.blocks.map(block=>block.id),["nicene-body-unavailable"]);
  const niceneUnavailable=nicene.blocks[0];
  assert.equal(niceneUnavailable.kind,"unavailable");
  assert.equal(niceneUnavailable.speaker,"all");
  assert.equal(niceneUnavailable.status,"unverified");
  assert(!("text" in niceneUnavailable));
  assert(niceneUnavailable.sources.some(source=>source.appliesTo==="ja"&&/印刷 pp\. 5–7 \/ PDF pp\. 4–6/.test(source.reference)));
  assert.equal(choice.options.filter(option=>option.id==="nicene-creed").length,1);
  const apostle=findBlock(massOrder,"apostles-creed-reference");
  assert.equal(apostle.kind,"prayer");
  assert.equal(apostle.prayerId,"apostles-creed");
  assert.equal(apostle.context.purpose,"liturgical");
  assert.equal(apostle.context.status,"unverified");
  assert(apostle.context.sources.some(source=>source.appliesTo==="ja"&&source.url.includes("mass2022wLM3.pdf")));
  assert.equal(niceneUnavailable.sources.find(source=>source.appliesTo==="vi").name,"Nội dung giải thích do dự án chuẩn bị");
  const canonical=getPrayer("apostles-creed");
  const spoken=canonical.text.ja.replace("陰府（よみ）","陰府").replace("生者（せいしゃ）","生者").replace(/\s+/g,"");
  const currentMassWording="天地の創造主、全能の父である神を信じます。父のひとり子、わたしたちの主イエス・キリストを信じます。主は聖霊によってやどり、おとめマリアから生まれ、ポンティオ・ピラトのもとで苦しみを受け、十字架につけられて死に、葬られ、陰府に下り、三日目に死者のうちから復活し、天に昇って、全能の父である神の右の座に着き、生者と死者を裁くために来られます。聖霊を信じ、聖なる普遍の教会、聖徒の交わり、罪のゆるし、からだの復活、永遠のいのちを信じます。アーメン。";
  assert.equal(spoken,currentMassWording.replace(/\s+/g,""));
  const data=JSON.stringify(massOrder);
  for(const body of Object.values(canonical.text)) assert(!data.includes(body),"Mass references canonical wording without copying it");
  assert.match(findBlock(massOrder,"creed-japan-adaptation").text.ja,/典礼季節を問わず/);
});

test("Universal prayer intentions and responses remain separate variable content with sourced response/silence choices",()=>{
  assert.deepEqual(findBlock(massOrder,"intentions-slot").speaker.oneOf,["deacon","cantor","reader","lay-faithful"]);
  assert.equal(findBlock(massOrder,"intentions-invitation-slot").speaker,"priest");
  assert.equal(findBlock(massOrder,"intentions-conclusion-slot").speaker,"priest");
  assert.equal(findBlock(massOrder,"intentions-response-choice").kind,"choice");
  assert.deepEqual(findChoice(massOrder,"intentions-response-form").options.map(option=>option.id),["intention-spoken-response","intention-silent-response"]);
  assert.equal(findBlock(massOrder,"intentions-response-slot").kind,"variable");
  assert.equal(findBlock(massOrder,"intentions-amen").text.ja,"アーメン。");
  const alternatives=findChoice(massOrder,"intentions-response-form");
  assert(alternatives.sources.some(source=>source.appliesTo==="ja"&&source.url.includes("mass2022wLM3.pdf")));
  assert.equal(findBlock(massOrder,"intentions-silent-rubric").origin,"liturgical");
});

test("greetings, penitential forms and Kyrie are explicit alternatives, not normal sequential speech",()=>{
  const greeting=findChoice(massOrder,"greeting-formula");
  const penitential=findChoice(massOrder,"penitential-form");
  const kyrie=findChoice(massOrder,"kyrie-form");
  assert.equal(greeting.options.length,4); // three forms; third has a bishop-presider wording
  assert.deepEqual(greeting.options.map(option=>option.id),["greeting-first","greeting-second","greeting-third-priest","greeting-third-bishop"]);
  assert.match(greeting.options[3].condition.ja,/司教/);
  assert.equal(penitential.options.length,3);
  assert.equal(kyrie.options.length,2);
  assert.deepEqual(kyrie.when,{choiceId:"penitential-form",optionIds:["form-one","form-two"]});
  assert.match(kyrie.instruction.ja,/第三形式では省きます/);
  assert(findBlock(massOrder,"holy-water-alternative").origin==="liturgical");
  assert(findBlock(massOrder,"holy-water-not-included").origin==="editorial");
  assert.match(findBlock(massOrder,"holy-water-not-included").text.ja,/以下の招きと三形式/);
  for(const choice of [greeting,penitential,kyrie]) {
    assert(choice.instruction.ja.includes("一つ"));
    assert(choice.sources.some(source=>source.appliesTo==="ja"&&source.url.includes("mass2022wLM3.pdf")));
    assert.deepEqual(choice.sources.map(source=>source.appliesTo),["ja","reading","vi"]);
  }
  assert.equal(findChoice(massOrder,"kyrie-form").options[0].blocks[0].id,"kyrie-ja-lord-1");
});

test("Japanese speech/rubrics cite CBCJ; readings and Vietnamese support are project-prepared",()=>{
  const utterances=walk(massOrder).filter(block=>block.kind==="spoken");
  assert(utterances.length>15);
  for(const block of utterances) {
    assert.equal(block.status,"unverified",block.id);
    assert.deepEqual(block.sources.map(source=>source.appliesTo),["ja","reading","vi"],block.id);
    assert(block.sources[0].name.includes("カトリック中央協議会"),block.id);
    assert(block.sources[0].url.includes("mass2022wLM3.pdf"),block.id);
    assert.equal(block.text.ja.split("\n").length,block.text.reading.split("\n").length,block.id);
    assert.match(block.sources[1].name,/プロジェクト/);
    assert.match(block.sources[2].reference,/CBCJ/);
  }
  const rubrics=walk(massOrder).filter(block=>block.kind==="rubric");
  const official=rubrics.filter(block=>block.origin==="liturgical");
  const editorial=rubrics.filter(block=>block.origin==="editorial");
  assert(official.length>=7);
  for(const block of official) {
    assert.equal(block.status,"unverified");
    assert(block.sources.some(source=>source.appliesTo==="ja"&&(source.url.includes("mass2022wLM3.pdf")||source.url.includes("henkou2022.pdf"))));
  }
  assert(editorial.length>0);
  assert(editorial.every(block=>["sample","unverified"].includes(block.status)));
});

test("canonical Sign of the Cross remains unchanged; Mass variant preserves exact text and separates roles",()=>{
  const canonical=getPrayer("sign-of-cross");
  const variant=massPrayerVariants["sign-of-cross-mass-opening"];
  assert.equal(variant.prayerId,"sign-of-cross");
  assert.equal(variant.context,"mass-opening");
  assert.equal(variant.status,"unverified");
  assert.deepEqual(variant.sources.map(source=>source.appliesTo),["ja","reading","vi"]);
  assert.deepEqual(variant.blocks.map(segment=>segment.speaker),["priest","congregation"]);
  for(const lang of ["ja","reading","vi"]) assert.equal(variant.blocks.map(segment=>segment.text[lang]).join("\n"),canonical.text[lang],lang);
  assert.deepEqual(findBlock(massOrder,"opening-sign-prayer"),{id:"opening-sign-prayer",kind:"prayer-variant",variantId:variant.id});
  assert.equal(Object.keys(massPrayerVariants).length,2);
  assert.equal(massPrayerVariants["lords-prayer-mass-communion"].contentState,"unpopulated");
});

test("the CBCJ Sign of the Cross variant link resolves; no canonical text is trimmed or copied into Mass order",()=>{
  const reference=findBlock(massOrder,"opening-sign-prayer");
  assert.equal(massPrayerVariants[reference.variantId].prayerId,"sign-of-cross");
  const json=JSON.stringify(massOrder);
  for(const id of ["lords-prayer","ave-maria","glory-be","salve-regina"]) {
    for(const body of Object.values(getPrayer(id).text)) assert(!json.includes(JSON.stringify(body).slice(1,-1)),id);
  }
  const communion=findBlock(massOrder,"lords-prayer-mass-communion-reference");
  assert.equal(communion.kind,"prayer-variant");
  assert.equal(communion.variantId,"lords-prayer-mass-communion");
  const massForm=massPrayerVariants[communion.variantId];
  assert.equal(massForm.prayerId,"lords-prayer");
  assert.equal(massForm.context,"mass-communion");
  assert.equal(massForm.contentState,"unpopulated");
  assert.deepEqual(massForm.blocks,[]);
  assert.deepEqual(massForm.sources.map(source=>source.appliesTo),["ja","vi"]);
  assert.match(massForm.sources[0].reference,/印刷頁30–31.*PDF頁29–30/);
  assert.match(massForm.note.ja,/会衆の主の祈りの後に司祭の続き/);
  for(const file of ["src/content/mass.ts","src/content/mass-prayer-variants.ts","src/components/mass-content.tsx"]) {
    assert.doesNotMatch(fs.readFileSync(file,"utf8"),/\.(?:slice|substring)\(/,`${file} must not trim prayer text`);
  }
});

test("runtime validation rejects malformed alternatives, conditions, references, roles, sources and slots",()=>{
  const badOptions=structuredClone(massOrder), choice=findChoice(badOptions,"greeting-formula");
  choice.options=[choice.options[0],{...choice.options[1],id:choice.options[0].id}];
  assert.throws(()=>validateMass(badOptions,{},massPrayerVariants),/alternative/);
  const badCondition=structuredClone(massOrder);
  findChoice(badCondition,"kyrie-form").when.optionIds=["unknown"];
  assert.throws(()=>validateMass(badCondition,{},massPrayerVariants),/condition/);
  assert.throws(()=>validateMass(cloneWith("opening-sign-prayer",{variantId:"unknown"}),{},massPrayerVariants),/variant/);
  assert.throws(()=>validateMass(massOrder,{},{}),/variant/);
  assert.throws(()=>validateMass(cloneWith("penitential-invitation",{speaker:"unknown"}),{},massPrayerVariants),/speaker/);
  assert.throws(()=>validateMass(cloneWith("collect-slot",{slot:"unknown"}),{},massPrayerVariants),/slot/);
  assert.throws(()=>validateMass(cloneWith("greeting-choice",{sources:[{name:"bad",appliesTo:"unknown"}]}),{},massPrayerVariants),/scope/);
  assert.throws(()=>validateMass(cloneWith("lords-prayer-mass-communion-reference",{variantId:"unknown"}),{},massPrayerVariants),/variant/);
  assert.throws(()=>validateMass(massOrder,{}, {...massPrayerVariants,"invalid-lords-variant":{...massPrayerVariants["lords-prayer-mass-communion"],id:"invalid-lords-variant",prayerId:"unknown"}}),/Unknown/);
  assert.throws(()=>validateMass(massOrder,{}, {...massPrayerVariants,"bad id":{...massPrayerVariants["lords-prayer-mass-communion"],id:"bad id"}}),/variant ID/);
  assert.throws(()=>validateMass(cloneWith("communion-song-slot",{slot:"not-a-communion-slot"}),{},massPrayerVariants),/slot/);
  assert.throws(()=>validateMass(cloneWith("lamb-of-god-unavailable",{repeat:{rule:"unbounded",endsWith:"peace-invocation"}}),{},massPrayerVariants),/repetition/);
});

test("fixed roles are constrained and local variable content can be supplied without changing the page",()=>{
  const values={"responsorial-psalm":[
    {id:"psalm-response",speaker:"congregation",text:{ja:"［テスト］"},status:"sample"},
    {id:"psalm-verse",speaker:"psalmist",text:{ja:"［テスト］",vi:"[Kiểm thử]"},status:"unverified",sources:[{name:"Test",appliesTo:"vi"}]},
  ]};
  validateMass(massOrder,values,massPrayerVariants);
  assert.throws(()=>validateMass(massOrder,{unknown:values["responsorial-psalm"]},massPrayerVariants),/unknown/);
  assert.throws(()=>validateMass(massOrder,{collect:[]},massPrayerVariants),/Empty/);
  assert.equal(massSpeakerLabel("bishop").ja,"司教");
  assert.equal(massSpeakerLabel("cantor").ja,"先唱者");
});

test("compile-time checks reject invalid roles, PrayerId, variant ID, Eucharistic Prayer ID, slot and alternative structure",()=>{
  const filename=path.resolve("__mass_typecheck__.ts");
  const source=`import type { EucharisticPrayerId, MassBlock, MassOrder, MassVariableContent } from './src/content/mass-types';
import type { MassPrayerVariantId } from './src/content/mass-prayer-variants';
const reference: MassBlock<MassPrayerVariantId> = {id:'ref',kind:'prayer-variant',variantId:'sign-of-cross-mass-opening'};
const choice: MassBlock<MassPrayerVariantId> = {id:'c',kind:'choice',choiceId:'forms',title:{ja:'forms'},instruction:{ja:'choose one'},status:'unverified',options:[{id:'a',title:'A',blocks:[{id:'a-line',kind:'spoken',speaker:'priest',text:{ja:'x'},status:'unverified'}]},{id:'b',title:'B',blocks:[{id:'b-line',kind:'rubric',origin:'liturgical',text:{ja:'y'},status:'unverified'}]}]};
const order: MassOrder<MassPrayerVariantId> = {status:'partial',structureSources:[],sections:[{id:'introductory',subsections:[{id:'s',title:{ja:'s'},blocks:[reference,choice]}]}]};
const values: MassVariableContent = {collect:[{id:'v',speaker:'priest',text:{ja:'x'},status:'sample'}]};
const badRole: MassBlock = {id:'bad',kind:'spoken',speaker:'unknown',text:{ja:'x'},status:'sample'};
const badPrayer: MassBlock = {id:'bad',kind:'prayer',speaker:'all',prayerId:'unknown',context:{purpose:'liturgical',status:'unverified',note:{ja:'x'}}};
const badVariant: MassBlock<MassPrayerVariantId> = {id:'bad',kind:'prayer-variant',variantId:'unknown'};
const badSlot: MassBlock = {id:'bad',kind:'variable',slot:'unknown',speaker:'priest'};
const badChoice: MassBlock = {id:'bad',kind:'choice',choiceId:'c',title:{ja:'c'},instruction:{ja:'one'},status:'unverified',options:[{id:'only-one',title:'A',blocks:[]}]};
const badEucharisticPrayerId: EucharisticPrayerId = 'eucharistic-prayer-v';`;
  const options={noEmit:true,strict:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS};
  const host=ts.createCompilerHost(options),original=host.getSourceFile.bind(host);
  host.getSourceFile=(file,...rest)=>path.resolve(file)===filename?ts.createSourceFile(file,source,options.target,true):original(file,...rest);
  const diagnostics=ts.getPreEmitDiagnostics(ts.createProgram([filename],options,host));
  assert.equal(diagnostics.length,6,ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCurrentDirectory:()=>process.cwd(),getCanonicalFileName:file=>file,getNewLine:()=>"\n"}));
  assert(diagnostics.every(diagnostic=>path.resolve(diagnostic.file?.fileName??"")===filename));
  assert(diagnostics.every(diagnostic=>[2322,2353,2820].includes(diagnostic.code)),diagnostics.map(diagnostic=>`${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText," ")}`));
});

test("all canonical prayers and Rosary source/domain data remain unchanged",()=>{
  const hashes={
    "src/content/prayers.ts":"f880951918afebe758f6b946d286a850942d2220faf17dcf9d567c1b66c9e9dc",
    "src/content/rosary.ts":"4e64f54eb7ea4abbbefb40b9cf49896d0807a435d824a35536538e1ad358c90a",
    "src/domain/rosary.ts":"4e0cf66b3c554a5cbf75c9e9a116c76ef989b890d2504788a9a0848ee6f22173",
  };
  for(const[file,expected]of Object.entries(hashes)) assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),expected,file);
  assert.equal(prayers.length,10);
});
