import type { MassRole, MassSectionId, MassText, MassVariableKind } from "./mass-types";

/** Japanese structural terms: CBCJ 2022 order. Readings and Vietnamese: project support. */
export const massSectionLabels: Record<MassSectionId, { title: MassText; within?: MassSectionId }> = {
  introductory: { title: { ja: "開祭", reading: "かいさい", vi: "Nghi thức đầu lễ" } },
  word: { title: { ja: "ことばの典礼", reading: "ことばのてんれい", vi: "Phụng vụ Lời Chúa" } },
  eucharist: { title: { ja: "感謝の典礼", reading: "かんしゃのてんれい", vi: "Phụng vụ Thánh Thể" } },
  communion: { title: { ja: "交わりの儀（コムニオ）", reading: "まじわりのぎ（コムニオ）", vi: "Nghi thức hiệp lễ" }, within: "eucharist" },
  concluding: { title: { ja: "閉祭", reading: "へいさい", vi: "Nghi thức kết lễ" } },
};

export const massRoleLabels: Record<MassRole, MassText> = {
  priest: { ja: "司祭", vi: "Linh mục" },
  bishop: { ja: "司教", vi: "Giám mục" },
  deacon: { ja: "助祭", vi: "Phó tế" },
  congregation: { ja: "会衆", vi: "Cộng đoàn" },
  reader: { ja: "朗読者", vi: "Người đọc sách" },
  psalmist: { ja: "詩編唱者", vi: "Người hát thánh vịnh" },
  cantor: { ja: "先唱者", vi: "Người xướng" },
  "lay-faithful": { ja: "信徒", vi: "Giáo dân" },
  communicant: { ja: "拝領者", vi: "Người rước lễ" },
  all: { ja: "一同", vi: "Mọi người cùng đọc" },
};

export const massVariableLabels: Record<MassVariableKind, MassText> = {
  collect: { ja: "集会祈願", vi: "Lời nguyện nhập lễ" },
  "first-reading": { ja: "第一朗読", vi: "Bài đọc I" },
  "responsorial-psalm": { ja: "答唱詩編", vi: "Thánh vịnh đáp ca" },
  "second-reading": { ja: "第二朗読", vi: "Bài đọc II" },
  "gospel-acclamation": { ja: "アレルヤ唱（詠唱）", vi: "Tung hô Tin Mừng" },
  "gospel-chant": { ja: "詠唱（典礼注記による他の歌）", vi: "Bài tung hô khác theo mùa phụng vụ" },
  "gospel-title": { ja: "福音の告知（福音書名を含む）", vi: "Lời công bố sách Tin Mừng" },
  gospel: { ja: "福音朗読", vi: "Tin Mừng" },
  homily: { ja: "説教", vi: "Bài giảng" },
  "intentions-invitation": { ja: "共同祈願への招き", vi: "Lời mời cầu nguyện chung" },
  intentions: { ja: "共同祈願", vi: "Lời nguyện chung" },
  "intentions-response": { ja: "共同祈願の応唱", vi: "Câu đáp của cộng đoàn" },
  "intentions-conclusion": { ja: "共同祈願の結び", vi: "Lời nguyện kết thúc" },
  "prayer-over-offerings": { ja: "奉納祈願", vi: "Lời nguyện tiến lễ" },
  preface: { ja: "叙唱", vi: "Kinh Tiền Tụng" },
  "prayer-after-communion": { ja: "拝領祈願", vi: "Lời nguyện hiệp lễ" },
  "communion-song": { ja: "拝領の歌", vi: "Ca hiệp lễ" },
  "post-communion-song": { ja: "拝領後の任意の詩編・賛美歌", vi: "Thánh vịnh hoặc thánh ca tùy chọn sau hiệp lễ" },
  "solemn-blessing": { ja: "荘厳な祝福（該当時）", vi: "Phép lành trọng thể (khi thích hợp)" },
  "prayer-over-the-people": { ja: "会衆のための祈願（該当時）", vi: "Lời nguyện trên cộng đoàn (khi thích hợp)" },
  "pope-name": { ja: "教皇名", vi: "Tên Đức Giáo hoàng" },
  "bishop-name": { ja: "司教名", vi: "Tên giám mục giáo phận" },
  "deceased-name": { ja: "故人名", vi: "Tên người đã qua đời" },
};
