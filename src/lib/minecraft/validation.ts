import { MINECRAFT_ENCHANTMENTS } from './data';
import { EnchantmentId, ItemId, SelectedEnchantment } from './types';

export function getApplicableEnchantments(itemId: ItemId): EnchantmentId[] {
  if (itemId === 'book') {
    return Object.keys(MINECRAFT_ENCHANTMENTS) as EnchantmentId[];
  }

  return (Object.keys(MINECRAFT_ENCHANTMENTS) as EnchantmentId[]).filter((enchantId) => {
    return MINECRAFT_ENCHANTMENTS[enchantId].items.includes(itemId);
  });
}

export function areEnchantmentsIncompatible(
  enchant1: EnchantmentId,
  enchant2: EnchantmentId,
): boolean {
  if (enchant1 === enchant2) return false;
  const def1 = MINECRAFT_ENCHANTMENTS[enchant1];
  const def2 = MINECRAFT_ENCHANTMENTS[enchant2];

  return def1.incompatible.includes(enchant2) || def2.incompatible.includes(enchant1);
}

export function findIncompatibleEnchantments(enchantId: EnchantmentId): EnchantmentId[] {
  return MINECRAFT_ENCHANTMENTS[enchantId]?.incompatible || [];
}

export function getEnchantmentGroups(itemEnchantments: EnchantmentId[]): EnchantmentId[][] {
  const visited = new Set<EnchantmentId>();
  const groups: EnchantmentId[][] = [];

  for (const enchantId of itemEnchantments) {
    if (visited.has(enchantId)) continue;

    const group: EnchantmentId[] = [];
    const queue: EnchantmentId[] = [enchantId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      if (itemEnchantments.includes(current)) {
        group.push(current);
      }

      const incompats = findIncompatibleEnchantments(current);
      for (const inc of incompats) {
        if (!visited.has(inc) && !queue.includes(inc)) {
          queue.push(inc);
        }
      }
    }

    if (group.length > 0) {
      groups.push(group);
    }
  }

  return groups;
}

export function validateSelectedEnchantments(
  selected: SelectedEnchantment[],
  allowIncompatible: boolean = false,
  allowMany: boolean = false,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!allowMany && selected.length > 10) {
    errors.push("10'dan fazla büyü seçimi varsayılan olarak önerilmez.");
  }

  if (!allowIncompatible) {
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        if (areEnchantmentsIncompatible(selected[i].id, selected[j].id)) {
          errors.push(
            `"${selected[i].id}" ile "${selected[j].id}" çakışan (incompatible) büyülerdir!`,
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
