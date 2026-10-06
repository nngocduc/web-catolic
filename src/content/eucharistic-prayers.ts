import type { ContentSource } from "./types";
import type { EucharisticPrayerDefinition, EucharisticPrayerId } from "./mass-types";

const orderPdf = "https://www.cbcj.catholic.jp/wp-content/uploads/2021/10/mass2022wLM3.pdf";
const cbcj = "カトリック中央協議会 / 日本カトリック司教協議会";

export const eucharisticPrayerIds = [
  "eucharistic-prayer-i",
  "eucharistic-prayer-ii",
  "eucharistic-prayer-iii",
  "eucharistic-prayer-iv",
] as const satisfies readonly EucharisticPrayerId[];

function identitySource(title: string, pages: string): ContentSource {
  return {
    appliesTo: "ja",
    name: cbcj,
    url: orderPdf,
    reference: `『ミサの式次第と第一～第四奉献文』（会衆用）、${title}の掲載確認（印刷頁${pages}）。本文はこのデータに収録していません。`,
  };
}

export const eucharisticPrayers: readonly EucharisticPrayerDefinition[] = [
  {
    id: "eucharistic-prayer-i",
    title: "第一奉献文（ローマ典文）",
    contentState: "unpopulated",
    sections: [],
    status: "unverified",
    sources: [identitySource("第一奉献文（ローマ典文）", "11–16")],
  },
  {
    id: "eucharistic-prayer-ii",
    title: "第二奉献文",
    contentState: "unpopulated",
    sections: [],
    status: "unverified",
    sources: [{ ...identitySource("第二奉献文", "17–20"), reference: `${identitySource("第二奉献文", "17–20").reference} PDF頁16–19。` }],
    structure: {
      memorialAcclamationOptions: ["memorial-acclamation-1", "memorial-acclamation-2", "memorial-acclamation-3"],
      optionalMemorialMassInsertion: true,
      contextualVariables: ["pope-name", "bishop-name", "deceased-name"],
    },
  },
  {
    id: "eucharistic-prayer-iii",
    title: "第三奉献文",
    contentState: "unpopulated",
    sections: [],
    status: "unverified",
    sources: [identitySource("第三奉献文", "21–24")],
  },
  {
    id: "eucharistic-prayer-iv",
    title: "第四奉献文",
    contentState: "unpopulated",
    sections: [],
    status: "unverified",
    sources: [identitySource("第四奉献文", "25–29")],
  },
];
