import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-heading">
      <h1>ページが見つかりません</h1>
      <p lang="vi" className="translation">Không tìm thấy trang này.</p>
      <Link className="text-link" href="/">ホームへ戻る →</Link>
    </div>
  );
}
