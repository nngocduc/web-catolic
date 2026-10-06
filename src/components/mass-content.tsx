import Link from "next/link";
import { getPrayer } from "@/content/prayers";
import { massSectionLabels, massVariableLabels } from "@/content/mass-labels";
import type { MassBlock, MassOrder, MassPassage, MassSpeaker, MassVariableContent } from "@/content/mass-types";
import { massSpeakerLabel, validateMass } from "@/domain/mass";
import { BilingualText } from "./bilingual-text";
import { ContentSources, ContentStatus } from "./content-metadata";
import { PrayerContent } from "./prayer-content";
import { massPrayerVariants, type MassPrayerVariantId } from "@/content/mass-prayer-variants";
import { EucharisticPrayerSelector } from "./eucharistic-prayer-selector";

function Speaker({ speaker }: { speaker: MassSpeaker }) {
  const label = massSpeakerLabel(speaker);
  return <p className="speaker">{label.ja}{label.vi && <span lang="vi">{label.vi}</span>}</p>;
}

function Passage({ passage }: { passage: MassPassage & { optional?: boolean } }) {
  return <div className={`mass-passage ${passage.speaker === "congregation" ? "congregation" : ""}`}>
    <Speaker speaker={passage.speaker} />
    {passage.optional && <p className="mass-optional-label">任意の応答 · <span lang="vi">Đáp lại tùy chọn</span></p>}
    {passage.status === "sample" && <ContentStatus status={passage.status} />}
    <BilingualText text={passage.text} />
    <ContentSources sources={passage.sources} status={passage.status} />
  </div>;
}

function Block({ block, values }: { block: MassBlock<MassPrayerVariantId>; values: MassVariableContent }) {
  switch (block.kind) {
    case "eucharistic-prayer-selector":
      return <EucharisticPrayerSelector />;
    case "spoken":
      return <div data-mass-kind="spoken"><p className="eyebrow">固定の言葉 · <span lang="vi">Phần cố định</span></p><Passage passage={block} /></div>;
    case "rubric":
      return <aside className="mass-rubric" data-mass-kind="rubric">
        <p className="eyebrow">{block.origin === "editorial" ? "表示案内（唱えません）" : "典礼の指示（唱えません）"}</p>
        {block.status === "sample" && <ContentStatus status={block.status} />}
        <BilingualText text={block.text} />
        <ContentSources sources={block.sources} status={block.status} />
      </aside>;
    case "unavailable":
      return <aside className="mass-unavailable" data-mass-kind="unavailable">
        {block.speaker && <Speaker speaker={block.speaker} />}
        <h4>{block.title}</h4>
        <p className="mass-empty">本文未収録 · Nội dung chưa được cung cấp</p>
        <p>{block.note.ja}</p>
        {block.note.vi && <p className="translation" lang="vi">{block.note.vi}</p>}
        {block.condition && <p className="mass-choice-condition">{block.condition.ja}{block.condition.vi && <span lang="vi">{block.condition.vi}</span>}</p>}
        {block.repeat && <p className="mass-guidance">パンの分割中に必要に応じて繰り返し、最後は平和を願う句で結びます。 · Lặp lại khi cần trong lúc bẻ bánh và kết thúc bằng lời xin bình an.</p>}
        <ContentSources sources={block.sources} status={block.status} />
      </aside>;
    case "variable": {
      const label = massVariableLabels[block.slot];
      const passages = values[block.slot];
      return <div className="mass-variable" data-mass-kind="variable" data-slot={block.slot}>
        <h4>{label.ja}</h4>
        {label.vi && <p className="translation" lang="vi">{label.vi}</p>}
        <p className="eyebrow">{block.optional ? "任意の内容" : "日・祭儀による内容"} · <span lang="vi">{block.optional ? "Phần tùy chọn" : "Thay đổi theo cử hành"}</span></p>
        {passages ? passages.map(passage => <Passage passage={passage} key={passage.id} />) : <>
          <Speaker speaker={block.speaker} />
          <p className="mass-empty">［未収録：{label.ja}］</p>
          <p className="translation" lang="vi">Chưa có nội dung cho cử hành này.</p>
        </>}
        {block.note && <div className="mass-guidance"><BilingualText text={block.note} /></div>}
      </div>;
    }
    case "prayer": {
      const prayer = getPrayer(block.prayerId);
      if (!prayer) throw new Error(`Unknown prayer reference: ${block.prayerId}`);
      return <div className="mass-reference" data-mass-kind="prayer">
        <aside className="mass-rubric">
          <p className="eyebrow">{block.context.purpose === "demonstration" ? "参照の表示例・ミサ用式文ではありません" : "この箇所での使用について"}</p>
          {block.context.status === "sample" && <ContentStatus status={block.context.status} />}
          <BilingualText text={block.context.note} />
          <ContentSources sources={block.context.sources} status={block.context.status} />
        </aside>
        <Speaker speaker={block.speaker} />
        <h4>{prayer.title.ja}</h4>
        <p className="reading">{prayer.title.reading}</p>
        <p className="translation" lang="vi">{prayer.title.vi}</p>
        <PrayerContent prayer={prayer} />
        <Link className="text-link" href={`/prayers/${prayer.id}`}>祈りのページへ →</Link>
      </div>;
    }
    case "prayer-variant": {
      const variant = massPrayerVariants[block.variantId];
      if (!variant) throw new Error(`Unknown Mass prayer variant: ${block.variantId}`);
      const prayer = getPrayer(variant.prayerId);
      if (!prayer) throw new Error(`Unknown canonical prayer: ${variant.prayerId}`);
      return <section className="mass-variant" data-mass-kind="prayer-variant" aria-label={`${prayer.title.ja}・ミサでの形`}>
        <p className="eyebrow">祈り集の祈りをミサの役割で表示 · <span lang="vi">Kinh trong thư viện, trình bày theo vai trò trong Thánh lễ</span></p>
        <h4>{prayer.title.ja}</h4>
        {variant.contentState === "available" ? variant.blocks.map(segment => <Passage passage={segment} key={segment.id} />) : <>
          <p className="mass-empty">ミサ用本文未収録 · Chưa có bản văn dùng trong Thánh lễ</p>
          {variant.note && <><p>{variant.note.ja}</p>{variant.note.vi && <p className="translation" lang="vi">{variant.note.vi}</p>}</>}
        </>}
        <ContentSources sources={variant.sources} status={variant.status} />
        <Link className="text-link" href={`/prayers/${prayer.id}`}>祈り集のページへ →</Link>
      </section>;
    }
    case "choice":
      return <details className="mass-choice" data-mass-kind="choice" data-choice-id={block.choiceId}>
        <summary>{block.title.ja}<span lang="vi">{block.title.vi}</span></summary>
        {block.when && <p className="mass-choice-condition">{block.instruction.ja}<span lang="vi">{block.instruction.vi}</span></p>}
        {!block.when && <p className="mass-choice-instruction">{block.instruction.ja}<span lang="vi">{block.instruction.vi}</span></p>}
        {block.status === "sample" && <ContentStatus status={block.status} />}
        {block.options.map(option => <section className="mass-choice-option" key={option.id}>
          <h4>{option.title}</h4>
          {option.condition && <div className="mass-guidance"><BilingualText text={option.condition} /></div>}
          {option.blocks.map(child => <Block block={child} values={values} key={child.id} />)}
        </section>)}
        <ContentSources sources={block.sources} status={block.status} />
      </details>;
  }
}

