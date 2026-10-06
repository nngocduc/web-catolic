import type { Prayer } from "@/content/types";
import { getPrayer } from "@/content/prayers";
import { BilingualText } from "./bilingual-text";
import { ContentSources, ContentStatus } from "./content-metadata";

export function PrayerContent({ prayer, collapseNotes = false }: { prayer: Prayer; collapseNotes?: boolean }) {
  return (
    <>
      <ContentStatus status={prayer.status} />
      {prayer.context && (
        <aside className="content-note prayer-context">
          {!collapseNotes && <>
            <p>{prayer.context.text.ja}</p>
            <p lang="vi">{prayer.context.text.vi}</p>
          </>}
          <details className="content-sources">
            <summary>背景・季節の出典 <span lang="vi">Nguồn về bối cảnh và mùa phụng vụ</span></summary>
            {collapseNotes && <>
              <p>{prayer.context.text.ja}</p>
              <p lang="vi">{prayer.context.text.vi}</p>
            </>}
            <p>
              {prayer.context.source.url ? (
                <a href={prayer.context.source.url}>{prayer.context.source.name}</a>
              ) : prayer.context.source.name}
            </p>
            <p>{prayer.context.source.reference}</p>
          </details>
        </aside>
      )}
      {prayer.text ? <BilingualText text={prayer.text} /> : prayer.blocks.map((block) => {
        if (block.kind === "text") {
          return <div className="prayer-block" key={block.id}><BilingualText text={block.text} /></div>;
        }
        const referenced = getPrayer(block.prayerId);
        if (!referenced) throw new Error(`Unknown prayer reference: ${block.prayerId}`);
        return Array.from({ length: block.repeat ?? 1 }, (_, repetition) => (
          <section className="prayer-block referenced-prayer" key={`${block.id}-${repetition}`} aria-label={referenced.title.ja}>
            <h3>{referenced.title.ja}</h3>
            <PrayerContent prayer={referenced} collapseNotes={collapseNotes} />
          </section>
        ));
      })}
      {prayer.notes && (collapseNotes ? (
        <details className="content-note content-sources">
          <summary>学習用テキストについて <span lang="vi">Về nội dung hỗ trợ học tập</span></summary>
          <p>{prayer.notes.ja}</p><p lang="vi">{prayer.notes.vi}</p>
        </details>
      ) : (
        <aside className="content-note">
          <p>{prayer.notes.ja}</p>
          <p lang="vi">{prayer.notes.vi}</p>
        </aside>
      ))}
      <ContentSources sources={prayer.sources} />
    </>
  );
}
