import { massRoleLabels, massVariableLabels } from "../content/mass-labels";
import { eucharisticPrayerIds } from "../content/eucharistic-prayers";
import type { ContentVerification } from "../content/types";
import type { EucharisticPrayerBlock, EucharisticPrayerDefinition, EucharisticPrayerId, EucharisticPrayerVariable, MassRole, MassSpeaker } from "../content/mass-types";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const variableIds = new Set<EucharisticPrayerVariable>(["pope-name", "bishop-name", "deceased-name"]);
const sourceScopes = new Set(["ja", "reading", "vi", "all"]);

function checkId(id: string, ids: Set<string>) {
  if (!idPattern.test(id) || ids.has(id)) throw new Error(`Invalid/duplicate Eucharistic Prayer ID: ${id}`);
  ids.add(id);
}

function checkSources(sources: readonly { name: string; appliesTo: string }[] | undefined, needsJa = true) {
  for (const source of sources ?? []) {
    if (!source.name.trim() || !sourceScopes.has(source.appliesTo)) throw new Error("Invalid Eucharistic Prayer source scope");
  }
  if (needsJa && !sources?.some(source => source.appliesTo === "ja" || source.appliesTo === "all")) {
    throw new Error("Eucharistic Prayer Japanese content needs a scoped source");
  }
}

function checkStatus(content: ContentVerification) {
  if (!["sample", "unverified", "verified"].includes(content.status) ||
    (content.status === "verified" && !content.sources?.length)) {
    throw new Error("Invalid Eucharistic Prayer verification state");
  }
  checkSources(content.sources, false);
}

function checkSpeaker(speaker: MassSpeaker) {
  const roles: readonly MassRole[] = typeof speaker === "string" ? [speaker] : speaker.oneOf;
  if (!roles.length || (typeof speaker !== "string" && roles.length < 2) ||
    new Set(roles).size !== roles.length || roles.some(role => !Object.hasOwn(massRoleLabels, role))) {
    throw new Error("Invalid Eucharistic Prayer speaker");
  }
}

/** Runtime integrity checks for local Eucharistic Prayer definitions; never infers or supplies liturgical content. */
export function validateEucharisticPrayers(definitions: readonly EucharisticPrayerDefinition[]) {
  if (definitions.length !== eucharisticPrayerIds.length) throw new Error("Exactly four Eucharistic Prayer identities are required");
  const byId = new Map<EucharisticPrayerId, EucharisticPrayerDefinition>();
  const globalIds = new Set<string>();
  for (const definition of definitions) {
    if (!eucharisticPrayerIds.includes(definition.id) || byId.has(definition.id)) {
      throw new Error(`Unknown/duplicate Eucharistic Prayer identity: ${definition.id}`);
    }
    byId.set(definition.id, definition);
    checkStatus(definition);
    checkSources(definition.sources);
    if (!definition.title.trim() || !["unpopulated", "available"].includes(definition.contentState)) {
      throw new Error(`Invalid Eucharistic Prayer definition: ${definition.id}`);
    }
    if ((definition.contentState === "unpopulated" && definition.sections.length !== 0) ||
      (definition.contentState === "available" && definition.sections.length === 0)) {
      throw new Error(`Eucharistic Prayer availability/body mismatch: ${definition.id}`);
    }
    if (definition.structure) {
      const { memorialAcclamationOptions, optionalMemorialMassInsertion, contextualVariables } = definition.structure;
      if (memorialAcclamationOptions && (memorialAcclamationOptions.length !== 3 || new Set(memorialAcclamationOptions).size !== 3 || memorialAcclamationOptions.some(id => !id.trim()))) {
        throw new Error(`Invalid memorial acclamation structure: ${definition.id}`);
      }
      if (optionalMemorialMassInsertion !== undefined && typeof optionalMemorialMassInsertion !== "boolean") {
        throw new Error(`Invalid conditional insertion metadata: ${definition.id}`);
      }
      for (const variable of contextualVariables ?? []) {
        if (!variableIds.has(variable)) throw new Error(`Unknown Eucharistic Prayer variable: ${variable}`);
      }
    }
    for (const section of definition.sections) {
      checkId(section.id, globalIds);
      if (!section.title.trim() || !["editorial", "liturgical"].includes(section.headingOrigin) || section.blocks.length === 0) {
        throw new Error(`Invalid Eucharistic Prayer section: ${section.id}`);
      }
      for (const block of section.blocks) checkBlock(block);
    }
  }
  if (eucharisticPrayerIds.some(id => !byId.has(id))) throw new Error("Missing Eucharistic Prayer identity");
  function checkBlock(block: EucharisticPrayerBlock) {
    checkId(block.id, globalIds);
    switch (block.kind) {
      case "spoken":
        checkStatus(block);
        checkSpeaker(block.speaker);
        if (!block.text.ja.trim() || !block.sources?.some(source => source.appliesTo === "ja" || source.appliesTo === "all")) {
          throw new Error("Spoken Eucharistic Prayer text requires sourced Japanese content");
        }
        if (block.text.reading && !block.sources.some(source => source.appliesTo === "reading" || source.appliesTo === "all")) {
          throw new Error("Eucharistic Prayer reading needs reading-scoped provenance");
        }
        if (block.text.vi && !block.sources.some(source => source.appliesTo === "vi" || source.appliesTo === "all")) {
          throw new Error("Eucharistic Prayer Vietnamese support needs vi-scoped provenance");
        }
        break;
      case "rubric":
        checkStatus(block);
        checkSources(block.sources);
        if (!block.text.ja.trim()) throw new Error("Empty Eucharistic Prayer rubric");
        break;
      case "variable":
        checkSpeaker(block.speaker);
        if (!variableIds.has(block.slot) || !Object.hasOwn(massVariableLabels, block.slot)) {
          throw new Error(`Invalid Eucharistic Prayer variable: ${block.slot}`);
        }
        break;
      case "conditional":
        checkSources(block.sources);
        if (!block.condition.ja?.trim() || block.blocks.length === 0) throw new Error("Invalid Eucharistic Prayer condition");
        for (const child of block.blocks) checkBlock(child);
        break;
      case "choice": {
        checkStatus({ status: block.status, sources: block.sources });
        checkSources(block.sources);
        if (block.choiceType !== "memorial-acclamation" || !block.title.ja.trim() || !block.instruction.ja.trim() || block.options.length < 2) {
          throw new Error("Invalid Eucharistic Prayer acclamation choice");
        }
        const optionIds = new Set<string>();
        for (const option of block.options) {
          if (!idPattern.test(option.id) || optionIds.has(option.id) || option.blocks.length === 0) throw new Error("Invalid Eucharistic Prayer acclamation option");
          checkId(option.id, globalIds);
          optionIds.add(option.id);
          for (const child of option.blocks) checkBlock(child);
          const speakers = option.blocks.filter(child => child.kind === "spoken");
          if (!speakers.length || speakers.some(child => child.speaker !== "congregation" && child.speaker !== "all")) {
            throw new Error("Memorial acclamations must be congregation speech");
          }
        }
        break;
      }
    }
  }
}