/** Supplying local variable passages does not require a page or renderer redesign. */
export function MassContent({ order, values = {} }: { order: MassOrder<MassPrayerVariantId>; values?: MassVariableContent }) {
  validateMass(order, values);
  return <div className="mass-content">
    <nav className="section-index" aria-label="ミサの構成（見本）">
      {order.sections.map(section => <a href={`#${section.id}`} key={section.id}>
        {massSectionLabels[section.id].title.ja}
        {massSectionLabels[section.id].within && " — 感謝の典礼の中で"}
      </a>)}
    </nav>
    <details className="content-note content-sources mass-structure-sources">
      <summary>構成・役割の参考資料 <span lang="vi">Nguồn về cấu trúc và vai trò</span></summary>
      <p>式文の見本やベトナム語を認証する資料ではありません。読み・ベトナム語・表示案内はプロジェクト作成、未確認です。</p>
      <ul>{order.structureSources.map(source => <li key={source.url ?? source.name}>
        {source.url ? <a href={source.url}>{source.name}</a> : source.name}
        <p>{source.reference}</p>
      </li>)}</ul>
    </details>
    {order.sections.map(section => {
      const { title, within } = massSectionLabels[section.id];
      return <section className="mass-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
        {within && <p className="eyebrow">{massSectionLabels[within].title.ja}の中で · <span lang="vi">Trong Phụng vụ Thánh Thể</span></p>}
        <h2 id={`${section.id}-title`}>{title.ja}</h2>
        {title.reading && <p className="reading">{title.reading}</p>}
        {title.vi && <p className="translation" lang="vi">{title.vi}</p>}
        {section.subsections.map(subsection => <section className="mass-subsection" id={subsection.id} key={subsection.id} aria-labelledby={`${subsection.id}-title`}>
          <h3 id={`${subsection.id}-title`}>{subsection.title.ja}</h3>
          {subsection.title.reading && <p className="reading">{subsection.title.reading}</p>}
          {subsection.title.vi && <p className="translation" lang="vi">{subsection.title.vi}</p>}
          <div className="mass-items">{subsection.blocks.map(block => <Block block={block} values={values} key={block.id} />)}</div>
        </section>)}
      </section>;
    })}
  </div>;
}
