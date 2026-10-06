"use client";

import { useEffect, useRef, useState } from "react";
import { mysterySets, type MysterySetId } from "@/content/rosary";
import { getPrayer } from "@/content/prayers";
import { buildRosarySteps, moveRosaryStep } from "@/domain/rosary";
import { RosarySelection } from "./rosary-selection";
import { BilingualText } from "./bilingual-text";
import { PrayerContent } from "./prayer-content";
import { ContentSources } from "./content-metadata";

export function RosaryPlayer() {
  const [setId, setSetId] = useState<MysterySetId>("joyful");
  const [includeOpening, setIncludeOpening] = useState(true);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const orientation = useRef<HTMLDivElement>(null);
  const selected = mysterySets.find(set => set.id === setId)!;
  const steps = buildRosarySteps(selected, includeOpening);
  const step = steps[index];
  const complete = index === steps.length;
  const prayer = step && getPrayer(step.prayerId);
  const mystery = step?.mysteryIndex !== undefined ? selected.mysteries[step.mysteryIndex] : undefined;
  const sectionKey = `${started}-${step?.phase}-${step?.mysteryIndex}-${step?.prayerId}`;

  // Keep scroll position between identical Ave Marias; new prayers start at their heading.
  useEffect(() => {
    if (started && heading.current) {
      const top = window.scrollY + heading.current.getBoundingClientRect().top - (orientation.current?.offsetHeight ?? 0) - 16;
      window.scrollTo({ top, behavior: "instant" });
    }
  }, [sectionKey, started]);

  function choose(id: MysterySetId) {
    if (id !== setId) { setSetId(id); setIndex(0); }
  }

  return (
    <div className="rosary-experience">
      {!started ? (
        <RosarySelection selected={selected} onSelect={choose} includeOpening={includeOpening}
          onOpeningChange={value => { setIncludeOpening(value); setIndex(0); }}
          onStart={() => { if (complete) setIndex(0); setStarted(true); }} />
      ) : (
        <>
          <div className="rosary-orientation" ref={orientation} role="status" aria-live="polite" aria-atomic="true">
            <p>{selected.title.ja} <span lang="vi">{selected.title.vi}</span></p>
            <p>{complete ? "ロザリオを唱え終えました" : step.phase === "opening" ? "開始の祈り" : step.phase === "closing" ? "結びの祈り" : `第${step.mysteryIndex! + 1}の黙想 / 5`}
              {prayer && ` · ${prayer.title.ja}${step.repeat > 1 ? ` ${step.repetition} / ${step.repeat}` : ""}`}</p>
            {step?.phase === "closing" && <p>五つの黙想を終えて <span lang="vi">Kinh kết thúc · Đã xong năm mầu nhiệm</span></p>}
            <label className="rosary-progress-label">{index} / {steps.length} 完了 <span lang="vi">đã đọc</span>
              <progress max={steps.length} value={index} aria-label="ロザリオ全体の進み具合" /></label>
          </div>
          <div className="rosary-praying-layout">
            <aside className="rosary-outline" aria-label="選んだ神秘の一覧">
              <h2>五つの黙想</h2>
              <ol>{selected.mysteries.map((item, position) => (
                <li key={position} aria-current={position === step?.mysteryIndex ? "step" : undefined}>
                  {position === step?.mysteryIndex && <span>現在 · </span>}第{position + 1} · {item.title.ja}
                </li>
              ))}</ol>
              <button type="button" onClick={() => setStarted(false)}>神秘の選択へ<span lang="vi">Chọn mầu nhiệm</span></button>
              <ContentSources sources={selected.sources} />
            </aside>
            <section className="rosary-current" aria-labelledby="current-prayer" data-step={index}>
              <h2 id="current-prayer" ref={heading} tabIndex={-1}>
                {complete ? "ロザリオの祈りが終わりました" : prayer?.title.ja}
                {!complete && step.repeat > 1 && <span className="rosary-count">{step.repetition} / {step.repeat}</span>}
              </h2>
              {complete ? (
                <>
                  <p className="translation" lang="vi">Bạn đã đọc xong năm chục kinh và Kinh Lạy Nữ Vương.</p>
                  <button type="button" className="rosary-start" onClick={() => { setIndex(0); setStarted(false); }}>神秘の選択に戻る<span lang="vi">Trở về chọn mầu nhiệm</span></button>
                </>
              ) : prayer && (
                <>
                  <p className="reading">{prayer.title.reading}</p>
                  <p className="translation" lang="vi">{prayer.title.vi}</p>
                  {mystery && <details className="rosary-theme content-sources" key={step.mysteryIndex}>
                    <summary>第{step.mysteryIndex! + 1}の黙想 · {mystery.title.ja}</summary>
                    <BilingualText text={mystery.title} />
                  </details>}
                  <article className="rosary-prayer" key={step.prayerId}><PrayerContent prayer={prayer} collapseNotes /></article>
                </>
              )}
            </section>
          </div>
          <nav className="rosary-controls" aria-label="祈りの前後へ移動">
            <div>
              <button type="button" disabled={index === 0} onClick={() => setIndex(value => moveRosaryStep(value, -1, steps.length))}>前へ<span lang="vi">Trước</span></button>
              <button type="button" className="rosary-primary" disabled={complete} onClick={() => setIndex(value => moveRosaryStep(value, 1, steps.length))}>
                {complete ? "完了" : index === steps.length - 1 ? "祈りを終える" : "次へ"}<span lang="vi">{complete ? "Hoàn tất" : index === steps.length - 1 ? "Kết thúc" : "Tiếp"}</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
