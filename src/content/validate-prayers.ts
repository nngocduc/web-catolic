import type { Prayer, PrayerReference } from "./types";

export function validatePrayerReference(reference: PrayerReference, exists: (id: string) => boolean): void {
  if (!exists(reference.prayerId)) throw new Error(`Unknown prayer reference: ${reference.prayerId}`);
  if (!Number.isSafeInteger(reference.repeat ?? 1) || (reference.repeat ?? 1) <= 0) {
    throw new Error(`Invalid prayer repeat: ${reference.repeat}`);
  }
}

/** Fail early on ambiguous IDs, missing references, or recursive compositions. */
export function validatePrayers(prayers: readonly Prayer[]): void {
  const byId = new Map<string, Prayer>();
  for (const prayer of prayers) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(prayer.id) || byId.has(prayer.id)) {
      throw new Error(`Invalid or duplicate prayer ID: ${prayer.id}`);
    }
    byId.set(prayer.id, prayer);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw new Error(`Circular prayer reference: ${id}`);
    if (visited.has(id)) return;
    const prayer = byId.get(id);
    if (!prayer) throw new Error(`Unknown prayer reference: ${id}`);
    visiting.add(id);
    const blockIds = new Set<string>();
    for (const block of prayer.blocks ?? []) {
      if (blockIds.has(block.id)) throw new Error(`Duplicate block ID in ${id}: ${block.id}`);
      blockIds.add(block.id);
      if (block.kind === "prayer") {
        validatePrayerReference(block, (id) => byId.has(id));
        visit(block.prayerId);
      }
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const prayer of prayers) visit(prayer.id);
}
