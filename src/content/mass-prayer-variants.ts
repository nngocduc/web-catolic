import type { MassPrayerVariant } from "./mass-types";

/** Mass-context form with role segmentation; canonical prayer text stays untouched. */
export const massPrayerVariants = {
  "sign-of-cross-mass-opening": {
    id: "sign-of-cross-mass-opening",
    prayerId: "sign-of-cross",
    context: "mass-opening",
    contentState: "available",
    status: "unverified",
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック典礼委員会",
        url: "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf",
        reference: "『ミサの式次第と第一～第四奉献文（会衆用）』印刷頁1。開祭の十字架のしるし。",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語の各発話に対応する読み方。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị",
        reference: "Bản hỗ trợ nghĩa theo từng người nói; chưa được kiểm chứng độc lập, không phải bản dịch CBCJ.",
      },
    ],
    blocks: [
      {
        id: "invocation", speaker: "priest",
        status: "unverified",
        text: {
          ja: "父と子と聖霊のみ名によって。",
          reading: "ちちとことせいれいのみなによって。",
          vi: "Nhân danh Cha, và Con, và Thánh Thần.",
        },
      },
      {
        id: "response", speaker: "congregation",
        status: "unverified",
        text: { ja: "アーメン。", reading: "アーメン。", vi: "Amen." },
      },
    ],
  },
  "lords-prayer-mass-communion": {
    id: "lords-prayer-mass-communion",
    prayerId: "lords-prayer",
    context: "mass-communion",
    contentState: "unpopulated",
    status: "unverified",
    blocks: [],
    note: {
      ja: "ミサでは会衆の主の祈りの後に司祭の続きがあり、会衆の結びの応答に至ります。本文はここでは収録していません。独立した祈りの末尾「アーメン。」をこの間に置かないため、祈りの本文を切り取って代用していません。",
      vi: "Trong Thánh lễ, sau phần cộng đoàn đọc Kinh Lạy Cha là lời tiếp của linh mục rồi mới đến lời đáp kết của cộng đoàn. Bản văn theo nghi thức này chưa được đưa vào; không cắt bản kinh riêng có Amen để thay thế.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf",
        reference: "『ミサの式次第と第一～第四奉献文』（会衆用）、印刷頁30–31 / PDF頁29–30。主の祈りから司祭の続き、会衆の結びの応答への構造確認のみ。本文は未収録。",
      },
      {
        appliesTo: "vi",
        name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị",
        reference: "Ghi chú cấu trúc do dự án biên soạn; không phải bản dịch chính thức.",
      },
    ],
  },
} as const satisfies Record<string, MassPrayerVariant>;

export type MassPrayerVariantId = keyof typeof massPrayerVariants;
