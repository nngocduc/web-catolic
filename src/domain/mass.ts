import { getPrayer } from "../content/prayers";
import { validatePrayerReference } from "../content/validate-prayers";
import { massPrayerVariants } from "../content/mass-prayer-variants";
import { massRoleLabels, massSectionLabels, massVariableLabels } from "../content/mass-labels";
import type { MassBlock, MassOrder, MassPrayerVariant, MassSpeaker, MassText, MassVariableContent } from "../content/mass-types";
import type { ContentVerification } from "../content/types";
import { eucharisticPrayers } from "../content/eucharistic-prayers";
import { validateEucharisticPrayers } from "./eucharistic-prayers";

export function massSpeakerLabel(speaker: MassSpeaker): MassText {
  if (typeof speaker === "string") return massRoleLabels[speaker];
  return {
    ja: speaker.oneOf.map(role => massRoleLabels[role].ja).join(" または "),
    vi: speaker.oneOf.map(role => massRoleLabels[role].vi).join(" hoặc "),
  };
}

function validateSpeaker(speaker: MassSpeaker) {
      const roles = typeof speaker === "string" ? [speaker] : speaker.oneOf;
  if (!roles?.length || (typeof speaker !== "string" && roles.length < 2) ||
      new Set(roles).size !== roles.length || roles.some(role => !Object.hasOwn(massRoleLabels, role))) {
    throw new Error("Invalid Mass speaker");
  }
}

function validateVerification(content: ContentVerification) {
  if (!["sample", "unverified", "verified"].includes(content.status) ||
      (content.status === "verified" && !content.sources?.length)) {
    throw new Error("Invalid Mass verification/source metadata");
  }
  for (const source of content.sources ?? []) {
    if (!source.name.trim() || !["ja", "vi", "reading", "all"].includes(source.appliesTo)) {
      throw new Error("Invalid Mass source scope");
    }
  }
}

