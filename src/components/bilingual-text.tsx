import type { BilingualText as Text } from "@/content/types";

export function BilingualText({ text }: { text: Pick<Text, "ja" | "reading"> & Partial<Pick<Text, "vi">> }) {
  return (
    <div className="bilingual-text">
      <p className="japanese">{text.ja}</p>
      {text.reading && <p className="reading" aria-label="読み方">{text.reading}</p>}
      {text.vi && <p className="translation" lang="vi">{text.vi}</p>}
    </div>
  );
}
