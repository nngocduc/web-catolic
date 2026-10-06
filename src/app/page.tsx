import Link from "next/link";
import { MassIncompleteNotice, SampleNotice } from "@/components/sample-notice";
import { massOrder } from "@/content/mass";
import { prayers } from "@/content/prayers";

export default function HomePage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">日本語 · Tiếng Việt</p>
        <h1>祈りを、ともに。</h1>
        <p className="intro">ミサの言葉と日々の祈りを、日本語とベトナム語で。</p>
        <p className="translation" lang="vi">Đồng hành trong Thánh lễ và lời cầu nguyện, bằng tiếng Nhật và tiếng Việt.</p>
      </div>
      <div className="home-cards">
        <Link href="/mass" className="card destination-card">
          <span className="eyebrow">01 · Thánh lễ</span>
          <h2>ミサ <span aria-hidden="true">→</span></h2>
          <p>司祭の言葉と、会衆の応答をたどる。</p>
          <p lang="vi" className="translation">Theo dõi lời linh mục và lời đáp của cộng đoàn.</p>
        </Link>
        <Link href="/prayers" className="card destination-card">
          <span className="eyebrow">02 · Lời cầu nguyện</span>
          <h2>祈り <span aria-hidden="true">→</span></h2>
          <p>日々の祈りを、ゆっくり読む。</p>
          <p lang="vi" className="translation">Đọc và tìm hiểu những lời kinh hằng ngày.</p>
        </Link>
      </div>
      {prayers.some((prayer) => prayer.status === "sample") && <SampleNotice />}
      {massOrder.status === "partial" && <MassIncompleteNotice />}
    </>
  );
}
