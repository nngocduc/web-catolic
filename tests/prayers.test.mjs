import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadTypeScript } from "./load-typescript.mjs";

const { prayers, getPrayer } = loadTypeScript("src/content/prayers.ts");
const expansionIds = [
  "act-of-contrition",
  "prayer-for-forgiveness",
  "act-of-faith",
  "act-of-hope",
  "act-of-love",
];

test("faith and repentance tranche has five stable, unique canonical identities", () => {
  const allIds = prayers.map(prayer => prayer.id);
  assert.equal(new Set(allIds).size, allIds.length);
  for (const id of expansionIds) {
    assert(getPrayer(id), `Missing canonical prayer ${id}`);
    assert.equal(getPrayer(id).category, "faith");
  }
  assert.deepEqual(prayers.filter(prayer => prayer.category === "faith").map(prayer => prayer.id), expansionIds);
});

test("new canonical records retain distinct source scopes and reuse limitations", () => {
  for (const prayer of expansionIds.map(getPrayer)) {
    assert.equal(prayer.status, "unverified");
    assert.equal(prayer.availability.status, "unavailable");
    assert.equal(prayer.text, undefined);
    assert.equal(prayer.blocks, undefined);
    assert(prayer.sources.some(source => source.appliesTo === "identity" && source.url.includes("cbcj.catholic.jp")));
    assert(prayer.sources.every(source => source.reproductionNote), `${prayer.id} has an undocumented reuse basis`);
  }
  assert(getPrayer("act-of-faith").sources.some(source => source.appliesTo === "vi" && source.reference.includes("Kinh Tin")));
  assert(getPrayer("act-of-hope").sources.some(source => source.appliesTo === "vi" && source.reference.includes("Kinh Cậy")));
  assert(getPrayer("act-of-love").sources.some(source => source.appliesTo === "vi" && source.reference.includes("Kinh Kính Mến")));
  assert(!getPrayer("prayer-for-forgiveness").sources.some(source => source.appliesTo === "vi"));
});

test("library groups new prayers and detail UI renders honest unavailable content", () => {
  const list = fs.readFileSync("src/app/prayers/page.tsx", "utf8");
  const renderer = fs.readFileSync("src/components/prayer-content.tsx", "utf8");
  const detail = fs.readFileSync("src/app/prayers/[slug]/page.tsx", "utf8");
  assert(list.includes('faith: "信仰と回心の祈り"'));
  assert(renderer.includes('className="prayer-unavailable"'));
  assert(renderer.includes('role="status"'));
  assert(detail.includes("<PrayerContent prayer={prayer} />"));
  assert(!renderer.includes("本文未収録"), "developer placeholder leaked into ordinary UI");
});