/** Build-time guard for authored local data; not a liturgical correctness checker. */
export function validateMass<VariantId extends string>(
  order: MassOrder<VariantId>,
  values: MassVariableContent = {},
  variants: Readonly<Record<string, MassPrayerVariant>> = massPrayerVariants,
) {
  validateEucharisticPrayers(eucharisticPrayers);
  const ids = new Set<string>();
  const slots = new Set<string>();
  const choices = new Map<string, Set<string>>();
  const conditions: { choiceId: string; optionIds: readonly string[]; precedingChoices: Set<string> }[] = [];
  let eucharisticPrayerSelectorCount = 0;
  const addId = (id: string) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error(`Invalid/duplicate Mass ID: ${id}`);
    ids.add(id);
  };
  const variantIds = new Set<string>();
  for (const [key, variant] of Object.entries(variants)) {
    if (key !== variant.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.id) || variantIds.has(variant.id)) {
      throw new Error(`Invalid Mass prayer variant ID: ${variant.id}`);
    }
    variantIds.add(variant.id);
    if (!["mass-opening", "mass-communion"].includes(variant.context)) {
      throw new Error(`Invalid Mass prayer variant context: ${variant.context}`);
    }
    validatePrayerReference({ prayerId: variant.prayerId }, id => Boolean(getPrayer(id)));
    validateVerification(variant);
    if (!variant.sources?.some(source => source.appliesTo === "ja")) throw new Error("Mass prayer variant needs Japanese source evidence");
    if (variant.contentState === "available" && !variant.blocks.length) throw new Error("Available Mass prayer variant needs spoken segments");
    if (variant.contentState === "unpopulated" && (variant.blocks.length !== 0 || !variant.note?.ja.trim())) throw new Error("Unpopulated Mass prayer variant must have no segments and an explanatory note");
    if (!['available', 'unpopulated'].includes(variant.contentState)) throw new Error("Invalid Mass prayer variant content state");
    if (variant.note?.vi && !variant.sources?.some(source => source.appliesTo === "vi" || source.appliesTo === "all")) throw new Error("Mass prayer variant note needs vi-scoped provenance");
    const segmentIds = new Set<string>();
    for (const segment of variant.blocks) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment.id) || segmentIds.has(segment.id)) {
        throw new Error(`Invalid/duplicate Mass prayer variant segment: ${segment.id}`);
      }
      segmentIds.add(segment.id);
      validateSpeaker(segment.speaker);
      validateVerification(segment);
    }
  }
  for (const section of order.sections) {
    addId(section.id);
    if (!Object.hasOwn(massSectionLabels, section.id)) throw new Error("Unknown Mass section");
    const within = massSectionLabels[section.id].within;
    if (within && !ids.has(within)) throw new Error("Mass parent section must precede its continuation");
    for (const subsection of section.subsections) {
      addId(subsection.id);
      for (const block of subsection.blocks) {
        validateBlock(block);
      }
    }
  }
  for (const condition of conditions) {
    const targets = choices.get(condition.choiceId);
    if (!condition.precedingChoices.has(condition.choiceId) || !targets || condition.optionIds.length === 0 ||
        condition.optionIds.some(optionId => !targets.has(optionId))) {
      throw new Error(`Invalid Mass alternative condition: ${condition.choiceId}`);
    }
  }
  if (eucharisticPrayerSelectorCount !== 1) throw new Error("Mass order needs one Eucharistic Prayer selector");
  for (const [slot, passages] of Object.entries(values)) {
    if (!slots.has(slot)) throw new Error(`Unused/unknown Mass variable value: ${slot}`);
    if (!passages?.length) throw new Error("Empty Mass variable value; omit an unfilled slot");
    for (const passage of passages) {
      addId(passage.id);
      validateSpeaker(passage.speaker);
      validateVerification(passage);
    }
  }

  function validateBlock(block: MassBlock<VariantId>) {
        addId(block.id);
        if ("speaker" in block && block.speaker) validateSpeaker(block.speaker);
        switch (block.kind) {
          case "eucharistic-prayer-selector":
            eucharisticPrayerSelectorCount += 1;
            if (eucharisticPrayerSelectorCount > 1) throw new Error("Duplicate Eucharistic Prayer selector");
            break;
          case "spoken":
            validateVerification(block);
            break;
          case "rubric":
            validateVerification(block);
            if (!["editorial", "liturgical"].includes(block.origin)) throw new Error("Invalid rubric origin");
            break;
          case "unavailable":
            validateVerification(block);
            if (!block.title.trim() || !block.note.ja.trim() || !block.sources?.some(source => source.appliesTo === "ja" || source.appliesTo === "all")) {
              throw new Error("Unavailable Mass content needs a title, explanation and Japanese structural source");
            }
            if (block.note.vi && !block.sources?.some(source => source.appliesTo === "vi" || source.appliesTo === "all")) {
              throw new Error("Unavailable Mass explanation needs vi-scoped provenance");
            }
            if (block.condition && (!block.condition.ja.trim() || (block.condition.vi && !block.sources?.some(source => source.appliesTo === "vi" || source.appliesTo === "all")))) {
              throw new Error("Invalid Mass content condition");
            }
            if (block.repeat && (block.repeat.rule !== "while-fraction-in-progress" || block.repeat.endsWith !== "peace-invocation")) {
              throw new Error("Invalid Mass fraction-chant repetition structure");
            }
            break;
          case "prayer":
            validatePrayerReference(block, id => Boolean(getPrayer(id)));
            validateVerification(block.context);
            if (block.context.purpose === "demonstration") {
              if (block.context.status !== "sample") throw new Error("Demonstration reference must stay sample");
            } else if (block.context.purpose !== "liturgical" || !block.context.sources?.length) {
              throw new Error("Liturgical prayer reuse needs contextual source evidence");
            }
            break;
          case "prayer-variant": {
            const variant = variants[block.variantId];
            if (!variant || !variantIds.has(block.variantId) || variant.id !== block.variantId || !getPrayer(variant.prayerId)) {
              throw new Error(`Unknown Mass prayer variant: ${block.variantId}`);
            }
            break;
          }
          case "variable":
            if (!Object.hasOwn(massVariableLabels, block.slot) || slots.has(block.slot)) throw new Error("Invalid/duplicate Mass variable slot");
            slots.add(block.slot);
            break;
          case "choice": {
            if (choices.has(block.choiceId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(block.choiceId) || block.options.length < 2) {
              throw new Error(`Invalid/duplicate Mass choice: ${block.choiceId}`);
            }
            addId(block.choiceId);
            validateVerification(block);
            const optionIds = new Set<string>();
            for (const option of block.options) {
              if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(option.id) || optionIds.has(option.id) || option.blocks.length === 0) {
                throw new Error(`Invalid Mass alternative in ${block.choiceId}`);
              }
              addId(option.id);
              optionIds.add(option.id);
              for (const child of option.blocks) validateBlock(child);
            }
            if (block.when) conditions.push({ ...block.when, precedingChoices: new Set(choices.keys()) });
            choices.set(block.choiceId, optionIds);
            break;
          }
          default:
            throw new Error("Unknown Mass block kind");
        }
  }
}
