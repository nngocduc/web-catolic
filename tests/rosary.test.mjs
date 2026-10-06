import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { loadTypeScript } from "./load-typescript.mjs";

const { mysterySets, decadeSequence, openingSequence, closingSequence } = loadTypeScript("src/content/rosary.ts");
const { buildRosarySteps, expandReferences, moveRosaryStep, validateMysterySets } = loadTypeScript("src/domain/rosary.ts");
const { prayers } = loadTypeScript("src/content/prayers.ts");
const { validatePrayers } = loadTypeScript("src/content/validate-prayers.ts");

test("four unique mystery sets, five complete bilingual themes each", () => {
  validateMysterySets(mysterySets);
  assert.equal(mysterySets.length, 4);
  for (const set of mysterySets) {
    assert.equal(set.mysteries.length, 5);
    assert.equal(set.status, "unverified");
    for (const mystery of set.mysteries) {
      assert(mystery.title.ja && mystery.title.reading && mystery.title.vi);
    }
    assert(set.sources.some(source => source.appliesTo === "ja" && source.url.includes("pauline.or.jp")));
    assert(set.sources.some(source => source.appliesTo === "reading"));
    assert(set.sources.some(source => source.appliesTo === "vi"));
  }
  assert.throws(() => validateMysterySets(mysterySets.slice(1)), /four/);
  assert.throws(() => validateMysterySets([...mysterySets.slice(0, 3), mysterySets[0]]), /four/);
  assert.throws(() => validateMysterySets([{...mysterySets[0], mysteries: []}, ...mysterySets.slice(1)]), /five/);
});

test("every decade is 1 Our Father, 10 Ave Maria, 1 Glory Be, in order", () => {
  assert.deepEqual(decadeSequence, [{prayerId:"lords-prayer", repeat:1}, {prayerId:"ave-maria", repeat:10}, {prayerId:"glory-be", repeat:1}]);
  for (const set of mysterySets) {
    const steps = buildRosarySteps(set, false);
    assert.equal(steps.length, 61);
    assert.equal(steps.filter(step => step.phase === "decade").length, 60);
    for (let mystery = 0; mystery < 5; mystery++) {
      const decade = steps.filter(step => step.mysteryIndex === mystery);
      assert.equal(decade.length, 12);
      assert.deepEqual(decade.map(step => step.prayerId), ["lords-prayer", ...Array(10).fill("ave-maria"), "glory-be"]);
      assert.deepEqual(decade.slice(1, 11).map(step => step.repetition), [1,2,3,4,5,6,7,8,9,10]);
      assert(decade.slice(1, 11).every(step => step.repeat === 10));
    }
  }
});

test("optional sourced opening produces seven steps then five decades and closing", () => {
  const steps = buildRosarySteps(mysterySets[0]);
  assert.equal(steps.length, 68);
  assert.deepEqual(steps.slice(0, 7).map(step => step.prayerId), ["sign-of-cross", "apostles-creed", "lords-prayer", "ave-maria", "ave-maria", "ave-maria", "glory-be"]);
  assert(steps.slice(0, 7).every(step => step.phase === "opening" && step.mysteryIndex === undefined));
  assert.equal(steps[7].mysteryIndex, 0);
});

test("next/previous boundaries, decade transitions, completion and reversal", () => {
  for (const opening of [false, true]) {
    const steps = buildRosarySteps(mysterySets[0], opening);
    assert.equal(moveRosaryStep(0, -1, steps.length), 0);
    let index = 0;
    for (; index < steps.length; index++) assert.equal(moveRosaryStep(index, 1, steps.length), index + 1);
    assert.equal(moveRosaryStep(index, 1, steps.length), steps.length);
    for (; index > 0; index--) assert.equal(moveRosaryStep(index, -1, steps.length), index - 1);
    const offset = opening ? 7 : 0;
    assert.equal(steps[offset + 10].repetition, 10);
    assert.equal(steps[offset + 11].prayerId, "glory-be");
    assert.equal(steps[offset + 12].mysteryIndex, 1);
    assert.equal(steps.at(-2).prayerId, "glory-be");
    assert.equal(steps.at(-2).mysteryIndex, 4);
    assert.equal(steps.at(-1).prayerId, "salve-regina");
    assert.equal(steps.at(-1).phase, "closing");
    assert.equal(steps.at(-1).mysteryIndex, undefined);
  }
});

