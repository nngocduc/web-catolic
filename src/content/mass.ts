import type { MassOrder, MassSubsection, MassPassage, MassSimpleBlock, MassUnavailableBlock } from "./mass-types";
import { validateMass } from "../domain/mass";
import { massPrayerVariants, type MassPrayerVariantId } from "./mass-prayer-variants";

const orderPdf = "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf" as const;
const closingJaSource = { appliesTo: "ja", name: "カトリック中央協議会／日本カトリック典礼委員会", url: orderPdf, reference: "会衆用『ミサの式次第と第一～第四奉献文』印刷 pp.34–35 / PDF pp.33–34（2022年11月27日実施版）" } as const;
const closingReadingSource = { appliesTo: "reading", name: "プロジェクト作成の読み方", reference: "対応する日本語に基づくかな。独立確認なし。" } as const;
const closingViSource = { appliesTo: "vi", name: "プロジェクト作成のベトナム語学習補助", reference: "CBCJによる翻訳ではない。独立確認なし。" } as const;
const closingSources = [closingJaSource, closingReadingSource, closingViSource] as const;
function closingSpoken(id: string, speaker: MassPassage["speaker"], ja: string, reading: string, vi: string): MassPassage & { kind: "spoken" } {
  return { id, kind: "spoken", speaker, text: { ja, reading, vi }, status: "unverified", sources: closingSources };
}
function closingRubric(id: string, ja: string, vi: string): Extract<MassSimpleBlock<MassPrayerVariantId>, { kind: "rubric" }> {
  return { id, kind: "rubric", origin: "liturgical", status: "unverified", text: { ja, vi }, sources: [closingJaSource, closingViSource] };
}
const sourceScopes = [
  { appliesTo: "ja", name: "カトリック中央協議会 / 日本カトリック典礼委員会", url: orderPdf, reference: "『ミサの式次第と第一～第四奉献文（会衆用）』2022年11月27日実施版、印刷頁1–4。" },
  { appliesTo: "reading", name: "このプロジェクトで作成した読み方", reference: "各日本語発話に対応するかな。独立した確認は未実施。" },
  { appliesTo: "vi", name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị", reference: "Bản hỗ trợ nghĩa, chưa được kiểm chứng độc lập, không phải bản dịch CBCJ." },
] as const;

function spoken(id: string, speaker: MassPassage["speaker"], ja: string, reading: string, vi: string): MassPassage & { kind: "spoken" } {
  return { id, kind: "spoken", speaker, text: { ja, reading, vi }, status: "unverified", sources: sourceScopes };
}

function sourcedRubric(id: string, ja: string, vi: string): Extract<MassSimpleBlock<MassPrayerVariantId>, { kind: "rubric" }> {
  return {
    id, kind: "rubric", origin: "liturgical", status: "unverified",
    text: { ja, vi },
    sources: [{ appliesTo: "ja", name: "カトリック中央協議会 / 日本カトリック典礼委員会", url: orderPdf, reference: "『ミサの式次第と第一～第四奉献文（会衆用）』印刷頁1–4。" },
      { appliesTo: "vi", name: "Nội dung giải thích tiếng Việt do dự án chuẩn bị", reference: "Bản hỗ trợ nghĩa, chưa được kiểm chứng độc lập." }],
  };
}

const absolutionAndAmen = (prefix: string) => [
  spoken(`${prefix}-absolution`, "priest", "全能の神、いつくしみ深い父がわたしたちの罪をゆるし、\n永遠のいのちに導いてくださいますように。", "ぜんのうのかみ、いつくしみぶかいちちがわたしたちのつみをゆるし、\nえいえんのいのちにみちびいてくださいますように。", "Xin Thiên Chúa toàn năng, là Cha giàu lòng thương xót, tha tội cho chúng con và dẫn đưa chúng con vào sự sống đời đời."),
  spoken(`${prefix}-amen`, "congregation", "アーメン。", "アーメン。", "Amen."),
];

const penitentialInvitation = spoken(
  "penitential-invitation", "priest",
  "皆さん、聖なる祭儀を行う前に、わたしたちの罪を認め、ゆるしを願いましょう。",
  "みなさん、せいなるさいぎをおこなうまえに、わたしたちのつみをみとめ、ゆるしをねがいましょう。",
  "Anh chị em, trước khi cử hành mầu nhiệm thánh, chúng ta hãy nhìn nhận tội lỗi và xin ơn tha thứ."
);

const kyrieOptions = [
  {
    id: "japanese", title: "日本語",
    blocks: [
      spoken("kyrie-ja-lord-1", "cantor", "主よ、いつくしみを。", "しゅよ、いつくしみを。", "Lạy Chúa, xin thương xót chúng con."),
      spoken("kyrie-ja-response-1", "congregation", "主よ、いつくしみをわたしたちに。", "しゅよ、いつくしみをわたしたちに。", "Lạy Chúa, xin thương xót chúng con."),
      spoken("kyrie-ja-christ", "cantor", "キリスト、いつくしみを。", "キリスト、いつくしみを。", "Lạy Đức Kitô, xin thương xót chúng con."),
      spoken("kyrie-ja-response-2", "congregation", "キリスト、いつくしみをわたしたちに。", "キリスト、いつくしみをわたしたちに。", "Lạy Đức Kitô, xin thương xót chúng con."),
      spoken("kyrie-ja-lord-2", "cantor", "主よ、いつくしみを。", "しゅよ、いつくしみを。", "Lạy Chúa, xin thương xót chúng con."),
      spoken("kyrie-ja-response-3", "congregation", "主よ、いつくしみをわたしたちに。", "しゅよ、いつくしみをわたしたちに。", "Lạy Chúa, xin thương xót chúng con."),
    ],
  },
  {
    id: "greek", title: "ギリシア語",
    blocks: [
      spoken("kyrie-el-1", "cantor", "キリエ、エレイソン。", "キリエ、エレイソン。", "Kyrie, eleison. Xin Chúa thương xót."),
      spoken("kyrie-el-response-1", "congregation", "キリエ、エレイソン。", "キリエ、エレイソン。", "Kyrie, eleison. Xin Chúa thương xót."),
      spoken("kyrie-el-2", "cantor", "クリステ、エレイソン。", "クリステ、エレイソン。", "Christe, eleison. Xin Đức Kitô thương xót."),
      spoken("kyrie-el-response-2", "congregation", "クリステ、エレイソン。", "クリステ、エレイソン。", "Christe, eleison. Xin Đức Kitô thương xót."),
      spoken("kyrie-el-3", "cantor", "キリエ、エレイソン。", "キリエ、エレイソン。", "Kyrie, eleison. Xin Chúa thương xót."),
      spoken("kyrie-el-response-3", "congregation", "キリエ、エレイソン。", "キリエ、エレイソン。", "Kyrie, eleison. Xin Chúa thương xót."),
    ],
  },
] as const;

const greetingOptions = [
  {
    id: "greeting-first", title: "あいさつ 第一形式",
    blocks: [spoken("greeting-one", "priest", "主イエス・キリストの恵み、神の愛、聖霊の交わりが皆さんとともに。", "しゅイエス・キリストのめぐみ、かみのあい、せいれいのまじわりがみなさんとともに。", "Ân sủng của Đức Giêsu Kitô, tình yêu của Thiên Chúa và ơn hiệp thông của Chúa Thánh Thần ở cùng anh chị em.")],
  },
  {
    id: "greeting-second", title: "あいさつ 第二形式",
    blocks: [spoken("greeting-two", "priest", "父である神と主イエス・キリストからの恵みと平和が皆さんとともに。", "ちちであるかみとしゅイエス・キリストからのめぐみとへいわがみなさんとともに。", "Ân sủng và bình an từ Thiên Chúa là Cha và Đức Giêsu Kitô, Chúa chúng ta, ở cùng anh chị em.")],
  },
  {
    id: "greeting-third-priest", title: "あいさつ 第三形式（司祭）",
    blocks: [spoken("greeting-three-priest", "priest", "主は皆さんとともに。", "しゅはみなさんとともに。", "Chúa ở cùng anh chị em.")],
  },
  {
    id: "greeting-third-bishop", title: "あいさつ 第三形式（司教司式時）",
    condition: { ja: "司教が司式する場合のことばです。", vi: "Dùng lời này khi giám mục chủ sự." },
    blocks: [spoken("greeting-three-bishop", "bishop", "平和が皆さんとともに。", "へいわがみなさんとともに。", "Bình an ở cùng anh chị em.")],
  },
] as const;

const confessionOne = "わたしは、思い、ことば、行い、怠りによってたびたび罪を犯しました。";
const confessionOneReading = "わたしは、おもい、ことば、おこない、おこたりによってたびたびつみをおかしました。";
const confessionOneVietnamese = "Con đã nhiều lần phạm tội trong tư tưởng, lời nói, việc làm và những điều thiếu sót.";

const penitentialOptions = [
  {
    id: "form-one", title: "回心の祈り 第一形式",
    blocks: [
      sourcedRubric("penitential-one-rubric", "短い沈黙の後、一同は手を合わせて頭を下げ、一般告白の式文を一緒に唱える。", "Sau thinh lặng ngắn, mọi người chắp tay, cúi đầu và cùng đọc lời thống hối chung."),
      spoken("confiteor", "all", `全能の神と、\n兄弟姉妹の皆さんに告白します。\n${confessionOne}\n聖母マリア、すべての天使と聖人、そして兄弟姉妹の皆さん、\n罪深いわたしのために神に祈ってください。`, `ぜんのうのかみと、\nきょうだいしまいのみなさんにこくはくします。\n${confessionOneReading}\nせいぼマリア、すべてのてんしとせいじん、そしてきょうだいしまいのみなさん、\nつみぶかいわたしのためにかみにいのってください。`, `Lạy Thiên Chúa toàn năng,\ncon cùng anh chị em thú nhận:\n${confessionOneVietnamese}\nLạy Đức Maria trọn đời đồng trinh, cùng toàn thể các thiên thần và các thánh,\nanh chị em hãy cầu nguyện cho con là kẻ có tội.`),
      ...absolutionAndAmen("form-one"),
    ],
  },
  {
    id: "form-two", title: "回心の祈り 第二形式",
    blocks: [
      sourcedRubric("penitential-two-rubric", "短い沈黙の後、司祭と会衆は次のように唱える。", "Sau thinh lặng ngắn, linh mục và cộng đoàn đọc lời đối đáp sau."),
      spoken("form-two-priest-one", "priest", "主よ、あわれみをわたしたちに。", "しゅよ、あわれみをわたしたちに。", "Lạy Chúa, xin thương xót chúng con."),
      spoken("form-two-congregation-one", "congregation", "わたしたちはあなたに罪を犯しました。", "わたしたちはあなたにつみをおかしました。", "Chúng con đã phạm tội đến Chúa."),
      spoken("form-two-priest-two", "priest", "主よ、いつくしみを示し、", "しゅよ、いつくしみをしめし、", "Lạy Chúa, xin tỏ lòng từ bi,"),
      spoken("form-two-congregation-two", "congregation", "わたしたちに救いをお与えください。", "わたしたちにすくいをおあたえください。", "và ban ơn cứu độ cho chúng con."),
      ...absolutionAndAmen("form-two"),
    ],
  },
  {
    id: "form-three", title: "回心の祈り 第三形式",
    blocks: [
      sourcedRubric("penitential-three-rubric", "短い沈黙の後、先唱に続いて会衆は次のように唱える。", "Sau thinh lặng ngắn, cộng đoàn đáp lại những lời xướng sau đây."),
      sourcedRubric("penitential-three-substitution", "聖書の朗読や典礼暦に合わせて他の先唱のことばに代えることができる。", "Có thể thay lời xướng bằng những lời khác phù hợp với bài đọc hoặc mùa phụng vụ."),
      spoken("form-three-cantor-one", "cantor", "打ち砕かれた心をいやすために遣わされた主よ、いつくしみを。", "うちくだかれたこころをいやすためにつかわされたしゅよ、いつくしみを。", "Lạy Chúa, Chúa được sai đến để chữa lành những tâm hồn tan nát, xin thương xót chúng con."),
      spoken("form-three-response-one", "congregation", "主よ、いつくしみをわたしたちに。", "しゅよ、いつくしみをわたしたちに。", "Lạy Chúa, xin thương xót chúng con."),
      spoken("form-three-cantor-two", "cantor", "罪びとを招くために来られたキリスト、いつくしみを。", "つみびとをまねくためにこられたキリスト、いつくしみを。", "Lạy Đức Kitô, Chúa đến kêu gọi những người tội lỗi, xin thương xót chúng con."),
      spoken("form-three-response-two", "congregation", "キリスト、いつくしみをわたしたちに。", "キリスト、いつくしみをわたしたちに。", "Lạy Đức Kitô, xin thương xót chúng con."),
      spoken("form-three-cantor-three", "cantor", "父の右の座にあって、わたしたちのためにとりなしてくださる主よ、いつくしみを。", "ちちのみぎのざにあって、わたしたちのためにとりなしてくださるしゅよ、いつくしみを。", "Lạy Chúa, Chúa ngự bên hữu Chúa Cha và chuyển cầu cho chúng con, xin thương xót chúng con."),
      spoken("form-three-response-three", "congregation", "主よ、いつくしみをわたしたちに。", "しゅよ、いつくしみをわたしたちに。", "Lạy Chúa, xin thương xót chúng con."),
      ...absolutionAndAmen("form-three"),
    ],
  },
] as const;

const openingSubsections: MassSubsection<MassPrayerVariantId>[] = [
  {
    id: "entrance", title: { ja: "入祭の歌", reading: "にゅうさいのうた", vi: "Ca nhập lễ" },
    blocks: [sourcedRubric(
      "entrance-procession", "会衆が集まると入祭の歌を歌う。その間に、司祭は奉仕者とともに祭壇へ行く。祭壇への表敬の後、司祭は席に向かう。",
      "Khi cộng đoàn tụ họp, hát ca nhập lễ; linh mục cùng các thừa tác viên tiến đến bàn thờ, kính chào bàn thờ rồi về ghế.",
    )],
  },
  {
    id: "opening-sign", title: { ja: "十字架のしるし", reading: "じゅうじかのしるし", vi: "Dấu Thánh Giá khai lễ" },
    blocks: [
      sourcedRubric("opening-sign-instruction", "入祭の歌が終わると、司祭は会衆に向かって次のことばを唱え、司祭と信者は自分に十字架のしるしをする。", "Khi ca nhập lễ kết thúc, linh mục hướng về cộng đoàn; linh mục và các tín hữu làm dấu Thánh Giá."),
      { id: "opening-sign-prayer", kind: "prayer-variant", variantId: "sign-of-cross-mass-opening" },
    ],
  },
  {
    id: "greeting", title: { ja: "あいさつ", vi: "Lời chào" },
    blocks: [
      {
        id: "greeting-choice", kind: "choice", choiceId: "greeting-formula", status: "unverified",
        title: { ja: "会衆へのあいさつ", reading: "かいしゅうへのあいさつ", vi: "Lời chào cộng đoàn" },
        instruction: { ja: "次のあいさつから一つを唱えます。第3形式には司教司式時の語句があります。", vi: "Chọn một lời chào. Công thức thứ ba có lời riêng khi giám mục chủ sự." },
        sources: sourceScopes,
        options: greetingOptions,
      },
      spoken("greeting-response", "congregation", "またあなたとともに。", "またあなたとともに。", "Và ở cùng cha."),
    ],
  },
  {
    id: "penitential", title: { ja: "回心の祈り", vi: "Nghi thức thống hối" },
    blocks: [
      sourcedRubric("holy-water-alternative", "主日、とくに復活節の主日に、洗礼の恵みを思い起こすために、通常の回心の祈りに代えて「水の祝福と灌水」が行われる場合は36頁以下に続く。", "Vào Chúa nhật, nhất là Chúa nhật mùa Phục Sinh, phần làm phép và rảy nước (để tưởng nhớ hồng ân Thánh Tẩy) có thể thay nghi thức thống hối; bản văn tiếp tục ở trang 36 trở đi."),
      {
        id: "holy-water-not-included", kind: "rubric", origin: "editorial", status: "sample",
        text: { ja: "水の祝福と灌水の式文はこのページに未収録です。この場合、以下の招きと三形式はこの順では用いません。", vi: "Nghi thức làm phép và rảy nước chưa có bản văn trên trang này; trong trường hợp này, không dùng lời mời và ba hình thức sau theo thứ tự đang hiển thị." },
      },
      penitentialInvitation,
      {
        id: "penitential-choice", kind: "choice", choiceId: "penitential-form", status: "unverified",
        title: { ja: "回心の祈りの形式", vi: "Các hình thức thống hối" },
        instruction: { ja: "次の形式から一つを用います。本文を続けて全部唱えるものではありません。", vi: "Chọn một hình thức dưới đây; không đọc nối tiếp tất cả các hình thức." },
        sources: sourceScopes,
        options: penitentialOptions,
      },
      {
        id: "kyrie-choice", kind: "choice", choiceId: "kyrie-form", status: "unverified",
        title: { ja: "いつくしみの賛歌（キリエ）", vi: "Kinh Thương Xót" },
        instruction: { ja: "回心の祈り第一・第二形式の後に続きます。第三形式では省きます。次のいずれか一つを用います。", vi: "Tiếp sau hình thức thống hối I hoặc II; bỏ sau hình thức III. Chọn một trong hai bản sau." },
        sources: sourceScopes,
        when: { choiceId: "penitential-form", optionIds: ["form-one", "form-two"] },
        options: kyrieOptions,
      },
      sourcedRubric("gloria-rubric", "規定に従って、一同は栄光の賛歌（グロリア）を歌うかまたは唱える。", "Theo quy định phụng vụ, cộng đoàn hát hoặc đọc Kinh Vinh Danh."),
      {
        id: "gloria-body-unavailable", kind: "unavailable", title: "栄光の賛歌（グロリア）", speaker: "all",
        condition: { ja: "規定に従って用います。", vi: "Chỉ dùng khi phụng vụ quy định." },
        note: { ja: "CBCJ 2022年版の本文掲載箇所は確認していますが、このアプリには本文を収録していません。未収録は典礼で省略する意味ではありません。", vi: "Đã xác định nơi bản CBCJ 2022 đăng bản văn, nhưng ứng dụng chưa đưa toàn văn vào. Điều này không có nghĩa là bỏ qua phần này trong phụng vụ." },
        status: "unverified",
        sources: [
          { appliesTo: "ja", name: "カトリック中央協議会／日本カトリック典礼委員会", url: orderPdf, reference: "『ミサの式次第と第一～第四奉献文』（会衆用）、印刷 pp. 3–4 / PDF pp. 2–3。本文の掲載箇所の確認のみ。転載許諾は推定していません。" },
          { appliesTo: "ja", name: "プロジェクトによる説明", reference: "アプリ内に本文を収録していない旨の案内。典礼式文ではありません。" },
          { appliesTo: "vi", name: "Nội dung giải thích do dự án chuẩn bị", reference: "Thông báo nội dung chưa được đưa vào; không phải bản dịch phụng vụ." },
        ],
      },
    ],
  },
];

const wordOrderUrl = "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf" as const;
const wordChangesUrl = "https://www.cbcj.catholic.jp/wp-content/uploads/2017/01/henkou2022.pdf" as const;
const wordJapaneseSource = "カトリック中央協議会 / 日本カトリック典礼委員会";
const wordJapanese = (reference: string, url: typeof wordOrderUrl | typeof wordChangesUrl = wordOrderUrl) => ({
  appliesTo: "ja" as const,
  name: wordJapaneseSource,
  url,
  reference,
});
const wordReading = {
  appliesTo: "reading" as const,
  name: "このプロジェクトで作成した読み方",
  reference: "日本語発話に対応するかな。独立した確認は未実施。",
};
const wordVietnamese = {
  appliesTo: "vi" as const,
  name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị",
  reference: "Bản hỗ trợ nghĩa, chưa được kiểm chứng độc lập; không phải bản dịch CBCJ.",
};
function wordSpoken(id: string, speaker: MassPassage["speaker"], ja: string, reading: string, vi: string, page: string) {
  return {
    id, kind: "spoken" as const, speaker, text: { ja, reading, vi }, status: "unverified" as const,
    sources: [wordJapanese(`『ミサの式次第と第一～第四奉献文（会衆用）』印刷頁${page}。`), wordReading, wordVietnamese],
  };
}
function wordRubric(id: string, ja: string, vi: string, reference: string, url: typeof wordOrderUrl | typeof wordChangesUrl = wordOrderUrl) {
  return {
    id, kind: "rubric" as const, origin: "liturgical" as const, status: "unverified" as const,
    text: { ja, vi },
    sources: [wordJapanese(reference, url), wordVietnamese],
  };
}
const wordChoiceSources = [
  wordJapanese("『ミサの式次第と第一～第四奉献文（会衆用）』印刷頁6～8。選択・構造の根拠。"),
  wordVietnamese,
] as const;

const readingEnding = (prefix: string) => [
  wordRubric(`${prefix}-ending-instruction`, "朗読の終わりを示すため、朗読者は手を合わせてはっきりと唱える。", "Để báo kết thúc bài đọc, người đọc chắp tay và đọc rõ lời đáp.", "印刷頁5～6。第一・第二朗読の結び。"),
  wordSpoken(`${prefix}-word-of-god`, "reader", "神のみことば。", "かみのみことば。", "Lời Chúa.", "5～6"),
  wordSpoken(`${prefix}-thanks-to-god`, "all", "神に感謝。", "かみにかんしゃ。", "Tạ ơn Chúa.", "5～6"),
  wordRubric(`${prefix}-silence`, "続いて、朗読者は聖書に一礼して席に戻る。一同は沈黙のうちに、神のことばを味わう。", "Sau đó người đọc cúi chào Sách Thánh rồi trở về chỗ; mọi người thinh lặng suy niệm Lời Chúa.", "印刷頁5～6。朗読後の所作。"),
];

const wordSubsections: MassSubsection<MassPrayerVariantId>[] = [
  {
    id: "first-reading",
    title: { ja: "第一朗読", reading: "だいいちろうどく", vi: "Bài đọc I" },
    blocks: [
      wordRubric("first-reading-rubric", "朗読者は朗読台に行き、第一朗読を行う。", "Người đọc lên giảng đài và công bố bài đọc thứ nhất.", "印刷頁5。第一朗読。"),
      { id: "first-reading-slot", kind: "variable", slot: "first-reading", speaker: "reader" },
      ...readingEnding("first-reading"),
    ],
  },
  {
    id: "responsorial-psalm",
    title: { ja: "答唱詩編", reading: "とうしょうしへん", vi: "Thánh vịnh đáp ca" },
    blocks: [
      wordRubric("responsorial-psalm-rubric", "詩編唱者あるいは先唱者は詩編を歌うかまたは唱え、会衆は答唱する。", "Người hát thánh vịnh hoặc người xướng hát hay đọc thánh vịnh; cộng đoàn đáp lại.", "印刷頁5。答唱詩編。"),
      {
        id: "psalm-slot", kind: "variable", slot: "responsorial-psalm",
        speaker: { oneOf: ["psalmist", "cantor"] },
        note: { ja: "節と会衆の答唱は、順に別々の発話として収録できます。", vi: "Các câu thánh vịnh và lời đáp của cộng đoàn được lưu thành những lượt riêng theo thứ tự." },
      },
    ],
  },
  {
    id: "second-reading",
    title: { ja: "第二朗読（行われる場合）", reading: "だいにろうどく（おこなわれるばあい）", vi: "Bài đọc II (khi có)" },
    blocks: [
      wordRubric("second-reading-condition", "第二朗読が行われる場合、第一朗読と同じように行われる。", "Khi có bài đọc thứ hai, bài đọc được cử hành theo cùng cách như bài đọc thứ nhất.", "印刷頁5。第二朗読が行われる場合。"),
      { id: "second-reading-slot", kind: "variable", slot: "second-reading", speaker: "reader" },
      ...readingEnding("second-reading"),
    ],
  },
  {
    id: "gospel-acclamation",
    title: { ja: "アレルヤ唱（詠唱）", reading: "アレルヤしょう（えいしょう）", vi: "Tung hô Tin Mừng" },
    blocks: [
      wordRubric("gospel-acclamation-rubric", "続いて一同は起立し、典礼季節に応じて、アレルヤ唱、あるいは典礼注記によって定められた他の歌（詠唱）を歌う。", "Mọi người đứng; tùy mùa phụng vụ, hát Alleluia hoặc bài tung hô khác được quy định trong chỉ dẫn phụng vụ.", "『新しい「ミサの式次第と第一～第四奉献文」の変更箇所』印刷頁28。", wordChangesUrl),
      {
        id: "gospel-acclamation-choice", kind: "choice", choiceId: "gospel-acclamation-form",
        title: { ja: "その日の福音朗読前の歌", vi: "Bài hát trước Tin Mừng trong ngày" },
        instruction: { ja: "典礼季節と該当する典礼注記に従い、一つの形を用います。このページでは日付による選択をしません。", vi: "Chọn một hình thức theo mùa phụng vụ và chỉ dẫn tương ứng. Trang này không tự chọn theo ngày." },
        status: "unverified", sources: [wordJapanese("『新しい「ミサの式次第と第一～第四奉献文」の変更箇所』印刷頁28。典礼季節による選択の根拠。", wordChangesUrl), wordVietnamese],
        options: [
          { id: "alleluia-form", title: "アレルヤ唱", blocks: [{ id: "alleluia-slot", kind: "variable", slot: "gospel-acclamation", speaker: "all" }] },
          { id: "other-chant-form", title: "他の歌（詠唱）", blocks: [{ id: "gospel-chant-slot", kind: "variable", slot: "gospel-chant", speaker: "all" }] },
        ],
      },
    ],
  },
  {
    id: "gospel-reading",
    title: { ja: "福音朗読", reading: "ふくいんろうどく", vi: "Tin Mừng" },
    blocks: [
      wordRubric("gospel-dialogue-rubric", "助祭あるいは司祭は言う。", "Phó tế hoặc linh mục xướng lời mở đầu.", "印刷頁6。福音朗読。"),
      wordSpoken("gospel-greeting", { oneOf: ["deacon", "priest"] }, "主は皆さんとともに。", "しゅはみなさんとともに。", "Chúa ở cùng anh chị em.", "6"),
      wordSpoken("gospel-greeting-response", "congregation", "またあなたとともに。", "またあなたとともに。", "Và ở cùng cha.", "6"),
      { id: "gospel-title-slot", kind: "variable", slot: "gospel-title", speaker: { oneOf: ["deacon", "priest"] } },
      wordRubric("gospel-sign-and-response-rubric", "会衆は助祭あるいは司祭とともに、額、口、胸に十字架のしるしをして、はっきりと唱える。", "Cộng đoàn cùng phó tế hoặc linh mục làm dấu thánh giá trên trán, miệng và ngực, rồi đọc rõ lời đáp.", "印刷頁6。福音書名の告知後。"),
      wordSpoken("gospel-glory-response", "congregation", "主に栄光。", "しゅにえいこう。", "Vinh quang Chúa.", "6"),
      { id: "gospel-slot", kind: "variable", slot: "gospel", speaker: { oneOf: ["deacon", "priest"] } },
      wordRubric("gospel-ending-rubric", "福音朗読が終わると、助祭あるいは司祭は朗読福音書を両手で掲げてはっきりと唱える。", "Kết thúc bài Tin Mừng, phó tế hoặc linh mục nâng sách Tin Mừng bằng hai tay và đọc rõ lời tung hô.", "印刷頁6。福音朗読後。"),
      wordSpoken("gospel-word-of-the-lord", { oneOf: ["deacon", "priest"] }, "主のみことば。", "しゅのみことば。", "Lời Chúa.", "6"),
      wordSpoken("gospel-praise-response", "all", "キリストに賛美。", "キリストにさんび。", "Tôn vinh Chúa Kitô.", "6"),
    ],
  },
  {
    id: "homily",
    title: { ja: "説教", reading: "せっきょう", vi: "Bài giảng" },
    blocks: [
      wordRubric("homily-obligation", "すべての主日と守るべき祝日には、司祭あるいは助祭によって説教が行われなければならない。他の日にも勧められる。", "Vào mọi Chúa nhật và lễ buộc, linh mục hoặc phó tế phải giảng; vào những ngày khác cũng được khuyến khích.", "『新しい「ミサの式次第と第一～第四奉献文」の変更箇所』印刷頁30。", wordChangesUrl),
      { id: "homily-slot", kind: "variable", slot: "homily", speaker: { oneOf: ["priest", "deacon"] } },
    ],
  },
  {
    id: "profession-of-faith",
    title: { ja: "信仰宣言", reading: "しんこうせんげん", vi: "Tuyên xưng đức tin" },
    blocks: [
      wordRubric("creed-occasion", "すべての主日と祭日、およびより盛大に祝われる特別な祭儀に、一同は以下のいずれかの信条を歌うかまたは唱えて信仰宣言を行う。", "Vào các Chúa nhật, lễ trọng và những cử hành đặc biệt long trọng, cộng đoàn hát hoặc đọc một trong các Kinh Tin Kính sau.", "印刷頁7。信仰宣言。"),
      {
        id: "creed-choice", kind: "choice", choiceId: "creed-form",
        title: { ja: "信条", vi: "Kinh Tin Kính" },
        instruction: { ja: "認められた信条の一つを用います。信条の本文は互いに続けて唱えません。", vi: "Dùng một trong các Kinh Tin Kính được phép; không đọc nối tiếp các bản." },
        status: "unverified", sources: [wordJapanese("印刷頁7。信条の選択肢。"), wordReading, wordVietnamese],
        options: [
          {
            id: "nicene-creed", title: "ニケア・コンスタンチノープル信条",
            blocks: [{
              id: "nicene-body-unavailable", kind: "unavailable", title: "ニケア・コンスタンチノープル信条", speaker: "all",
              note: { ja: "CBCJ 2022年版の本文掲載箇所は確認していますが、このアプリには本文を収録していません。未収録は典礼で省略する意味ではありません。", vi: "Đã xác định nơi bản CBCJ 2022 đăng bản văn, nhưng ứng dụng chưa đưa toàn văn vào. Điều này không có nghĩa là bỏ qua phần này trong phụng vụ." },
              status: "unverified",
              sources: [
                { appliesTo: "ja", name: "カトリック中央協議会／日本カトリック典礼委員会", url: wordOrderUrl, reference: "『ミサの式次第と第一～第四奉献文』（会衆用）、印刷 pp. 5–7 / PDF pp. 4–6。本文の掲載箇所の確認のみ。転載許諾は推定していません。" },
                { appliesTo: "ja", name: "プロジェクトによる説明", reference: "アプリ内に本文を収録していない旨の案内。典礼式文ではありません。" },
                { appliesTo: "vi", name: "Nội dung giải thích do dự án chuẩn bị", reference: "Thông báo nội dung chưa được đưa vào; không phải bản dịch phụng vụ." },
              ],
            }],
          },
          {
            id: "apostles-creed", title: "使徒信条",
            blocks: [
              wordRubric("apostles-creed-bow", "以下、「おとめマリアから生まれ」まで一同は礼をする。", "Cộng đoàn cúi chào cho đến câu ‘sinh bởi Đức Trinh Nữ Maria’.", "印刷頁7。使徒信条の所作。"),
              {
                id: "apostles-creed-reference", kind: "prayer", speaker: "all", prayerId: "apostles-creed",
                context: {
                  purpose: "liturgical", status: "unverified",
                  note: { ja: "CBCJ 2022年版で選択肢として認められた使徒信条です。祈り集の本文をそのまま参照します。括弧内は祈り集の読みの補助です。", vi: "Kinh Tin Kính các Thánh Tông đồ là một lựa chọn trong bản CBCJ 2022; ứng dụng tham chiếu nguyên bản ghi trong thư viện. Phần trong ngoặc là trợ giúp cách đọc." },
                  sources: [wordJapanese("印刷頁7。使徒信条が選択肢として掲載されています。")],
                },
              },
            ],
          },
        ],
      },
      {
        id: "creed-japan-adaptation", kind: "rubric", origin: "editorial", status: "unverified",
        text: { ja: "日本の適応により、使徒信条は典礼季節を問わず選ぶことができます。このページでは自動選択を行いません。", vi: "Theo thích nghi cho Nhật Bản, có thể chọn Kinh Tin Kính các Thánh Tông đồ trong mọi mùa phụng vụ. Trang này không tự chọn." },
        sources: [wordJapanese("『新しい「ミサの式次第と第一～第四奉献文」の変更箇所』印刷頁30。" , wordChangesUrl), wordVietnamese],
      },
    ],
  },
  {
    id: "universal-prayer",
    title: { ja: "共同祈願（信者の祈り）", reading: "きょうどうきがん（しんじゃのいのり）", vi: "Lời nguyện tín hữu" },
    blocks: [
      wordRubric("universal-prayer-response-rubric", "共同祈願すなわち信者の祈りを行う。会衆は各意向の後に応唱もしくは沈黙の祈りをもって祈りを自分のものとする。", "Cử hành lời nguyện tín hữu; sau mỗi ý nguyện, cộng đoàn hiệp lời bằng câu đáp hoặc thinh lặng cầu nguyện.", "印刷頁8。共同祈願（信者の祈り）。"),
      { id: "intentions-invitation-slot", kind: "variable", slot: "intentions-invitation", speaker: "priest" },
      {
        id: "intentions-slot", kind: "variable", slot: "intentions",
        speaker: { oneOf: ["deacon", "cantor", "reader", "lay-faithful"] },
      },
      {
        id: "intentions-response-choice", kind: "choice", choiceId: "intentions-response-form",
        title: { ja: "各意向への応答", vi: "Cách cộng đoàn đáp lại từng ý nguyện" },
        instruction: { ja: "各意向の後に、応唱または沈黙の祈りを用います。", vi: "Sau mỗi ý nguyện, dùng câu đáp hoặc thinh lặng cầu nguyện." },
        status: "unverified", sources: wordChoiceSources,
        options: [
          { id: "intention-spoken-response", title: "応唱", blocks: [{ id: "intentions-response-slot", kind: "variable", slot: "intentions-response", speaker: "congregation" }] },
          { id: "intention-silent-response", title: "沈黙の祈り", blocks: [wordRubric("intentions-silent-rubric", "会衆は各意向の後に応唱もしくは沈黙の祈りをもって祈りを自分のものとする。", "Sau mỗi ý nguyện, cộng đoàn hiệp lời bằng câu đáp hoặc thinh lặng cầu nguyện.", "印刷頁8。各意向後の応唱または沈黙の祈り。")] },
        ],
      },
      { id: "intentions-conclusion-slot", kind: "variable", slot: "intentions-conclusion", speaker: "priest" },
      wordRubric("intentions-amen-rubric", "司祭の結びの祈りの後に会衆ははっきりと唱える。", "Sau lời nguyện kết của linh mục, cộng đoàn đọc rõ lời đáp.", "印刷頁8。共同祈願の結び。"),
      wordSpoken("intentions-amen", "congregation", "アーメン。", "アーメン。", "Amen.", "8"),
    ],
  },
];

/* Retired demonstration of the standalone Our Father; Mass now uses the explicitly scoped variant below.
const demonstrationReference: MassSubsection<MassPrayerVariantId> = {
  id: "sample-shared-prayer",
  title: { ja: "共通の祈りの表示例", vi: "Ví dụ hiển thị lời kinh dùng chung" },
  blocks: [
    {
      id: "sample-lords-prayer", kind: "prayer", speaker: "congregation", prayerId: "lords-prayer",
      context: {
        purpose: "demonstration", status: "sample",
        note: {
          ja: "参照の見本：以下は末尾のアーメンを含む祈り集の全文です。ミサでは司祭と会衆が唱えた後に司祭の副文が続くため、このままミサ用式文として使うものではありません。",
          vi: "Ví dụ tham chiếu: đây là toàn bộ kinh trong thư viện, gồm Amen ở cuối. Trong Thánh lễ, linh mục và cộng đoàn cùng đọc, rồi linh mục tiếp lời nguyện; bản này không phải bản văn dùng nguyên dạng trong Thánh lễ.",
        },
        sources: [{
          appliesTo: "ja", name: "カトリック中央協議会 — ミサの式次第（会衆用）",
          url: "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf",
          reference: "印刷頁30。ミサでの位置・相違の根拠のみ。祈り本文の出典は祈り集に属します。",
        }],
      },
    },
  ],
};

*/
const giftOrderUrl = "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf" as const;
const giftJapaneseSource = "カトリック中央協議会 / 日本カトリック司教協議会";
const giftReadingSource = { appliesTo: "reading" as const, name: "このプロジェクトで作成した読み方", reference: "日本語発話に対応するかな。独立した確認は未実施。" };
const giftVietnameseSource = { appliesTo: "vi" as const, name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị", reference: "Bản hỗ trợ nghĩa, chưa được kiểm chứng độc lập; không phải bản dịch CBCJ." };
const giftJapanese = (reference: string) => ({ appliesTo: "ja" as const, name: giftJapaneseSource, url: giftOrderUrl, reference });
function giftSpoken(id: string, speaker: MassPassage["speaker"], ja: string, reading: string, vi: string, page: string, optional = false) {
  return {
    id, kind: "spoken" as const, speaker, text: { ja, reading, vi }, status: "unverified" as const,
    sources: [giftJapanese(`『ミサの式次第と第一～第四奉献文』（会衆用）、印刷頁${page}。`), giftReadingSource, giftVietnameseSource],
    ...(optional ? { optional: true as const } : {}),
  };
}
function giftRubric(id: string, ja: string, vi: string, page: string) {
  return {
    id, kind: "rubric" as const, origin: "liturgical" as const, status: "unverified" as const,
    text: { ja, vi },
    sources: [giftJapanese(`『ミサの式次第と第一～第四奉献文』（会衆用）、印刷頁${page}。`), giftVietnameseSource],
  };
}
const communionJapaneseSource = (reference: string) => ({
  appliesTo: "ja" as const,
  name: giftJapaneseSource,
  url: giftOrderUrl,
  reference: `『ミサの式次第と第一～第四奉献文』（会衆用）、交わりの儀は印刷頁30–34 / PDF頁29–33。${reference} 構造の確認用。`,
});
function communionUnavailable(
  id: string,
  title: string,
  noteJa: string,
  noteVi: string,
  page: string,
  speaker?: MassPassage["speaker"],
  extra: Pick<MassUnavailableBlock, "condition" | "repeat"> = {},
): MassUnavailableBlock {
  return {
    id, kind: "unavailable", title, ...(speaker ? { speaker } : {}),
    note: { ja: noteJa, vi: noteVi }, status: "unverified",
    sources: [communionJapaneseSource(`印刷頁${page}。該当箇所の順序・役割のみ。`), giftVietnameseSource],
    ...extra,
  };
}
function communionSpoken(id: string, speaker: MassPassage["speaker"], ja: string, reading: string, vi: string, page: string) {
  return {
    id, kind: "spoken" as const, speaker, text: { ja, reading, vi }, status: "unverified" as const,
    sources: [communionJapaneseSource(`印刷頁${page}。短い固定応答。`), giftReadingSource, giftVietnameseSource],
  };
}
function communionLiturgicalRubric(id: string, ja: string, reading: string, vi: string, page: string) {
  return {
    id, kind: "rubric" as const, origin: "liturgical" as const, status: "unverified" as const,
    text: { ja, reading, vi },
    sources: [
      { appliesTo: "ja" as const, name: giftJapaneseSource, url: giftOrderUrl, reference: `『ミサの式次第と第一～第四奉献文』（会衆用）、印刷 p.${page} / PDF p.${Number(page) - 1}。CBCJ掲載の日本語指示。` },
      giftReadingSource,
      giftVietnameseSource,
    ],
  };
}

const communionSubsections: MassSubsection<MassPrayerVariantId>[] = [
  {
    id: "communion-transition",
    title: { ja: "交わりの儀への移行", vi: "Chuyển sang Nghi thức hiệp lễ" },
    blocks: [{
      id: "eucharistic-prayer-content-gap", kind: "rubric", origin: "editorial", status: "sample",
      text: {
        ja: "奉献文の本文はこの案内に未収録です。",
        reading: "（表示上の案内）",
        vi: "Trang này chưa có bản văn Kinh nguyện Thánh Thể; điều đó không có nghĩa là nghi thức này bị bỏ trong Thánh lễ.",
      },
    }],
  },
  {
    id: "communion-lords-prayer",
    title: { ja: "主の祈り", reading: "しゅのいのり", vi: "Kinh Lạy Cha" },
    blocks: [
      communionUnavailable("lords-prayer-invitation-unavailable", "主の祈りへの招き", "司祭が会衆を主の祈りに招きます。招きの本文は未収録です。", "Linh mục mời cộng đoàn đọc Kinh Lạy Cha; lời mời chưa được đưa vào.", "30", "priest"),
      { id: "lords-prayer-mass-communion-reference", kind: "prayer-variant", variantId: "lords-prayer-mass-communion" },
      communionUnavailable("lords-prayer-embolism-unavailable", "司祭の続き（副文）", "会衆の主の祈りの後、司祭が続けて祈り、その後に会衆の結びの応答があります。本文は未収録です。", "Sau phần cộng đoàn đọc kinh, linh mục đọc lời tiếp theo, rồi cộng đoàn đáp lời kết; bản văn chưa được đưa vào.", "30–31", "priest"),
      communionSpoken("lords-prayer-congregation-conclusion", "congregation", "国と力と栄光は、永遠にあなたのもの。", "くにとちからとえいこうは、とこしえにあなたのもの。", "Vì vương quyền, uy lực và vinh quang là của Chúa đến muôn đời.", "31"),
    ],
  },
  {
    id: "communion-church-peace-prayer",
    title: { ja: "教会に平和を願う祈り", vi: "Lời nguyện xin bình an cho Hội Thánh" },
    blocks: [
      communionUnavailable("church-peace-prayer-unavailable", "司祭の祈り", "司祭が教会の平和と一致を願う祈りを唱えます。本文は未収録です。", "Linh mục đọc lời nguyện xin bình an và hiệp nhất cho Hội Thánh; bản văn chưa được đưa vào.", "31", "priest"),
      communionSpoken("church-peace-prayer-amen", "congregation", "アーメン。", "アーメン。", "Amen.", "31"),
    ],
  },
  {
    id: "communion-peace-greeting",
    title: { ja: "平和のあいさつ", reading: "へいわのあいさつ", vi: "Chúc bình an" },
    blocks: [
      communionSpoken("peace-greeting-priest", "priest", "主の平和がいつも皆さんとともに。", "しゅのへいわがいつもみなさんとともに。", "Bình an của Chúa hằng ở cùng anh chị em.", "32"),
      communionSpoken("peace-greeting-congregation", "congregation", "またあなたとともに。", "またあなたとともに。", "Và ở cùng cha.", "32"),
      communionUnavailable("peace-exchange-invitation", "平和のあいさつへの招き", "状況に応じて、司祭または助祭が互いのあいさつを招きます。", "Tùy hoàn cảnh, linh mục hoặc phó tế mời mọi người trao bình an.", "32", { oneOf: ["deacon", "priest"] }, {
        condition: { ja: "状況に応じて行います。", vi: "Thực hiện tùy hoàn cảnh." },
      }),
      communionUnavailable("peace-exchange-action", "互いに平和のあいさつを交わす", "一同は地域の慣習に従って平和と一致を表します。特定の身振りは指定しません。", "Cộng đoàn trao dấu chỉ bình an theo tập quán địa phương; dự án không áp đặt cử chỉ cụ thể.", "32", undefined, {
        condition: { ja: "地域の慣習に従います。", vi: "Theo tập quán địa phương." },
      }),
    ],
  },
  {
    id: "communion-fraction",
    title: { ja: "パンの分割・平和の賛歌", reading: "ぱんのぶんかつ・へいわのさんか", vi: "Bẻ bánh · Kinh Chiên Thiên Chúa" },
    blocks: [
      communionUnavailable("fraction-action-and-priest-prayer", "パンの分割", "司祭がパンを裂きます。関連する司祭の静かな祈りの本文は未収録です。", "Linh mục bẻ bánh; lời nguyện riêng đọc thầm liên quan chưa được đưa vào.", "32", "priest"),
      communionUnavailable("lamb-of-god-unavailable", "平和の賛歌（神の小羊）", "パンを裂く間に歌うか唱えます。分割に時間がかかる場合は必要に応じて繰り返し、最後は平和を願う句で結びます。本文は未収録です。", "Hát hoặc đọc trong khi bẻ bánh; nếu cần thì lặp lại và kết thúc bằng lời xin bình an. Bản văn chưa được đưa vào.", "32", "all", {
        repeat: { rule: "while-fraction-in-progress", endsWith: "peace-invocation" },
      }),
    ],
  },
  {
    id: "communion-priest-preparation",
    title: { ja: "司祭の拝領前の祈り", vi: "Lời nguyện riêng của linh mục trước khi rước lễ" },
    blocks: [{
      id: "priest-communion-preparation-choice", kind: "choice", choiceId: "priest-communion-preparation-form",
      title: { ja: "司祭の静かな祈り（いずれか一つ）", vi: "Lời nguyện thầm của linh mục (chọn một)" },
      instruction: { ja: "式次第に示される二つの祈りのいずれかを用います。本文は未収録です。", vi: "Dùng một trong hai lời nguyện trong sách nghi thức; bản văn chưa được đưa vào." },
      status: "unverified",
      sources: [communionJapaneseSource("印刷頁33。二つの祈りの選択構造のみ。"), giftVietnameseSource],
      options: [
        { id: "priest-communion-preparation-one", title: "選択肢 1", blocks: [communionUnavailable("priest-communion-preparation-one-unavailable", "司祭の祈り", "本文未収録。", "Chưa có bản văn.", "33", "priest")] },
        { id: "priest-communion-preparation-two", title: "選択肢 2", blocks: [communionUnavailable("priest-communion-preparation-two-unavailable", "司祭の祈り", "本文未収録。", "Chưa có bản văn.", "33", "priest")] },
      ],
    }],
  },
  {
    id: "communion-invitation",
    title: { ja: "拝領への招きと応答", vi: "Lời mời và lời đáp trước khi rước lễ" },
    blocks: [
      communionUnavailable("communion-invitation-unavailable", "司祭の招き", "司祭が会衆に向け、神の小羊の食卓への招きを述べます。本文は未収録です。", "Linh mục mời cộng đoàn đến bàn tiệc Chiên Thiên Chúa; bản văn chưa được đưa vào.", "33", "priest"),
      {
        id: "communion-response-choice", kind: "choice", choiceId: "communion-response-form",
        title: { ja: "会衆の応答（いずれか一つ）", vi: "Lời đáp của cộng đoàn (chọn một)" },
        instruction: { ja: "CBCJ式次第に示される二つの応答から一つを唱えます。本文は未収録です。", vi: "Chọn một trong hai lời đáp theo sách nghi thức CBCJ; bản văn chưa có ở đây." },
        status: "unverified",
        sources: [communionJapaneseSource("印刷頁33。二つの応答の選択構造のみ。"), giftVietnameseSource],
        options: [
          { id: "communion-response-form-one", title: "応答の形式 1", blocks: [communionUnavailable("communion-response-one-unavailable", "会衆の応答", "本文未収録。", "Chưa có bản văn.", "33", "congregation")] },
          { id: "communion-response-form-two", title: "応答の形式 2", blocks: [communionUnavailable("communion-response-two-unavailable", "会衆の応答", "本文未収録。", "Chưa có bản văn.", "33", "congregation")] },
        ],
      },
    ],
  },
  {
    id: "communion-priest-reception",
    title: { ja: "司祭の拝領と拝領の歌", vi: "Linh mục rước lễ và ca hiệp lễ" },
    blocks: [
      {
        id: "communion-priest-reception-boundary",
        kind: "rubric",
        origin: "liturgical",
        status: "unverified",
        text: {
          ja: "司祭がキリストの御からだを拝領している間に、拝領の歌を始める。",
          reading: "しさいがキリストのおからだをはいりょうしているあいだに、はいりょうのうたをはじめる。",
          vi: "Ca hiệp lễ bắt đầu trong khi linh mục rước Mình Thánh Chúa.",
        },
        sources: [
          { appliesTo: "ja", name: giftJapaneseSource, url: giftOrderUrl, reference: "『ミサの式次第と第一～第四奉献文』（会衆用）、印刷 p.33 / PDF p.32。CBCJ掲載の日本語指示。" },
          giftVietnameseSource,
        ],
      },
      communionUnavailable("communion-priest-host-reception-unavailable", "司祭の御からだの拝領", "司祭の拝領前の祈りと御からだの拝領の位置です。祈りの本文は未収録です。", "Vị trí lời nguyện trước khi rước lễ và việc linh mục rước Mình Thánh; bản văn lời nguyện chưa được đưa vào.", "33", "priest"),
      { id: "communion-song-slot", kind: "variable", slot: "communion-song", speaker: "all" },
      communionUnavailable("communion-priest-chalice-reception-unavailable", "司祭の御血の拝領", "司祭は続いてカリスを取り、静かな祈りを唱えて御血を拝領します。祈りの本文は未収録です。", "Sau đó linh mục cầm chén thánh, đọc thầm lời nguyện và rước Máu Thánh; bản văn lời nguyện chưa được đưa vào.", "33", "priest"),
    ],
  },
  {
    id: "communion-distribution",
    title: { ja: "拝領", reading: "はいりょう", vi: "Rước lễ" },
    blocks: [
      {
        id: "communion-song-continues-during-distribution",
        kind: "rubric",
        origin: "editorial",
        status: "unverified",
        text: {
          ja: "この案内では、拝領の歌が拝領者への配布中も続くことを示しています。",
          reading: "このあんないでは、はいりょうのうたがはいりょうしゃへのはいふちゅうもつづくことをしめしています。",
          vi: "Ca hiệp lễ tiếp tục trong khi trao Mình Thánh cho các tín hữu.",
        },
        sources: [
          { appliesTo: "ja", name: "プロジェクトによる案内", reference: "CBCJの拝領順序を踏まえた説明。日本語はCBCJ本文の引用ではありません。" },
          giftReadingSource,
          giftVietnameseSource,
        ],
      },
      communionUnavailable("communion-host-formula-unavailable", "聖体拝領の司祭のことば", "司祭がホスティアを一人ひとりに示して述べることばは未収録です。", "Linh mục nói lời cố định khi trao Mình Thánh cho từng người; phần này chưa được đưa vào.", "33", "priest"),
      communionSpoken("communion-recipient-amen", "communicant", "アーメン。", "アーメン。", "Amen.", "33"),
      {
        id: "communion-species-form-choice", kind: "choice", choiceId: "communion-species-form",
        title: { ja: "御血の拝領方法", vi: "Cách rước lễ với Máu Thánh" },
        instruction: { ja: "該当する場合の形式です。実際に用いる形式を一つ選びます。", vi: "Các hình thức tùy trường hợp; chỉ dùng hình thức thích hợp." },
        status: "unverified",
        sources: [communionJapaneseSource("印刷頁33–34。役割・応答の条件構造のみ。"), giftVietnameseSource],
        options: [
          { id: "communion-chalice-form", title: "カリスによる拝領", blocks: [
            communionUnavailable("communion-chalice-priest-formula", "司祭のことば", "本文未収録。", "Chưa có bản văn.", "33–34", "priest"),
            communionUnavailable("communion-chalice-communicant-response", "拝領者の応答", "本文未収録。", "Chưa có bản văn.", "33–34", "communicant"),
          ] },
          { id: "communion-both-species-form", title: "両形態による拝領", blocks: [
            communionUnavailable("communion-both-species-priest-formula", "司祭のことば", "本文未収録。", "Chưa có bản văn.", "34", "priest"),
            communionUnavailable("communion-both-species-communicant-response", "拝領者の応答", "本文未収録。", "Chưa có bản văn.", "34", "communicant"),
          ] },
        ],
      },
    ],
  },
  {
    id: "communion-purification",
    title: { ja: "拝領後の器の清め", vi: "Tráng chén sau khi rước lễ" },
    blocks: [
      {
        id: "communion-vessels-purification",
        kind: "rubric",
        origin: "liturgical",
        status: "unverified",
        text: {
          ja: "聖体の授与が終わると、司祭はパテナをふき、カリスをすすぐ。",
          reading: "せいたいのじゅよがおわると、しさいはパテナをふき、カリスをすすぐ。",
          vi: "Sau khi trao lễ xong, linh mục tráng đĩa thánh và chén thánh.",
        },
        sources: [
          { appliesTo: "ja", name: giftJapaneseSource, url: giftOrderUrl, reference: "『ミサの式次第と第一～第四奉献文』（会衆用）、印刷 p.34 / PDF p.33。CBCJ掲載の日本語指示。" },
          giftVietnameseSource,
        ],
      },
      communionUnavailable("communion-priest-post-distribution-prayer-unavailable", "司祭の静かな祈り", "器を清める際に司祭が静かに唱える祈りの本文は未収録です。", "Bản văn lời nguyện linh mục đọc thầm khi tráng chén chưa được đưa vào.", "34", "priest"),
    ],
  },
  {
    id: "communion-after-silence",
    title: { ja: "拝領後の祈り", vi: "Cầu nguyện sau khi rước lễ" },
    blocks: [
      communionLiturgicalRubric("communion-silence-rubric", "拝領後、一同はしばらく沈黙のうちに祈る。", "はいりょうご、いちどうはしばらくちんもくのうちにいのる。", "Sau khi rước lễ, mọi người cầu nguyện thinh lặng trong giây lát.", "34"),
      { id: "optional-post-communion-song-slot", kind: "variable", slot: "post-communion-song", speaker: "all", optional: true },
      communionSpoken("prayer-after-communion-invitation", "priest", "祈りましょう。", "いのりましょう。", "Chúng ta hãy cầu nguyện.", "34"),
      communionLiturgicalRubric("prayer-after-communion-silence", "一同は司祭とともにしばらく沈黙のうちに祈る。", "いちどうはしさいとともにしばらくちんもくのうちにいのる。", "Trước lời nguyện, cộng đoàn cùng linh mục thinh lặng cầu nguyện trong giây lát.", "34"),
      { id: "prayer-after-communion-slot", kind: "variable", slot: "prayer-after-communion", speaker: "priest", note: { ja: "祭儀に応じた拝領祈願は未提供です。", reading: "さいぎにおうじたはいりょうきがんはみていきょうです。", vi: "Chưa có lời nguyện hiệp lễ riêng của ngày cử hành này." } },
      communionSpoken("prayer-after-communion-amen", "congregation", "アーメン。", "アーメン。", "Amen.", "34"),
    ],
  },
];

const offeringBreadJa = "神よ、あなたは万物の造り主。\nここに供えるパンはあなたからいただいたもの、\n大地の恵み、労働の実り、\nわたしたちのいのちの糧となるものです。";
const offeringBreadReading = "かみよ、あなたはばんぶつのつくりぬし。\nここにそなえるパンはあなたからいただいたもの、\nだいちのめぐみ、ろうどうのみのり、\nわたしたちのいのちのかてとなるものです。";
const offeringWineJa = "神よ、あなたは万物の造り主。\nここに供えるぶどう酒はあなたからいただいたもの、\n大地の恵み、労働の実り、\nわたしたちの救いの杯となるものです。";
const offeringWineReading = "かみよ、あなたはばんぶつのつくりぬし。\nここにそなえるぶどうしゅはあなたからいただいたもの、\nだいちのめぐみ、ろうどうのみのり、\nわたしたちのすくいのさかずきとなるものです。";
const giftDeliverySources = [giftJapanese("『ミサの式次第と第一～第四奉献文』（会衆用）、印刷頁8。"), giftVietnameseSource] as const;
const giftDeliveryInstruction = { ja: "奉納の歌の有無に応じた式文の唱え方です。該当する一方を用います。", vi: "Cách đọc tùy theo có hát ca tiến lễ hay không; chỉ dùng một cách phù hợp." };
const giftPreparationSubsections: MassSubsection<MassPrayerVariantId>[] = [
  {
    id: "gift-preparation", title: { ja: "供えものの準備", reading: "そなえもののじゅんび", vi: "Chuẩn bị lễ vật" },
    blocks: [
      giftRubric("gifts-procession", "ことばの典礼が終わると奉納の歌が始まる。その間に、奉仕者が感謝の典礼に必要なものを祭壇に準備する。信者の代表はパンとぶどう酒、その他の供えものを運ぶ。", "Sau Phụng vụ Lời Chúa, ca tiến lễ bắt đầu. Trong lúc đó, các thừa tác viên chuẩn bị những gì cần thiết cho Phụng vụ Thánh Thể trên bàn thờ; đại diện tín hữu mang bánh, rượu và các lễ vật khác lên.", "8"),
      {
        id: "bread-presentation-choice", kind: "choice", choiceId: "bread-presentation-mode", status: "unverified",
        title: { ja: "パンを供える祈りの唱え方", reading: "パンをそなえるいのりのとなえかた", vi: "Lời nguyện dâng bánh" },
        instruction: giftDeliveryInstruction,
        sources: giftDeliverySources,
        options: [
          { id: "bread-quiet", title: "奉納の歌を歌う場合（小声）", blocks: [
            giftRubric("bread-quiet-rubric", "司祭は祭壇に行き、パンを載せたパテナを取り、両手で祭壇上に少し持ち上げ、次の祈りを小声で唱える。", "Linh mục đến bàn thờ, cầm đĩa thánh có bánh, nâng nhẹ trên bàn thờ và đọc thầm lời nguyện sau.", "8"),
            giftSpoken("bread-offering-prayer-quiet", "priest", offeringBreadJa, offeringBreadReading, "Lạy Chúa là Đấng tạo thành muôn vật.\nBánh chúng con dâng tiến đây là do Chúa ban,\nlà hoa màu ruộng đất và công lao của con người,\nđể trở nên bánh nuôi sống chúng con.", "8"),
          ] },
          { id: "bread-audible", title: "奉納の歌を歌わない場合（はっきり唱える）", condition: { ja: "司祭は祈りをはっきりと唱えます。結びに会衆は応答することができます。", vi: "Linh mục đọc rõ lời nguyện; cộng đoàn có thể đáp lại ở cuối lời nguyện." }, blocks: [
            giftSpoken("bread-offering-prayer-audible", "priest", offeringBreadJa, offeringBreadReading, "Lạy Chúa là Đấng tạo thành muôn vật.\nBánh chúng con dâng tiến đây là do Chúa ban,\nlà hoa màu ruộng đất và công lao của con người,\nđể trở nên bánh nuôi sống chúng con.", "8"),
            giftSpoken("bread-offering-response", "congregation", "神よ、あなたは万物の造り主。", "かみよ、あなたはばんぶつのつくりぬし。", "Lạy Chúa là Đấng tạo thành muôn vật.", "8", true),
          ] },
        ],
      },
      giftRubric("wine-and-water-preparation", "助祭または司祭は、ぶどう酒と少量の水をカリスに注いで静かに唱える。", "Phó tế hoặc linh mục rót một ít nước vào chén cùng với rượu và đọc thầm.", "8"),
      giftSpoken("water-and-wine-prayer", { oneOf: ["deacon", "priest"] }, "この水とぶどう酒の神秘によってわたしたちが、\n人となられたかたの神性にあずかることができますように。", "このみずとぶどうしゅのしんぴによってわたしたちが、\nひととなられたかたのしんせいにあずかることができますように。", "Xin cho chúng con, nhờ mầu nhiệm nước và rượu này, được thông phần vào thần tính của Đấng đã làm người.", "8"),
      {
        id: "wine-presentation-choice", kind: "choice", choiceId: "wine-presentation-mode", status: "unverified",
        title: { ja: "ぶどう酒を供える祈りの唱え方", reading: "ぶどうしゅをそなえるいのりのとなえかた", vi: "Lời nguyện dâng rượu" },
        instruction: giftDeliveryInstruction,
        sources: giftDeliverySources,
        options: [
          { id: "wine-quiet", title: "奉納の歌を歌う場合（小声）", blocks: [
            giftRubric("wine-quiet-rubric", "司祭はカリスを取り、両手で祭壇上に少し持ち上げ、次の祈りを小声で唱える。", "Linh mục cầm chén, nâng nhẹ trên bàn thờ và đọc thầm lời nguyện sau.", "8"),
            giftSpoken("wine-offering-prayer-quiet", "priest", offeringWineJa, offeringWineReading, "Lạy Chúa là Đấng tạo thành muôn vật.\nRượu chúng con dâng tiến đây là do Chúa ban,\nlà hoa màu ruộng đất và công lao của con người,\nđể trở nên chén cứu độ chúng con.", "8"),
          ] },
          { id: "wine-audible", title: "奉納の歌を歌わない場合（はっきり唱える）", condition: { ja: "司祭は祈りをはっきりと唱えます。結びに会衆は応答することができます。", vi: "Linh mục đọc rõ lời nguyện; cộng đoàn có thể đáp lại ở cuối lời nguyện." }, blocks: [
            giftSpoken("wine-offering-prayer-audible", "priest", offeringWineJa, offeringWineReading, "Lạy Chúa là Đấng tạo thành muôn vật.\nRượu chúng con dâng tiến đây là do Chúa ban,\nlà hoa màu ruộng đất và công lao của con người,\nđể trở nên chén cứu độ chúng con.", "8"),
            giftSpoken("wine-offering-response", "congregation", "神よ、あなたは万物の造り主。", "かみよ、あなたはばんぶつのつくりぬし。", "Lạy Chúa là Đấng tạo thành muôn vật.", "8", true),
          ] },
        ],
      },
      giftRubric("offering-bow-rubric", "その後、司祭は深く頭を下げ、静かに唱える。", "Sau đó, linh mục cúi sâu và đọc thầm.", "8"),
      giftSpoken("offering-bow-prayer", "priest", "神よ、心から悔い改めるわたしたちが受け入れられ、\nきょう、み前に供えるいけにえも、み心にかなうものとなりますように。", "かみよ、こころからくいあらためるわたしたちがうけいれられ、\nきょう、みまえにそなえるいけにえも、みこころにかなうものとなりますように。", "Lạy Chúa, xin thương nhận chúng con là những người thật lòng sám hối, và xin cho lễ tế chúng con dâng hôm nay đẹp lòng Chúa.", "8"),
      giftRubric("washing-hands-rubric", "続いて、司祭は祭壇の脇で手を洗い、静かに唱える。", "Tiếp đó, linh mục rửa tay bên cạnh bàn thờ và đọc thầm.", "9"),
      giftSpoken("washing-hands-prayer", "priest", "神よ、わたしの汚れを洗い、罪から清めてください。", "かみよ、わたしのけがれをあらい、つみからきよめてください。", "Lạy Chúa, xin rửa con sạch mọi lỗi lầm và thanh tẩy con khỏi tội lỗi.", "9"),
      giftRubric("invitation-stand-rubric", "司祭は祭壇の中央に立ち、会衆に向かって手を広げ、次の招きのことばを述べてから手を合わせる。会衆は立って答える。", "Linh mục đứng giữa bàn thờ, hướng về cộng đoàn, dang tay mời gọi rồi chắp tay; cộng đoàn đứng lên đáp.", "9"),
      giftSpoken("prayer-over-offerings-invitation", "priest", "皆さん、ともにささげるこのいけにえを、\n全能の父である神が受け入れてくださるよう祈りましょう。", "みなさん、ともにささげるこのいけにえを、\nぜんのうのちちであるかみがうけいれてくださるよういのりましょう。", "Anh chị em hãy cầu nguyện để Thiên Chúa là Cha toàn năng vui nhận hy lễ chúng ta cùng dâng.", "9"),
      giftSpoken("prayer-over-offerings-response", "congregation", "神の栄光と賛美のため、\nまたわたしたちと全教会のために、\nあなたの手を通しておささげするいけにえを、\n神が受け入れてくださいますように。", "かみのえいこうとさんびのため、\nまたわたしたちとぜんきょうかいのために、\nあなたのてをとおしておささげするいけにえを、\nかみがうけいれてくださいますように。", "Xin Chúa vui nhận hy lễ do tay cha dâng tiến, để tôn vinh và ca tụng Thiên Chúa, cũng như mưu ích cho chúng con và toàn thể Hội Thánh.", "9"),
      giftRubric("prayer-over-offerings-silence", "一同はその後、しばらく沈黙のうちに祈る。", "Sau đó, mọi người thinh lặng cầu nguyện trong giây lát.", "9"),
    ],
  },
  {
    id: "prayer-over-offerings", title: { ja: "奉納祈願", reading: "ほうのうきがん", vi: "Lời nguyện tiến lễ" },
    blocks: [
      { id: "offerings-prayer-slot", kind: "variable", slot: "prayer-over-offerings", speaker: "priest", note: { ja: "祭日・記念日などに応じた祈願本文は未提供です。", vi: "Chưa có bản văn lời nguyện riêng cho ngày lễ này." } },
      giftRubric("offerings-prayer-ending-rubric", "司祭は手を広げて奉納祈願を唱え、会衆は結びにはっきりと唱える。", "Linh mục dang tay đọc lời nguyện tiến lễ; cộng đoàn đáp rõ ở phần kết.", "9"),
      giftSpoken("offerings-prayer-amen", "congregation", "アーメン。", "アーメン。", "Amen.", "9"),
    ],
  },
  {
    id: "eucharistic-prayer-transition", title: { ja: "奉献文（エウカリスティアの祈り）への移行", reading: "ほうけんぶん（エウカリスティアのいのり）へのいこう", vi: "Dẫn vào Kinh nguyện Thánh Thể" },
    blocks: [
      giftRubric("eucharistic-prayer-begins", "司祭は奉献文を始める。", "Linh mục bắt đầu Kinh nguyện Thánh Thể.", "10"),
      giftSpoken("preface-dialogue-priest-greeting", "priest", "主は皆さんとともに。", "しゅはみなさんとともに。", "Chúa ở cùng anh chị em.", "10"),
      giftSpoken("preface-dialogue-congregation-greeting", "congregation", "またあなたとともに。", "またあなたとともに。", "Và ở cùng cha.", "10"),
      giftSpoken("preface-dialogue-priest-heart", "priest", "心をこめて、", "こころをこめて、", "Hãy nâng tâm hồn lên.", "10"),
      giftSpoken("preface-dialogue-congregation-heart", "congregation", "神を仰ぎ、", "かみをあおぎ、", "Chúng con đang hướng về Chúa.", "10"),
      giftSpoken("preface-dialogue-priest-thanks", "priest", "賛美と感謝をささげましょう。", "さんびとかんしゃをささげましょう。", "Hãy tạ ơn Chúa là Thiên Chúa chúng ta.", "10"),
      giftSpoken("preface-dialogue-congregation-thanks", "congregation", "それはとうとい大切な務め（です）。", "それはとうといたいせつなつとめ（です）。", "Thật là chính đáng.", "10"),
      { id: "preface-slot", kind: "variable", slot: "preface", speaker: "priest", note: { ja: "叙唱本文は祭儀に応じて選ばれます。ここでは特定の叙唱を追加していません。", vi: "Kinh Tiền Tụng được chọn theo cử hành; ở đây không tự ý thêm bản văn cụ thể." } },
      giftRubric("sanctus-rubric", "叙唱の終わりに、会衆は司祭とともに感謝の賛歌（サンクトゥス）を歌うか、はっきりと唱える。", "Cuối Kinh Tiền Tụng, cộng đoàn cùng linh mục hát hoặc đọc rõ Kinh Thánh Thánh.", "10"),
      giftSpoken("sanctus", "all", "聖なる、聖なる、聖なる神、すべてを治める神なる主。\n主の栄光は天地に満つ。\n天には神にホザンナ。\n主の名によって来られるかたに賛美。\n天には神にホザンナ。", "せいなる、せいなる、せいなるかみ、すべてをおさめるかみなるしゅ。\nしゅのえいこうはてんちにみつ。\nてんにはかみにホザンナ。\nしゅのなによってこられるかたにさんび。\nてんにはかみにホザンナ。", "Thánh, Thánh, Thánh, Chúa là Thiên Chúa các đạo binh.\nTrời đất đầy vinh quang Chúa.\nHoan hô Chúa trên các tầng trời.\nChúc tụng Đấng ngự đến nhân danh Chúa.\nHoan hô Chúa trên các tầng trời.", "10"),
      { id: "eucharistic-prayer-selector", kind: "eucharistic-prayer-selector" },
    ],
  },
];

/** Partially populated from the implemented CBCJ 2022 order; the Mass remains incomplete. */
export const massOrder = {
  status: "partial",
  structureSources: [
    {
      name: "カトリック中央協議会 — ミサの式次第（2022新版）",
      url: "https://www.cbcj.catholic.jp/publish/mass2022/",
      reference: "目次・2022年11月27日実施。構成の参照のみ。見本の式文・読み・ベトナム語の出典ではありません。",
    },
    {
      name: "カトリック中央協議会 — ミサの式次第と第一～第四奉献文（会衆用）",
      url: "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf",
      reference: "構成・役割・可変部分の参照（印刷頁1–9、30–38）。本文はこの見本に転載していません。",
    },
    {
      name: "カトリック中央協議会 — 感謝の典礼・主の祈りとパンの分割",
      url: "https://www.cbcj.catholic.jp/2018/03/14/16743/",
      reference: "交わりの儀が感謝の典礼に含まれることの背景資料。",
    },
    {
      name: "カトリック中央協議会 — 新しい「ミサの式次第」の変更箇所",
      url: wordChangesUrl,
      reference: "ことばの典礼の解説：詠唱の季節条件（印刷頁28）、福音後・説教・信条（頁29～30）。構造と条件の確認用。",
    },
    {
      name: "カトリック中央協議会 — ローマ・ミサ典礼書の総則（暫定版）",
      url: "https://www.cbcj.catholic.jp/wp-content/uploads/2004/05/sosoku2.pdf",
      reference: "第71項・印刷頁27：共同祈願の司式、意向を告げる役割と会衆応答。役割根拠のみ。",
    },
  ],
  sections: [
    {
      id: "introductory",
      subsections: [...openingSubsections, {
        id: "opening-proper", title: { ja: "その日の祈願", vi: "Lời nguyện theo ngày lễ" },
        blocks: [{ id: "collect-slot", kind: "variable", slot: "collect", speaker: "priest" }],
      }],
    },
    {
      id: "word",
      subsections: wordSubsections,
    },
    {
      id: "eucharist",
      subsections: giftPreparationSubsections, /*
        id: "eucharistic-outline", title: { ja: "奉納・奉献文の表示枠", vi: "Chuẩn bị lễ vật và Kinh nguyện Thánh Thể" },
        blocks: [
          { id: "offerings-slot", kind: "variable", slot: "prayer-over-offerings", speaker: "priest" },
          { id: "preface-slot", kind: "variable", slot: "preface", speaker: "priest" },
          {
            id: "eucharistic-incomplete", kind: "rubric", origin: "editorial", status: "sample",
            text: { ja: "表示案内：奉献文・応答などの式文は未収録です。奉献文の選択肢を、その日の朗読と同じ可変本文にはしていません。", vi: "Ghi chú hiển thị: chưa có Kinh nguyện Thánh Thể và các lời đáp. Các mẫu Kinh nguyện khác nhau không được coi là bài đọc thay đổi theo ngày." },
          },
        ],
      */
    },
    {
      id: "communion",
      subsections: communionSubsections,
    },
    {
      id: "concluding",
      subsections: [{
        id: "concluding-notices", title: { ja: "お知らせ", vi: "Thông báo" },
        blocks: [closingRubric("concluding-notices-rubric", "必要があれば、会衆への短いお知らせが行われる。", "Nếu cần, có thể thông báo ngắn với cộng đoàn.")],
      }, {
        id: "concluding-greeting", title: { ja: "派遣の祝福へのあいさつ", vi: "Lời chào trước phép lành sai đi" },
        blocks: [{
          id: "concluding-greeting-choice", kind: "choice", choiceId: "concluding-presider-greeting", status: "unverified",
          title: { ja: "司式者によるあいさつ", vi: "Lời chào theo vị chủ sự" },
          instruction: { ja: "司祭司式と司教司式の該当する一方を用います。自動選択はありません。", vi: "Dùng một hình thức phù hợp với linh mục hoặc giám mục chủ sự; ứng dụng không tự chọn." },
          sources: closingSources,
          options: [
            { id: "concluding-priest-greeting", title: "司祭司式", condition: { ja: "通常の司祭司式の場合。", vi: "Khi linh mục chủ sự theo nghi thức thông thường." }, blocks: [
              closingRubric("concluding-priest-greeting-rubric", "司祭は会衆に向かって手を広げて言う。", "Linh mục dang tay hướng về cộng đoàn và nói."),
              closingSpoken("concluding-priest-greeting-line", "priest", "主は皆さんとともに。", "しゅはみなさんとともに。", "Chúa ở cùng anh chị em."),
              closingSpoken("concluding-priest-greeting-response", "congregation", "またあなたとともに。", "またあなたとともに。", "Và ở cùng cha."),
            ] },
            { id: "concluding-bishop-greeting", title: "司教司式", condition: { ja: "司教が司式するミサの場合。", vi: "Khi giám mục chủ sự Thánh lễ." }, blocks: [
              closingRubric("concluding-bishop-greeting-rubric", "司教が司式するミサでは、司式司教はミトラを着け、手を広げて唱える。", "Trong Thánh lễ do giám mục chủ sự, ngài đội mũ giám mục, dang tay và đọc."),
              closingSpoken("concluding-bishop-greeting-line", "bishop", "主は皆さんとともに。", "しゅはみなさんとともに。", "Chúa ở cùng anh chị em."),
              closingSpoken("concluding-bishop-greeting-response", "congregation", "またあなたとともに。", "またあなたとともに。", "Và ở cùng Đức cha."),
              closingSpoken("concluding-bishop-name-blessing", "bishop", "主のみ名がいつもたたえられますように。", "しゅのみながいつもたたえられますように。", "Chúc tụng danh Chúa đến muôn đời."),
              closingSpoken("concluding-bishop-name-response", "congregation", "いまよりとこしえに。", "いまよりとこしえに。", "Từ bây giờ và mãi mãi."),
              closingSpoken("concluding-bishop-help", "bishop", "主のみ名はわたしたちの助け。", "しゅのみなはわたしたちのたすけ。", "Danh Chúa là nguồn trợ giúp chúng ta."),
              closingSpoken("concluding-bishop-help-response", "congregation", "主は天地の造り主。", "しゅはてんちのつくりぬし。", "Chúa là Đấng tạo thành trời đất."),
            ] },
          ],
        }],
      }, {
        id: "concluding-blessing", title: { ja: "派遣の祝福", vi: "Phép lành sai đi" },
        blocks: [
          {
            id: "concluding-proper-blessing-choice", kind: "choice", choiceId: "concluding-proper-blessing", status: "unverified",
            title: { ja: "一定の日・状況における祝福（該当時）", vi: "Phép lành riêng vào những ngày hoặc hoàn cảnh thích hợp" },
            instruction: { ja: "典礼注記に該当する場合のみ、いずれか一方を用います。本文は未収録です。", vi: "Chỉ dùng một hình thức khi ghi chú phụng vụ quy định; bản văn hiện chưa được cung cấp." },
            sources: closingSources,
            options: [
              { id: "concluding-no-proper-blessing", title: "固有の祝福形式なし（通常の祝福へ）", condition: { ja: "典礼注記による固有形式が指定されていない通常の場合。", vi: "Trường hợp thông thường, không có ghi chú phụng vụ chỉ định phép lành riêng." }, blocks: [
                { id: "concluding-no-proper-blessing-guidance", kind: "rubric", origin: "editorial", status: "unverified", text: { ja: "追加の形式を行わず、下の通常の祝福に進みます。", vi: "Không thêm nghi thức này; tiếp tục với phép lành thông thường bên dưới." } },
              ] },
              { id: "concluding-solemn-blessing", title: "荘厳な祝福", condition: { ja: "該当する典礼注記がある場合。", vi: "Khi có ghi chú phụng vụ tương ứng." }, blocks: [
                { id: "concluding-solemn-blessing-slot", kind: "variable", slot: "solemn-blessing", speaker: "priest", note: { ja: "該当する祝福本文は未提供です。", vi: "Chưa có bản văn phép lành tương ứng." } },
              ] },
              { id: "concluding-prayer-over-people", title: "会衆のための祈願", condition: { ja: "該当する典礼注記がある場合。", vi: "Khi có ghi chú phụng vụ tương ứng." }, blocks: [
                { id: "concluding-prayer-over-people-slot", kind: "variable", slot: "prayer-over-the-people", speaker: "priest", note: { ja: "該当する祈願本文は未提供です。", vi: "Chưa có bản văn lời nguyện tương ứng." } },
              ] },
            ],
          },
          closingRubric("concluding-blessing-rubric", "司祭は会衆を祝福して唱える。", "Linh mục đọc lời chúc lành trên cộng đoàn."),
          closingSpoken("concluding-blessing-formula", { oneOf: ["priest", "bishop"] }, "全能の神、父と子と聖霊の祝福が皆さんの上にありますように。", "ぜんのうのかみ、ちちとことせいれいのしゅくふくがみなさんのうえにありますように。", "Xin Thiên Chúa toàn năng là Cha, và Con, và Thánh Thần ban phúc lành cho anh chị em."),
          closingSpoken("concluding-blessing-response", "congregation", "アーメン。", "アーメン。", "Amen."),
        ],
      }, {
        id: "concluding-dismissal", title: { ja: "派遣", vi: "Sai đi" },
        blocks: [
          closingRubric("concluding-following-rite-rubric", "他の祭儀が続く場合、派遣の式は省かれる。", "Nếu tiếp tục một nghi thức khác thì bỏ phần sai đi."),
          {
            id: "concluding-dismissal-choice", kind: "choice", choiceId: "concluding-dismissal-form", status: "unverified",
            title: { ja: "派遣のことば（いずれか一つ）", vi: "Lời sai đi (chọn một hình thức)" },
            instruction: { ja: "助祭または司祭が、許可された三つの形式から一つを用います。", vi: "Phó tế hoặc linh mục dùng một trong ba công thức được phép." },
            sources: closingSources,
            options: [
              { id: "concluding-dismissal-peace", title: "主の平和のうちに", blocks: [closingSpoken("concluding-dismissal-peace-line", { oneOf: ["deacon", "priest"] }, "感謝の祭儀を終わります。\n行きましょう、主の平和のうちに。", "かんしゃのさいぎをおわります。\nいきましょう、しゅのへいわのうちに。", "Lễ tế Tạ Ơn đã kết thúc.\nChúng ta hãy ra đi bình an." )] },
              { id: "concluding-dismissal-gospel", title: "主の福音を告げ知らせるために", blocks: [closingSpoken("concluding-dismissal-gospel-line", { oneOf: ["deacon", "priest"] }, "（感謝の祭儀を終わります。）\n行きましょう、主の福音を告げ知らせるために。", "（かんしゃのさいぎをおわります。）\nいきましょう、しゅのふくいんをつげしらせるために。", "(Lễ tế Tạ Ơn đã kết thúc.)\nChúng ta hãy ra đi loan báo Tin Mừng của Chúa." )] },
              { id: "concluding-dismissal-glory", title: "日々の生活の中で主の栄光をあらわすために", blocks: [closingSpoken("concluding-dismissal-glory-line", { oneOf: ["deacon", "priest"] }, "（感謝の祭儀を終わります。）\n平和のうちに行きましょう、日々の生活の中で主の栄光をあらわすために。", "（かんしゃのさいぎをおわります。）\nへいわのうちにいきましょう、ひびのせいかつのなかでしゅのえいこうをあらわすために。", "(Lễ tế Tạ Ơn đã kết thúc.)\nChúng ta hãy ra đi bình an, làm sáng danh Chúa trong đời sống hằng ngày." )] },
            ],
          },
          closingSpoken("concluding-dismissal-response", "congregation", "神に感謝。", "かみにかんしゃ。", "Tạ ơn Chúa."),
          closingRubric("concluding-departure-rubric", "開祭と同じように、司祭は奉仕者とともに祭壇に表敬してから退堂する。", "Như lúc khai lễ, linh mục cùng các thừa tác viên kính chào bàn thờ rồi rời cung thánh."),
          { id: "concluding-end-marker", kind: "rubric", origin: "editorial", status: "unverified", text: { ja: "このアプリのミサ式次第表示はここで終わります。別の祈りは自動で続きません。", vi: "Phần trình bày Thánh lễ trong ứng dụng kết thúc tại đây; không tự động nối sang kinh nguyện khác." } },
        ],
      }],
    },
  ],
} as const satisfies MassOrder<MassPrayerVariantId>;

validateMass(massOrder, {}, massPrayerVariants);
