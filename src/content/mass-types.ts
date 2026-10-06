import type { PrayerId } from "./prayers";
import type { BilingualText, ContentSource, ContentVerification, PrayerReference } from "./types";

/** Missing support languages are omitted, never fabricated. */
export type MassText = Pick<BilingualText, "ja" | "reading"> & Partial<Pick<BilingualText, "vi">>;
export type MassCitation = Pick<ContentSource, "name" | "url" | "reference">;

export type MassSectionId = "introductory" | "word" | "eucharist" | "communion" | "concluding";
export type MassRole = "priest" | "bishop" | "deacon" | "congregation" | "reader" | "psalmist" | "cantor" | "lay-faithful" | "communicant" | "all";
export type EucharisticPrayerId = "eucharistic-prayer-i" | "eucharistic-prayer-ii" | "eucharistic-prayer-iii" | "eucharistic-prayer-iv";
export type EucharisticPrayerVariable = "pope-name" | "bishop-name" | "deceased-name";
/** Alternatives are not simultaneous speech. `all` means 一同. */
export type MassSpeaker = MassRole | { oneOf: readonly [MassRole, MassRole, ...MassRole[]] };
export type MassPrayerVariantContext = "mass-opening" | "mass-communion";
export type MassVariableKind =
  | "collect" | "first-reading" | "responsorial-psalm" | "second-reading"
  | "gospel-acclamation" | "gospel-chant" | "gospel-title" | "gospel" | "homily"
  | "intentions-invitation" | "intentions" | "intentions-response" | "intentions-conclusion"
  | "prayer-over-offerings" | "preface" | "prayer-after-communion"
  | "communion-song" | "post-communion-song" | "solemn-blessing" | "prayer-over-the-people"
  | "pope-name" | "bishop-name" | "deceased-name";

/** A passage can be ordinary text or part of a celebration-specific value. */
export type MassPassage = { id: string; speaker: MassSpeaker; text: MassText } & ContentVerification;
export type MassPrayerVariant = {
  id: string;
  prayerId: PrayerReference<PrayerId>["prayerId"];
  context: MassPrayerVariantContext;
} & ContentVerification & (
  | { contentState: "available"; blocks: readonly [MassPassage, ...MassPassage[]]; note?: never }
  | { contentState: "unpopulated"; blocks: readonly []; note: { ja: string; vi?: string } }
);
export type MassUnavailableBlock = {
  id: string;
  kind: "unavailable";
  title: string;
  speaker?: MassSpeaker;
  note: { ja: string; vi?: string };
  condition?: { ja: string; vi?: string };
  repeat?: { rule: "while-fraction-in-progress"; endsWith: "peace-invocation" };
} & ContentVerification;
export type MassSimpleBlock<VariantId extends string = string> =
  | (MassPassage & { kind: "spoken"; optional?: boolean }) // fixed ordinary text; optional marks a permitted response
  | ({ id: string; kind: "rubric"; origin: "liturgical" | "editorial"; text: MassText } & ContentVerification)
  | MassUnavailableBlock
  | {
      id: string;
      kind: "prayer";
      speaker: MassSpeaker;
      prayerId: PrayerReference<PrayerId>["prayerId"];
      /** Evidence about use here, NOT an override of the canonical prayer's provenance. */
      context: { purpose: "demonstration" | "liturgical"; note: MassText } & ContentVerification;
    }
  | { id: string; kind: "prayer-variant"; variantId: VariantId }
  | { id: string; kind: "variable"; slot: MassVariableKind; speaker: MassSpeaker; note?: MassText; optional?: boolean };

export type MassChoiceCondition = { choiceId: string; optionIds: readonly [string, ...string[]] };
export type MassAlternativeOption<VariantId extends string = string> = {
  id: string;
  title: string;
  condition?: MassText;
  blocks: readonly MassSimpleBlock<VariantId>[];
};
export type MassBlock<VariantId extends string = string> =
  | MassSimpleBlock<VariantId>
  | { id: string; kind: "eucharistic-prayer-selector" }
  | ({
      id: string;
      kind: "choice";
      choiceId: string;
      title: MassText;
      instruction: MassText;
      options: readonly [MassAlternativeOption<VariantId>, MassAlternativeOption<VariantId>, ...MassAlternativeOption<VariantId>[]];
      sources?: readonly ContentSource[];
      status: "sample" | "unverified";
      /** Displayed as a condition; no choice is automatically selected. */
      when?: MassChoiceCondition;
  } & ContentVerification);

export type EucharisticPrayerBlock =
  | (MassPassage & { kind: "spoken"; optional?: boolean })
  | ({ id: string; kind: "rubric"; origin: "liturgical" | "editorial"; text: MassText } & ContentVerification)
  | { id: string; kind: "variable"; slot: EucharisticPrayerVariable; speaker: MassSpeaker; note?: MassText; optional?: boolean }
  | {
      id: string;
      kind: "conditional";
      condition: MassText;
      sources: readonly ContentSource[];
      blocks: readonly EucharisticPrayerBlock[];
    }
  | {
      id: string;
      kind: "choice";
      choiceType: "memorial-acclamation";
      title: MassText;
      instruction: MassText;
      sources: readonly ContentSource[];
      status: "sample" | "unverified";
      options: readonly [
        { id: string; title: string; blocks: readonly EucharisticPrayerBlock[] },
        { id: string; title: string; blocks: readonly EucharisticPrayerBlock[] },
        ...{ id: string; title: string; blocks: readonly EucharisticPrayerBlock[] }[],
      ];
    };

export type EucharisticPrayerStructure = {
  memorialAcclamationOptions?: readonly [string, string, string];
  optionalMemorialMassInsertion?: boolean;
  contextualVariables?: readonly EucharisticPrayerVariable[];
};

export type EucharisticPrayerDefinition = {
  id: EucharisticPrayerId;
  title: string;
  contentState: "unpopulated" | "available";
  /** CBCJ inner headings, when available; project navigation headings are explicitly editorial. */
  sections: readonly { id: string; title: string; headingOrigin: "liturgical" | "editorial"; blocks: readonly EucharisticPrayerBlock[] }[];
  /** Sources for identity/structure or the populated body, scoped by language as usual. */
  sources: readonly ContentSource[];
  structure?: EucharisticPrayerStructure;
} & ContentVerification;


export type MassSubsection<VariantId extends string = string> = { id: string; title: MassText; blocks: readonly MassBlock<VariantId>[] };
export type MassSection<VariantId extends string = string> = { id: MassSectionId; subsections: readonly MassSubsection<VariantId>[] };
export type MassOrder<VariantId extends string = string> = {
  status: "sample" | "partial" | "unverified";
  /** Structural evidence only; does not authenticate sample bodies or translations. */
  structureSources: readonly MassCitation[];
  sections: readonly MassSection<VariantId>[];
};
/** A local celebration may supply ordered, speaker-labelled passages for each slot.
 * Absent = not supplied; omission of a rite is expressed in the authored order, not here.
 */
export type MassVariableContent = Partial<Record<MassVariableKind, readonly MassPassage[]>>;