test("nonpositive, fractional, nonfinite repeats and missing references fail", () => {
  for (const repeat of [0, -1, 1.5, NaN, Infinity]) {
    assert.throws(() => expandReferences([{prayerId:"ave-maria", repeat}]), /repeat/);
  }
  assert.throws(() => expandReferences([{prayerId:"unknown", repeat:1}]), /Unknown/);
  assert.throws(() => buildRosarySteps({...mysterySets[0], mysteries:[]}), /five/);
});

test("composition repetition shares validation; original Angelus still resolves three Ave Marias", () => {
  validatePrayers(prayers);
  const angelus = prayers.find(prayer => prayer.id === "angelus");
  assert.equal(angelus.blocks.filter(block => block.kind === "prayer" && block.prayerId === "ave-maria").length, 3);
  for (const repeat of [0, -1]) assert.throws(() => validatePrayers([...prayers, {...angelus, id:"test", blocks:[{id:"ref",kind:"prayer",prayerId:"ave-maria",repeat}]}]), /repeat/);
  validatePrayers([...prayers, {...angelus, id:"test", blocks:[{id:"ref",kind:"prayer",prayerId:"ave-maria",repeat:2}]}]);
  assert.throws(() => validatePrayers([...prayers, {...angelus, id:"test", blocks:[{id:"ref",kind:"prayer",prayerId:"missing"}]}]), /Unknown/);
});

test("Rosary data and expanded steps never store canonical prayer bodies", () => {
  const data = JSON.stringify({ mysterySets, decadeSequence, openingSequence, closingSequence, steps:buildRosarySteps(mysterySets[0]) });
  for (const id of ["lords-prayer", "ave-maria", "glory-be", "salve-regina"]) {
    const prayer = prayers.find(prayer => prayer.id === id);
    for (const text of Object.values(prayer.text)) assert(!data.includes(JSON.stringify(text).slice(1,-1)), id);
  }
});

test("all ten complete prayer record hashes are preserved", () => {
  const expected = {
    "lords-prayer":"982004ff63337a945e6868940b54ebf426df10663d713398d147c2fa8257e282",
    "ave-maria":"5ffd5f08bf411cf730613f7a6190a54a451cb73005fc99b91d2b227fc1d632c7",
    "glory-be":"85bd7a2f3d83a0f5df5be5c382bce7f147afea6e9f06b8d6d7cf2ec0efd2d4a5",
    "sign-of-cross":"5cd9733ce7eda02a83fd78973d36898a2a68d59cfed6b72bb3debcf8f1e683e5",
    "apostles-creed":"a5f5672a6e490891928c5249c8c941add20c9fb93617c3d448e8a5c1bde8020c",
    "prayer-before-meals":"7157c0f05a0264f1d89a7bbe3e62e6bb8553b9e121e65bc7233c5ca3ec315d20",
    "prayer-after-meals":"0f7e8937f9d47e927da9d57cac19f9f92a61e5d9082700293361de823557e5e0",
    "angelus":"39986dd9ff2eedafa0ff87d96f0e8571d65c7806e1d3dc14813f0c96dc5cb884",
    "regina-caeli":"376e1ae766e53fb7d666ed1a381bd1d98f58d035d242f58931532415d28ff0ea",
    "salve-regina":"a1d53c1d8b580263bb019a1448454c54ba9f22eb66776a07c7b0389c69344216",
  };
  const hash = data => crypto.createHash("sha256").update(data).digest("hex");
  assert.equal(prayers.length, 10);
  for (const [id, expectedHash] of Object.entries(expected)) {
    assert.equal(hash(JSON.stringify(prayers.find(prayer => prayer.id === id))), expectedHash, id);
  }
});

