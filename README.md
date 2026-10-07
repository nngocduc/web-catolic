# 祈りのとも · Nhật–Việt

A small mobile-first Catholic Japanese–Vietnamese app. Japanese is the primary language; Vietnamese supports understanding. The library contains fifteen canonical prayers: 主の祈り, アヴェ・マリアの祈り, 栄唱, 十字架のしるしと祈り, 使徒信条, 食前の祈り, 食後の祈り, お告げの祈り, アレルヤの祈り, and 元后あわれみの母（Salve Regina）, plus five faith and repentance prayers whose bodies remain unavailable until reuse permission is established. All complete bilingual prayer records remain `unverified`. The 2022 CBCJ Mass opening is partially populated; new kana and Vietnamese support remain unverified/project-prepared. Independent Vietnamese diocesan sources are recorded for the act of contrition and the faith, hope, and love prayers; reproduction permission remains unresolved.

## Development

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Before committing:

```sh
npm run lint
npm run typecheck
npm run build
npm run test
```

Next.js and React are pinned to the stable versions resolved during setup. TypeScript 6 and ESLint 9 are pinned for compatibility with the current Next.js lint plugins; revisit those pins when the plugins support newer majors. The initial npm audit reports five high-severity findings in the development-only Next.js lint chain (`braces` via `micromatch`/`fast-glob`); its suggested forced fix downgrades Next.js lint configuration to version 14 and is not applied.

## Structure

```text
src/app/                 App Router pages and global CSS
  mass/                  Ordered Mass demonstration
  prayers/               Prayer library and static [slug] detail pages
  rosary/                Dedicated guided Rosary experience
src/components/         Navigation, bilingual text, notices, prayer rendering
src/content/types.ts    Content types
src/content/prayers.ts  Single source of truth for prayers
src/content/validate-prayers.ts  Reference and ID validation
src/content/mass.ts     Incomplete Mass demonstration in the typed order
src/content/mass-types.ts   Mass-only block, role and variable-content types
src/content/mass-labels.ts  Centralized Japanese/support labels
src/content/mass-prayer-variants.ts   Explicit Mass-context forms linked to canonical prayers
src/domain/mass.ts      Mass validation and speaker-label resolution
src/content/rosary.ts   Mystery sets, provenance, opening/decade references
src/domain/rosary.ts    Pure sequence expansion, movement, validation
tests/                  Dependency-free sequence and browser checks
```

Prayer `id` is its stable URL slug and reference key. Titles contain Japanese, required kana reading, and Vietnamese. Body text contains Japanese, optional reading, and Vietnamese. Each prayer also has a category, optional bilingual pastoral notes, and structured verification/source information. The `faith` category is displayed as 信仰と回心の祈り. Body-unavailable canonical prayers use an explicit availability state and render concise Japanese and Vietnamese notices without fabricated text. The identity source scope records sources that establish a prayer name or catalog listing, not its wording. Store line breaks in strings as `\n`; the renderer preserves them.

Keep IDs unique and stable. The Mass page remains an incomplete demonstration, not a full Mass order; see the Mass foundation below.

Simple prayers retain `text` unchanged. Composite prayers instead use ordered `blocks`: either `{ id, kind: "text", text }` for local bilingual content, or `{ id, kind: "prayer", prayerId, repeat? }` to reference the library. Do not store both `text` and `blocks`. The exported array is checked as `Prayer<PrayerId>[]`, so unknown references fail TypeScript checking. Validation at module load rejects invalid/duplicate prayer IDs, duplicate block IDs, missing references, cycles, and nonpositive/noninteger repeats. Omitted `repeat` means once. Repeated references are allowed; Angelus contains exactly three unchanged `ave-maria` references and no copied Ave Maria bodies or sources. References render inline with the canonical record's own status and source disclosure, without navigation or nested cards. Rosary reuses the same small typed reference shape rather than introducing a workflow engine.

The `marian` category is displayed as 聖母の祈り. Optional `context` holds bilingual background/seasonal information and its own citation, separate from scoped body `sources`. For Angelus and Regina Caeli, Yamahana Church is the Japanese body source; the CBCJ Angelus FAQ supports only the background and Easter-season relationship. Its source is disclosed separately as 背景・季節の出典. Easter Sunday through Pentecost Sunday uses Regina Caeli instead of Angelus; there is no automatic date switching. Referenced prayer provenance belongs to the referenced record, not the composite's local text.

Meal prayers use the `daily` category, displayed as 日々の祈り. The three Task 7 Japanese blocks are the user-selected canonical project text, with their supplied provenance recorded directly. The creed retains its Japanese parenthetical readings; its separate kana block reads those words once. Meal prayer bodies are attributed to Yamahana Catholic Church. The CBCJ collection URL is recorded only as table-of-contents context, never as the source of those bodies.

