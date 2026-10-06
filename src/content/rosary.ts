import type { PrayerId } from "./prayers";
import type { BilingualText, ContentSource, ContentVerification, PrayerReference } from "./types";

export type MysterySetId = "joyful" | "luminous" | "sorrowful" | "glorious";
type Mystery = { title: BilingualText & { reading: string } };
export type MysterySet = {
  id: MysterySetId;
  title: BilingualText & { reading: string };
  weekdayGuidance?: BilingualText;
  mysteries: readonly [Mystery, Mystery, Mystery, Mystery, Mystery];
} & ContentVerification;

const weekdaySource: ContentSource = {
  appliesTo: "ja", name: "女子パウロ会 Laudate — 山本襄治神父のロザリオの祈り",
  url: "https://www.pauline.or.jp/prayingtime/rosario02.php",
  reference: "曜日の提案と開始時の祈り順。曜日は目安で、選択を制限しません。",
};
function sources(url: ContentSource["url"]): readonly ContentSource[] {
  return [
    { appliesTo: "ja", name: "女子パウロ会 Laudate — 山本襄治神父のロザリオの祈り", url,
      reference: "各神秘の短い見出しのみ。黙想本文や聖書本文は転載していません。",
      reproductionNote: "サイトは画像・文章の無断転載を控えるよう求めています。追加の転載許可は確認していません。" },
    weekdaySource,
    { appliesTo: "reading", name: "このプロジェクトで作成した読み方", reference: "見出しの学習用かな。独立した確認は未実施。" },
    { appliesTo: "vi", name: "Nội dung tiếng Việt hỗ trợ của dự án", reference: "Các mô tả ngắn do dự án chuẩn bị, chưa được kiểm chứng độc lập; không phải bản dịch chính thức của nguồn tiếng Nhật." },
  ];
}