test("unknown PrayerId fails compile-time for both Rosary and composite references", () => {
  const filename = path.resolve("__rosary_reference_typecheck__.ts");
  const normalize = file => file.replaceAll("\\", "/");
  const source = `import type { RosaryReference } from './src/content/rosary';
import type { PrayerId } from './src/content/prayers';
import type { PrayerBlock } from './src/content/types';
const valid: RosaryReference = {prayerId:'ave-maria',repeat:10};
const validClosing: RosaryReference = {prayerId:'salve-regina',repeat:1};
const invalid: RosaryReference = {prayerId:'unknown',repeat:10};
const invalidBlock: PrayerBlock<PrayerId> = {id:'bad',kind:'prayer',prayerId:'unknown',repeat:2};`;
  const options = { noEmit:true, strict:true, skipLibCheck:true, target:ts.ScriptTarget.ES2020, module:ts.ModuleKind.CommonJS };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (file, ...rest) => normalize(file) === normalize(filename) ? ts.createSourceFile(file, source, options.target, true) : original(file,...rest);
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([filename], options, host));
  assert.equal(diagnostics.length, 2);
  assert(diagnostics.every(diagnostic => diagnostic.code === 2322));
});

test("one unique Salve Regina with scoped sources and aligned kana", () => {
  assert.equal(prayers.length, 10);
  assert.equal(new Set(prayers.map(prayer => prayer.id)).size, 10);
  for (const prayer of prayers) assert.match(prayer.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const salve = prayers.find(prayer => prayer.id === "salve-regina");
  assert.equal(salve.category, "marian");
  assert.equal(salve.status, "unverified");
  assert.equal(salve.title.vi, "Kinh Lạy Nữ Vương");
  assert.deepEqual(salve.sources.map(source => source.appliesTo), ["ja", "reading", "vi"]);
  assert(salve.sources[0].url.includes("saitama.catholic.jp"));
  assert(salve.context.source.url.includes("cbcj.catholic.jp"));
  assert.equal(salve.text.ja.split("\n").length, 9);
  assert.equal(salve.text.reading.split("\n").length, 9);
  assert.deepEqual(salve.text.ja.split("\n").map(line => !line), salve.text.reading.split("\n").map(line => !line));
});

test("closing reference, 61/68 totals, final Glory Be/Salve/completion transitions in both directions", () => {
  assert.deepEqual(closingSequence, [{prayerId:"salve-regina",repeat:1}]);
  for (const set of mysterySets) {
    for (const opening of [false, true]) {
      const steps = buildRosarySteps(set, opening);
      assert.equal(steps.length, opening ? 68 : 61);
      const lastGlory = steps.length - 2;
      const closing = moveRosaryStep(lastGlory, 1, steps.length);
      assert.equal(steps[lastGlory].prayerId, "glory-be");
      assert.equal(steps[lastGlory].mysteryIndex, 4);
      assert.equal(steps[closing].prayerId, "salve-regina");
      assert.equal(steps[closing].phase, "closing");
      assert.equal(steps[closing].mysteryIndex, undefined);
      const complete = moveRosaryStep(closing, 1, steps.length);
      assert.equal(complete, steps.length);
      assert.equal(steps[complete], undefined);
      assert.equal(moveRosaryStep(complete, -1, steps.length), closing);
      assert.equal(moveRosaryStep(closing, -1, steps.length), lastGlory);
    }
  }
});

test("four mystery sets, twenty themes/provenance, opening and decade definitions unchanged", () => {
  const hash = data => crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  assert.equal(hash(mysterySets), "0febea5de9696502a6a97fb2c300cf563a540a2fafcbabf67b7deecf4fa99a2a");
  assert.equal(hash(openingSequence), "e21c4667098cb7eb8e8080438c4a3b76da30c1e83dcf2949d8ad41d7d7f5b687");
  assert.equal(hash(decadeSequence), "14b316d6d044ee42649fd5b611f5ef214a75315fa0755ef41b5dbd460309e46b");
});
