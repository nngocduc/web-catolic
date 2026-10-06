export function SampleNotice() {
  return (
    <aside className="sample-notice" aria-label="サンプル内容について">
      <p>「見本」と表示された本文は仮テキストです。正式な典礼文や祈りではありません。</p>
      <p lang="vi">Nội dung có nhãn “Mẫu” là văn bản minh họa, không phải bản văn phụng vụ hay lời kinh chính thức.</p>
    </aside>
  );
}

export function MassIncompleteNotice() {
  return (
    <aside className="sample-notice" aria-label="ミサの収録状況">
      <p>このミサ案内は構造上まだ部分的です。本文がないことは、典礼で省略されることを意味しません。</p>
      <p lang="vi">Hướng dẫn Thánh lễ này mới hoàn chỉnh một phần về cấu trúc. Bản văn chưa có trong ứng dụng không có nghĩa là bị lược bỏ trong phụng vụ.</p>
    </aside>
  );
}