export const mysterySets: readonly MysterySet[] = [
  {
    id: "joyful", title: { ja: "喜びの神秘", reading: "よろこびのしんぴ", vi: "Năm Sự Vui" },
    weekdayGuidance: { ja: "月曜日・土曜日（目安）", vi: "Thứ Hai và thứ Bảy (gợi ý)" },
    status: "unverified", sources: sources("https://www.pauline.or.jp/prayingtime/rosario02.php"),
    mysteries: [
      { title: { ja: "お告げ", reading: "おつげ", vi: "Thiên thần truyền tin cho Đức Bà." } },
      { title: { ja: "ご訪問", reading: "ごほうもん", vi: "Đức Bà thăm viếng bà Êlisabét." } },
      { title: { ja: "ご降誕", reading: "ごこうたん", vi: "Đức Bà sinh Đức Chúa Giêsu." } },
      { title: { ja: "ご奉献", reading: "ごほうけん", vi: "Đức Bà dâng Đức Chúa Giêsu trong đền thánh." } },
      { title: { ja: "神殿での少年イエス", reading: "しんでんでのしょうねんイエス", vi: "Đức Bà tìm được Đức Chúa Giêsu trong đền thánh." } },
    ],
  },
  {
    id: "luminous", title: { ja: "光の神秘", reading: "ひかりのしんぴ", vi: "Năm Sự Sáng" },
    weekdayGuidance: { ja: "木曜日（目安）", vi: "Thứ Năm (gợi ý)" },
    status: "unverified", sources: sources("https://www.pauline.or.jp/prayingtime/rosario02_light.php"),
    mysteries: [
      { title: { ja: "イエスの洗礼", reading: "イエスのせんれい", vi: "Đức Chúa Giêsu chịu phép rửa tại sông Giođan." } },
      { title: { ja: "カナの婚礼で水をぶどう酒に変える", reading: "カナのこんれいでみずをぶどうしゅにかえる", vi: "Đức Chúa Giêsu làm phép lạ tại tiệc cưới Cana." } },
      { title: { ja: "イエスの宣教のはじめ", reading: "イエスのせんきょうのはじめ", vi: "Đức Chúa Giêsu rao giảng Nước Trời và kêu gọi sám hối." } },
      { title: { ja: "イエスの変容", reading: "イエスのへんよう", vi: "Đức Chúa Giêsu biến hình trên núi." } },
      { title: { ja: "最後の晩餐での聖体の秘跡の制定", reading: "さいごのばんさんでのせいたいのひせきのせいてい", vi: "Đức Chúa Giêsu lập Bí tích Thánh Thể." } },
    ],
  },
  {
    id: "sorrowful", title: { ja: "苦しみの神秘", reading: "くるしみのしんぴ", vi: "Năm Sự Thương" },
    weekdayGuidance: { ja: "火曜日・金曜日（目安）", vi: "Thứ Ba và thứ Sáu (gợi ý)" },
    status: "unverified", sources: sources("https://www.pauline.or.jp/prayingtime/rosario02_suffor.php"),
    mysteries: [
      { title: { ja: "ゲッセマネでの祈り", reading: "ゲッセマネでのいのり", vi: "Đức Chúa Giêsu lo buồn đổ mồ hôi máu trong vườn." } },
      { title: { ja: "鞭打ち", reading: "むちうち", vi: "Đức Chúa Giêsu chịu đánh đòn." } },
      { title: { ja: "茨（いばら）の冠", reading: "いばらのかんむり", vi: "Đức Chúa Giêsu chịu đội mão gai." } },
      { title: { ja: "十字架の道", reading: "じゅうじかのみち", vi: "Đức Chúa Giêsu vác cây Thánh Giá." } },
      { title: { ja: "イエスの死", reading: "イエスのし", vi: "Đức Chúa Giêsu chịu chết trên cây Thánh Giá." } },
    ],
  },
  {
    id: "glorious", title: { ja: "栄えの神秘", reading: "さかえのしんぴ", vi: "Năm Sự Mừng" },
    weekdayGuidance: { ja: "日曜日・水曜日（目安）", vi: "Chúa Nhật và thứ Tư (gợi ý)" },
    status: "unverified", sources: sources("https://www.pauline.or.jp/prayingtime/rosario02_glory.php"),
    mysteries: [
      { title: { ja: "イエスの復活", reading: "イエスのふっかつ", vi: "Đức Chúa Giêsu sống lại." } },
      { title: { ja: "ご昇天", reading: "ごしょうてん", vi: "Đức Chúa Giêsu lên trời." } },
      { title: { ja: "聖霊降臨", reading: "せいれいこうりん", vi: "Đức Chúa Thánh Thần hiện xuống." } },
      { title: { ja: "マリアの被昇天", reading: "マリアのひしょうてん", vi: "Đức Chúa Trời cho Đức Bà lên trời." } },
      { title: { ja: "天の元后マリア", reading: "てんのげんこうマリア", vi: "Đức Chúa Trời thưởng Đức Bà trên trời." } },
    ],
  },
];

export type RosaryReference = PrayerReference<PrayerId> & { repeat: number };
export const decadeSequence = [
  { prayerId: "lords-prayer", repeat: 1 },
  { prayerId: "ave-maria", repeat: 10 },
  { prayerId: "glory-be", repeat: 1 },
] as const satisfies readonly RosaryReference[];

export const openingSequence = [
  { prayerId: "sign-of-cross", repeat: 1 },
  { prayerId: "apostles-creed", repeat: 1 },
  { prayerId: "lords-prayer", repeat: 1 },
  { prayerId: "ave-maria", repeat: 3 },
  { prayerId: "glory-be", repeat: 1 },
] as const satisfies readonly RosaryReference[];

export const rosaryStructureSource = weekdaySource;
export const closingSequence = [
  { prayerId: "salve-regina", repeat: 1 },
] as const satisfies readonly RosaryReference[];

export const rosaryClosingSource: ContentSource = {
  appliesTo: "ja", name: "カトリック平塚教会 — 主の昇天",
  url: "https://hiratsuka.catholic.ne.jp/mass/%E4%B8%BB%E3%81%AE%E6%98%87%E5%A4%A9-3/",
  reference: "2021年5月16日、ロザリオの終わりにサルベ・レジナを唱える案内。結びの位置づけの根拠のみで、採用した祈り本文の出典ではありません。",
};
