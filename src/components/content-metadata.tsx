import type { ContentSource, ContentVerification } from "@/content/types";

export function ContentStatus({ status }: { status: ContentVerification["status"] }) {
  if (status === "verified") return null;

  return (
    <span className="badge">
      {status === "sample" ? "見本" : "未確認"}
      {" · "}
      <span lang="vi">{status === "sample" ? "Mẫu" : "Chưa xác minh"}</span>
    </span>
  );
}

const sourceLabels: Record<ContentSource["appliesTo"], { ja: string; vi: string }> = {
  ja: { ja: "日本語本文", vi: "Bản văn tiếng Nhật" },
  vi: { ja: "ベトナム語訳", vi: "Bản dịch tiếng Việt" },
  reading: { ja: "読み方", vi: "Cách đọc" },
  all: { ja: "本文・訳・読み方", vi: "Bản văn, bản dịch và cách đọc" },
};

export function ContentSources({ sources, status }: { sources?: readonly ContentSource[]; status?: ContentVerification["status"] }) {
  if (!sources?.length && !status) return null;

  return (
    <details className="content-note content-sources">
      <summary>出典・利用について <span lang="vi">Nguồn và việc sử dụng</span></summary>
      {status && <p className="metadata-verification">確認状況 · Tình trạng kiểm chứng: {status === "verified" ? <span>確認済み · Đã xác minh</span> : <ContentStatus status={status} />}</p>}
      {sources?.length ? <ul>
        {sources.map((source, index) => (
          <li key={index}>
            <p>{sourceLabels[source.appliesTo].ja} · <span lang="vi">{sourceLabels[source.appliesTo].vi}</span></p>
            <p>{source.url ? <a href={source.url}>{source.name}</a> : source.name}</p>
            {source.reference && <p>{source.reference}</p>}
            {source.reproductionNote && <p className="reproduction-note">{source.reproductionNote}</p>}
          </li>
        ))}
      </ul> : null}
    </details>
  );
}
