"use client";

import { useState } from "react";
import { eucharisticPrayers } from "@/content/eucharistic-prayers";
import { massRoleLabels } from "@/content/mass-labels";
import type { EucharisticPrayerBlock, EucharisticPrayerDefinition, EucharisticPrayerId, EucharisticPrayerVariable } from "@/content/mass-types";
import { ContentSources, ContentStatus } from "./content-metadata";
import { BilingualText } from "./bilingual-text";

const contextualLabels: Record<EucharisticPrayerVariable, { ja: string; vi: string }> = {
  "pope-name": { ja: "教皇名", vi: "Tên Đức Giáo hoàng" },
  "bishop-name": { ja: "司教名", vi: "Tên giám mục giáo phận" },
  "deceased-name": { ja: "故人名", vi: "Tên người đã qua đời" },
};

function Speaker({ block }: { block: Extract<EucharisticPrayerBlock, { speaker: unknown }> }) {
  const speaker = block.speaker;
  const label = typeof speaker === "string"
    ? massRoleLabels[speaker]
    : { ja: speaker.oneOf.map(role => massRoleLabels[role].ja).join("または"), vi: speaker.oneOf.map(role => massRoleLabels[role].vi).join(" hoặc ") };
  return <p className="speaker">{label.ja}{label.vi && <span lang="vi">{label.vi}</span>}</p>;
}

function PrayerBlock({ block }: { block: EucharisticPrayerBlock }): React.JSX.Element {
  switch (block.kind) {
    case "spoken":
      return <div className={`ep-spoken ${block.speaker === "congregation" ? "congregation" : ""}`}>
        <Speaker block={block} />
        {block.optional && <p className="mass-optional-label">任意の応答 · <span lang="vi">Đáp lại tùy chọn</span></p>}
        <BilingualText text={block.text} />
        {block.sources?.length ? <ContentSources sources={block.sources} /> : null}
      </div>;
    case "rubric":
      return <aside className={`mass-rubric ${block.origin === "editorial" ? "ep-editorial" : ""}`}>
        <p className="eyebrow">{block.origin === "editorial" ? "編集上の案内" : "典礼の指示"}</p>
        <BilingualText text={block.text} />
        {block.sources?.length ? <ContentSources sources={block.sources} /> : null}
      </aside>;
    case "variable": {
      const label = contextualLabels[block.slot];
      return <div className="ep-variable" data-ep-variable={block.slot}>
        <Speaker block={block} />
        <span>{label.ja} · <span lang="vi">{label.vi}</span>：未提供</span>
        {block.note && <BilingualText text={block.note} />}
      </div>;
    }
    case "conditional":
      return <details className="ep-conditional">
        <summary>{block.condition.ja}<span lang="vi">{block.condition.vi}</span></summary>
        {block.blocks.map(child => <PrayerBlock block={child} key={child.id} />)}
        <ContentSources sources={block.sources} />
      </details>;
    case "choice":
      return <details className="mass-choice ep-choice">
        <summary>{block.title.ja}<span lang="vi">{block.title.vi}</span></summary>
        <p className="mass-choice-instruction">{block.instruction.ja}<span lang="vi">{block.instruction.vi}</span></p>
        <ContentStatus status={block.status} />
        {block.options.map(option => <section className="mass-choice-option" key={option.id}>
          <h4>{option.title}</h4>
          {option.blocks.map(child => <PrayerBlock block={child} key={child.id} />)}
        </section>)}
        <ContentSources sources={block.sources} />
      </details>;
  }
}

function PopulatedPrayer({ definition }: { definition: EucharisticPrayerDefinition }) {
  return <article className="ep-reader" aria-labelledby="selected-eucharistic-prayer">
    <h4 id="selected-eucharistic-prayer">{definition.title}</h4>
    <ContentStatus status={definition.status} />
    <ContentSources sources={definition.sources} />
    {definition.sections.map(section => <section className="ep-section" key={section.id}>
      <h5>{section.title}<span className="eyebrow">{section.headingOrigin === "editorial" ? "編集上の区分" : "典礼書の見出し"}</span></h5>
      {section.blocks.map(block => <PrayerBlock block={block} key={block.id} />)}
    </section>)}
  </article>;
}

export function EucharisticPrayerSelector() {
  const [selected, setSelected] = useState<EucharisticPrayerId | null>(null);
  const definition = eucharisticPrayers.find(prayer => prayer.id === selected);
  return <section className="ep-selector" aria-labelledby="eucharistic-prayer-selector-title">
    <h4 id="eucharistic-prayer-selector-title">奉献文の選択 <span lang="vi">Chọn Kinh nguyện Thánh Thể</span></h4>
    <p>各形式から一つを用います。本文未収録は、ミサで奉献文が省略される意味ではありません。</p>
    <p className="translation" lang="vi">Trong Thánh lễ, chọn một trong các Kinh nguyện Thánh Thể. Chưa có bản văn ở đây không có nghĩa là bỏ phần này.</p>
    <fieldset>
      <legend className="visually-hidden">奉献文の形式を選択</legend>
      <div className="ep-options">
        {eucharisticPrayers.map(prayer => {
          const available = prayer.contentState === "available";
          return <label className={`ep-option ${selected === prayer.id ? "selected" : ""}`} key={prayer.id}>
            <input
              type="radio"
              name="eucharistic-prayer"
              value={prayer.id}
              checked={selected === prayer.id}
              disabled={!available}
              onChange={() => setSelected(prayer.id)}
            />
            <span className="ep-option-title">{prayer.title}</span>
            <span className="ep-option-state">{available ? "本文あり" : "本文未収録"}</span>
          </label>;
        })}
      </div>
    </fieldset>
    <p className="ep-selection-note" aria-live="polite">
      {definition ? `${definition.title}を選択中。` : "現在、選択可能な本文はありません。"}
      <span lang="vi">{definition ? "Đang chọn hình thức này." : "Hiện chưa có bản văn nào để chọn."}</span>
    </p>
    {definition?.contentState === "available" && <PopulatedPrayer definition={definition} />}
    <details className="content-sources ep-structure-source">
      <summary>構造・出典 <span lang="vi">Cấu trúc và nguồn</span></summary>
      <p>第二奉献文について、CBCJ会衆用式次第（印刷頁17–20、PDF頁16–19）は三つの会衆応唱と、死者のためのミサで加えることができる祈りを示しています。本文はここには収録していません。</p>
      <ContentSources sources={eucharisticPrayers.flatMap(prayer => prayer.sources)} />
    </details>
  </section>;
}