## Content verification and attribution

Prayers and independent Mass text items use the same `ContentVerification` type:

- `sample`: demonstration/placeholder text, not a real prayer or liturgical text.
- `unverified`: actual candidate content whose wording, reading, translation, source, or reproduction basis still needs review. A source alone does not make it verified.
- `verified`: a human has checked the Japanese wording, kana, Vietnamese meaning, sources, and basis for reproduction. TypeScript requires at least one source entry for this status; it cannot establish authority or permission itself.

`sources` is optional for sample/unverified records and required as a nonempty array for verified records. Each entry has:

- `appliesTo`: `ja`, `vi`, `reading`, or `all`, identifying exactly what the citation supports.
- `name`: the real publication, publisher, or other identifiable source, in its original language if appropriate.
- Optional `url`: an absolute HTTP(S) source URL. Omit it when no online source exists.
- Optional `reference`: edition, page, section, or other citation details.
- Optional `reproductionNote`: documented copyright terms, attribution requirements, or reproduction permission. Its absence means nothing about copyright or permission.

Use separate entries when Japanese wording and Vietnamese translation come from different sources. Use `all` only when the source supports the entire bilingual content including the reading. Document a reviewed original translation or supplied reading honestly; do not imply a publication provides a translation it does not contain. Keep explanatory/pastoral `notes` separate from attribution. Do not invent sources, permissions, copyright claims, or prayer wording, and do not mark incomplete review as verified. An unknown reproduction basis remains `unverified`; do not publish candidate text unless its use is allowed. A verified flag is a project review state, not a claim of ecclesiastical approval. There are no fabricated source entries in the current samples.

Verification is per record and covers the whole bilingual record. Separate per-language workflow states, review accounts, and a CMS are unnecessary for this foundation. Mass prayer references inherit all text and metadata from the library; they cannot override a prayer's status or sources. Their separate `context` describes the evidence/limitations of using the prayer at that position, not verification of its body.

Prayer-library status remains visible on library cards and prayer pages. On `/mass`, ordinary unverified dialogue keeps its Japanese-first reading hierarchy; its verification status and scoped sources remain discoverable in the native “出典・利用について” disclosure. Sample and unavailable content stay clearly marked. Source records and reproduction notes are retained, not removed.

No database, authentication, CMS, remote fonts, UI library, or backend service. Pages are prerendered; active navigation and guided Rosary interaction use client components. Search and favorites can be added when needed.

## Guided Rosary

`/rosary` is a separate feature, not an ordinary prayer record. Choose any of the four sets, review its five themes, and start. Weekdays are traditional suggestions, not automatic calendar rules. Optional opening references: sign of the cross, Apostles' Creed, Our Father, three Ave Marias, Glory Be. Each decade references one Our Father, ten Ave Marias, and one Glory Be. After the 60 decade steps, an explicit `closing` phase references `salve-regina` once. The mode renders only the current canonical prayer, with Previous/Next, repetition count, current mystery, and overall completed-prayer progress. There are 61 steps without the opening, 68 with it; completion is reversible using Previous.

