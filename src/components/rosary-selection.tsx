import { mysterySets, rosaryStructureSource, rosaryClosingSource, type MysterySetId, type MysterySet } from "@/content/rosary";
import { BilingualText } from "./bilingual-text";
import { ContentSources, ContentStatus } from "./content-metadata";

export function RosarySelection({ selected, onSelect, includeOpening, onOpeningChange, onStart }: {
  selected: MysterySet;
  onSelect: (id: MysterySetId) => void;
  includeOpening: boolean;
  onOpeningChange: (value: boolean) => void;
  onStart: () => void;
}) {
  return (
    <div className="rosary-setup">
      <section aria-labelledby="mystery-choice">
        <h2 id="mystery-choice">神秘を選ぶ <span lang="vi" className="translation">Chọn mầu nhiệm</span></h2>
        <div className="mystery-choices" role="group" aria-label="神秘の選択">
          {mysterySets.map(set => (
            <button type="button" key={set.id} aria-pressed={set.id === selected.id} onClick={() => onSelect(set.id)}>
              <span>{set.id === selected.id && "✓ "}{set.title.ja}</span>
              <span className="reading">{set.title.reading}</span>
              <span lang="vi" className="translation">{set.title.vi}</span>
              {set.weekdayGuidance && <span className="eyebrow">{set.weekdayGuidance.ja}</span>}
            </button>
          ))}
        </div>
        <p className="content-note">曜日は目安です。どの神秘も自由に選べます。進み具合はこの画面を開いている間だけ保持され、別の神秘や開始方法を選ぶと最初に戻ります。</p>
        <p className="translation" lang="vi">Ngày trong tuần chỉ là gợi ý. Tiến độ chỉ được giữ trong phiên này; đổi mầu nhiệm hoặc cách bắt đầu sẽ đặt lại tiến độ.</p>
      </section>
      <section aria-labelledby="mystery-preview">
        <h2 id="mystery-preview">{selected.title.ja}</h2>
        <p className="translation" lang="vi">{selected.title.vi}</p>
        {selected.weekdayGuidance && <p className="translation" lang="vi">{selected.weekdayGuidance.vi}</p>}
        <ContentStatus status={selected.status} />
        <ol className="mystery-preview">
          {selected.mysteries.map((mystery, index) => (
            <li key={index}>
              <h3>第{index + 1}の黙想</h3>
              <BilingualText text={mystery.title} />
            </li>
          ))}
        </ol>
        <p>各黙想：主の祈り × 1 → アヴェ・マリア × 10 → 栄唱 × 1</p>
        <p className="translation" lang="vi">Mỗi chục: 1 Kinh Lạy Cha → 10 Kinh Kính Mừng → 1 Kinh Sáng Danh.</p>
        <label className="rosary-opening-option">
          <input type="checkbox" checked={includeOpening} onChange={event => onOpeningChange(event.target.checked)} />
          <span>開始の祈りを含める<span className="translation" lang="vi">Đọc các kinh mở đầu</span></span>
        </label>
        <p className="reading">十字架のしるし → 使徒信条 → 主の祈り → アヴェ・マリア（3回）→ 栄唱。外すと五連から始めます。</p>
        <button type="button" className="rosary-primary rosary-start" onClick={onStart}>祈りを始める / 再開する<span lang="vi">Bắt đầu / tiếp tục</span></button>
        <aside className="content-note"><p>五連の後は、結びの祈り「元后あわれみの母」を唱えます。</p><p lang="vi">Sau năm chục kinh, đọc Kinh Lạy Nữ Vương để kết thúc.</p></aside>
        <ContentSources sources={selected.sources} />
        <ContentSources sources={[rosaryStructureSource]} />
        <ContentSources sources={[rosaryClosingSource]} />
      </section>
    </div>
  );
}
