import { getPrayer } from "../content/prayers";
import { decadeSequence, openingSequence, closingSequence, type MysterySet, type RosaryReference } from "../content/rosary";
import type { PrayerId } from "../content/prayers";
import { validatePrayerReference } from "../content/validate-prayers";

export type RosaryStep = {
  phase: "opening" | "decade" | "closing";
  /** Zero-based; absent in the opening and closing. */
  mysteryIndex?: number;
  prayerId: PrayerId;
  repetition: number;
  repeat: number;
};

export function expandReferences(sequence: readonly RosaryReference[]): Omit<RosaryStep, "phase" | "mysteryIndex">[] {
  return sequence.flatMap(reference => {
    validatePrayerReference(reference, id => !!getPrayer(id));
    return Array.from({ length: reference.repeat }, (_, index) => ({
      prayerId: reference.prayerId, repetition: index + 1, repeat: reference.repeat,
    }));
  });
}

export function validateMysterySets(sets: readonly MysterySet[]): void {
  if (sets.length !== 4 || new Set(sets.map(set => set.id)).size !== 4 ||
      !["joyful", "luminous", "sorrowful", "glorious"].every(id => sets.some(set => set.id === id))) {
    throw new Error("Rosary requires the four distinct mystery sets");
  }
  for (const set of sets) {
    if (set.mysteries.length !== 5) throw new Error(`Rosary requires five mysteries: ${set.id}`);
  }
}

export function buildRosarySteps(set: MysterySet, includeOpening = true): readonly RosaryStep[] {
  if (set.mysteries.length !== 5) throw new Error("Rosary requires five mysteries");
  const opening: RosaryStep[] = includeOpening ? expandReferences(openingSequence).map(step => ({ ...step, phase: "opening" })) : [];
  const decade = expandReferences(decadeSequence);
  const closing: RosaryStep[] = expandReferences(closingSequence).map(step => ({ ...step, phase: "closing" }));
  return [...opening, ...set.mysteries.flatMap((_, mysteryIndex) =>
    decade.map(step => ({ ...step, phase: "decade" as const, mysteryIndex }))), ...closing];
}

/** The index equal to total denotes completion, and can be reversed. */
export function moveRosaryStep(index: number, direction: -1 | 1, total: number): number {
  return Math.max(0, Math.min(total, index + direction));
}