Mystery titles were researched on the Catholic [Laudate site](https://www.pauline.or.jp/prayingtime/rosario02.php), with each group's exact page recorded in the data. Only short headings are stored, not source meditations or scripture passages. CBCJ's [Rosary publication page](https://www.cbcj.catholic.jp/publish/rosario-2/) confirms the collection but is not claimed as the source of these individual headings. Kana and concise Vietnamese descriptions are project-prepared support, not official translations; the sets remain `unverified`. Source notices do not grant reproduction rights.

Salve Regina is available at `/prayers/salve-regina` and closes the guided Rosary through the same canonical record, not a copied body. Its Japanese name is documented by CBCJ; its complete Japanese body comes from the [official Saitama diocesan message](https://saitama.catholic.jp/our_diocese/our_bishop/messages/?mon=4&no=147&year=2022). Context evidence is separate from body provenance; kana and Vietnamese remain project-prepared support. No additional reproduction permission is inferred. Closing is labelled 結びの祈り / Kinh kết thúc, not a sixth mystery. No additional closing prayers are added. No persistence, login, or backend is used. Selection/progress lasts only while the component remains mounted; changing the set or opening option resets it. Returning to the selection screen and starting again resumes an unfinished session.

Phone controls remain at the bottom with safe-area padding and reserved reading space. Mystery background and source information are expandable; identical Ave Maria steps preserve scroll position. New prayers scroll into view beneath the measured sticky progress header. Tablet/desktop layouts use a secondary mystery outline and constrained reading column. There are no animations.

`npm run test` uses Node's built-in runner and the existing TypeScript compiler; no testing dependency is installed. It includes Mass type/runtime/semantic-migration checks and preservation hashes for all ten prayers and Rosary data. The old raw Mass hash was replaced by exact demo-content checks for its authorized model migration. `node tests/rosary-browser.mjs` runs against a production server at `http://127.0.0.1:3100` and a Chromium remote-debugging endpoint at `http://127.0.0.1:9223`. It checks the six Mass/Rosary widths, short/tall phones, existing-route regression, keyboard activation, counters, closing/completion transitions, exact canonical rendering, and disclosures. It closes the test browser and writes ignored results/screenshots under `.next`.

## Mass foundation

### ことばの典礼

The Word section now follows the current CBCJ 2022 congregational order: first reading and response, responsorial psalm, an optional second reading, the season-appropriate Gospel acclamation, Gospel dialogue and reading, homily, one Creed, and the universal prayer. The authoritative opening remains partially populated; the rest of Mass is still incomplete.

Scripture and proper content remain typed `MassVariableContent`, not sample text. An absent value means “not supplied,” never that the rite is omitted. Psalm verses, responses, intentions, and their supplied sources/status can be represented as ordered speaker-labelled passages. The acclamation uses two explicit alternatives (Alleluia or the other chant specified by the liturgical notes); no calendar selection runs in the app.

The CBCJ order permits either the Nicene-Constantinopolitan Creed or the Apostles’ Creed; its Japan-specific adaptation allows the Apostles’ Creed in any season. The existing `apostles-creed` prayer is referenced because the spoken wording matches (the prayer record displays pronunciation aids); the Nicene body remains unavailable locally, not a daily-variable slot. The Gloria likewise has its correct conditional position, but its body is not reproduced locally. CBCJ body locations are cited; no reproduction permission is inferred. Mass remains partial.

### 感謝の典礼 — first tranche

The initial CBCJ-sourced portion covers 供えものの準備, 奉納祈願, the Preface dialogue and variable 叙唱, and 感謝の賛歌 (サンクトゥス). The bread and wine presentation prayers distinguish the quiet form from the permitted audible form when there is no offertory song; the possible congregational response is explicitly marked optional. The prayer over the offerings and Preface remain empty typed slots. After the Sanctus, one of the four Eucharistic Prayers is shown as a choice, but none of their bodies is included. Later tranches add the 交わりの儀 framework and the CBCJ 閉祭 structure; unavailable text remains explicitly marked.

`MassOrder` contains ordered sections → subsections → blocks. The Mass uses the CBCJ order implemented on 2022-11-27. Its five display groups use [CBCJ's 2022 edition](https://www.cbcj.catholic.jp/publish/mass2022/) headings: 開祭, ことばの典礼, 感謝の典礼, 交わりの儀（コムニオ）, 閉祭. Communion is shown within the Eucharistic liturgy. The first part of 開祭 now includes sourced entrance guidance, the opening sign, greeting alternatives, penitential alternatives and Kyrie alternatives. This remains a partial order, not a complete Mass or permission to omit unlisted rites.

- `spoken`: fixed ordinary speech with constrained speaker, Japanese, optional kana/Vietnamese, and `ContentVerification`.
- `rubric`: non-spoken instructions, distinguishing sourced `liturgical` rubrics from project `editorial` guidance. The opening now has CBCJ-sourced rubric entries with project-created Vietnamese explanations; later omission notices remain sample editorial guidance.
- `choice`: a sourced, Mass-specific set of permitted alternatives. Each group starts collapsed and says to use one option. Conditional choices record when they follow another choice; no automatic selection or calendar rules are implemented.
- `variable`: a typed `MassVariableKind` slot, not a magic placeholder string. Readings, psalm, Gospel/acclamation, homily, intentions and proper prayers have distinct keys. Missing content is labelled 未収録, not represented as verified or omitted liturgy.
- `prayer`: a compile-time-checked canonical `PrayerId`, rendered through the library. Its context states demonstration/liturgical use and separate placement evidence. Liturgical reuse needs a source and human confirmation of exact wording/context; similarity of titles is insufficient.
- `prayer-variant`: a typed reference to a stable, separately sourced Mass-context form linked to a canonical prayer. It preserves speaker segmentation and its own verification/provenance without editing the standalone record. No string trimming is used.

`MassContent` optionally accepts local `MassVariableContent`: each slot resolves to ordered speaker-labelled passages with their own sources/status, allowing psalm verses and congregation responses to alternate. No values are populated yet. Omit unfilled keys; empty arrays are rejected. Whether a rite occurs is an authored-order decision, not an automatic calendar rule. Fixed alternatives such as Eucharistic Prayer choices are **not** day-specific readings; no selection engine is introduced.

Roles are centrally labelled: 司祭, 司教, 助祭, 会衆, 朗読者, 詩編唱者, 先唱者, 一同. `oneOf` means alternative ministers, not simultaneous speech; `all` means 一同. These are speaking roles, not an exhaustive ministry/permissions system. See CBCJ's [congregational order](https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf), especially printed pages 1–4. The greeting's third form includes its bishop-presider wording.

Structural citations are separate from body sources. Each new Japanese spoken block and liturgical rubric cites the CBCJ congregational order; the kana and Vietnamese are separately scoped project support. The old sample priest/congregation dialogue was removed from 開祭 and replaced. Its separate Our Father example in Communion remains a demonstration. The standalone Sign of the Cross's Japanese text matches the CBCJ opening formula and Amen exactly, but its Mass roles differ; the single `sign-of-cross-mass-opening` variant reuses the canonical identity while preserving per-speaker segments and source/status. The standalone record was not changed. The Our Father Mass-context variant is deferred to the Communion tranche: its standalone ending and the Mass continuation differ, so the unchanged full prayer is not presented as the Mass form, trimmed, or duplicated in the Mass order.

Build-time validation rejects bad/duplicate IDs, roles, alternative shapes/conditions, reference targets, variable slots, unsupported verification/scopes and unsourced liturgical reuse. Types do not prove liturgical correctness, translation quality or permission. Remaining gaps include the holy-water rite body, other opening sequences, daily Word texts, the four Eucharistic Prayer bodies, and some longer Communion formulae. The closing framework is now present; its proper blessing bodies are not supplied. Review permitted variants and reproduction terms before expanding this content.

## Eucharistic Prayer availability

The Mass model defines exactly four stable forms (I–IV) and does not select one by default. All four bodies are currently unpopulated; the interface says this is a content gap, not an omission from Mass. CBCJ's current congregational order supports retaining structural metadata for Eucharistic Prayer II (printed pp. 17–20 / PDF pp. 16–19), including three memorial-acclamation alternatives, an optional insertion for Masses for the dead, and contextual names. No Eucharistic Prayer wording is included. Future sourced bodies can use ordered sections, constrained speakers, scoped provenance, conditional blocks, and typed contextual variables. The order continues into the 交わりの儀 framework and 閉祭, but remains partial.

Mass now uses a dedicated four-form selector after the Preface and 感謝の賛歌. The selector has no default choice, and unavailable forms cannot be selected or rendered as prayer content.

## 交わりの儀

Mass content now follows the CBCJ 2022 Communion-order framework (printed pp. 30–34 / PDF pp. 29–33). The single variable Communion-song slot begins at the priest’s reception boundary and is explained as continuing during distribution; vessel purification and the unavailable quiet priest prayer precede assembly silence. Short sourced responses are separate speaker-labelled passages; longer prayer/formula bodies not included here are explicitly marked unavailable rather than reconstructed. The Mass Lord’s Prayer links to the canonical `lords-prayer` through `lords-prayer-mass-communion`, but that context-specific body remains unpopulated: the standalone Amen is not inserted before the priest’s continuation, and no text slicing is used. Communion and post-Communion songs and the Prayer after Communion remain typed local variable slots. The Eucharistic Prayer bodies and some long Communion formulas remain unpopulated.

This is the current Communion state and supersedes earlier foundation notes below that describe a demonstration-only Communion prayer or defer the Mass Lord’s Prayer variant.

## 閉祭 and end-to-end structure

The CBCJ 2022 closing framework (printed pp. 34–35 / PDF pp. 33–34) is modeled as notices when needed, a priest/bishop greeting form, the blessing, one of three dismissal formulas spoken by a deacon or priest, the congregation response, and departure. Bishop-specific greeting and the seasonal/celebration-specific solemn blessing or Prayer over the People are conditional alternatives; their extra prayer bodies remain typed but unsupplied. No calendar selection is implemented. The Mass display reaches a clear end marker after the liturgical dismissal, without appending devotional prayers.

The Mass remains `partial`: all four Eucharistic Prayer bodies and some longer Communion formulas are still unavailable locally. Missing app content is explicitly not an indication that the rite is omitted from the liturgy. Fixed closing dialogue is CBCJ-sourced; kana and Vietnamese explanations are project-prepared and unverified.

## Hosting

Commit this repository, including `package-lock.json`, to GitHub. Import it into Vercel as a Next.js project using Node.js 24, the repository root, and `npm run build`. No environment variables are needed. This task does not publish or deploy the app.

## Next task

Independently review kana and Vietnamese support for the ten prayers and document reproduction bases before marking records verified or publishing them. Japanese citations do not establish independent verification of reading/translation; publication, approval dates, and copyright notices do not establish additional reproduction permission.
