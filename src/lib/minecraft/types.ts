export type ItemId =
  | 'helmet'
  | 'chestplate'
  | 'leggings'
  | 'boots'
  | 'turtle_shell'
  | 'elytra'
  | 'sword'
  | 'axe'
  | 'mace'
  | 'spear'
  | 'trident'
  | 'bow'
  | 'crossbow'
  | 'pickaxe'
  | 'shovel'
  | 'hoe'
  | 'shield'
  | 'brush'
  | 'fishing_rod'
  | 'shears'
  | 'flint_and_steel'
  | 'carrot_on_a_stick'
  | 'warped_fungus_on_a_stick'
  | 'pumpkin'
  | 'book';

export type EnchantmentId =
  | 'protection'
  | 'aqua_affinity'
  | 'bane_of_arthropods'
  | 'blast_protection'
  | 'channeling'
  | 'depth_strider'
  | 'efficiency'
  | 'feather_falling'
  | 'fire_aspect'
  | 'fire_protection'
  | 'flame'
  | 'fortune'
  | 'frost_walker'
  | 'impaling'
  | 'infinity'
  | 'knockback'
  | 'looting'
  | 'loyalty'
  | 'luck_of_the_sea'
  | 'lunge'
  | 'lure'
  | 'mending'
  | 'multishot'
  | 'piercing'
  | 'power'
  | 'projectile_protection'
  | 'punch'
  | 'quick_charge'
  | 'respiration'
  | 'riptide'
  | 'sharpness'
  | 'silk_touch'
  | 'smite'
  | 'soul_speed'
  | 'sweeping'
  | 'swift_sneak'
  | 'thorns'
  | 'unbreaking'
  | 'binding_curse'
  | 'vanishing_curse'
  | 'density'
  | 'breach'
  | 'wind_burst';

export interface EnchantmentDefinition {
  levelMax: number;
  weight: number;
  incompatible: EnchantmentId[];
  items: ItemId[];
}

export interface SelectedEnchantment {
  id: EnchantmentId;
  level: number;
}

export type OptimizationMode = 'levels' | 'prior_work';

export interface InstructionItemNode {
  type: 'item' | 'book';
  name: ItemId | 'item' | 'book';
  enchantments: SelectedEnchantment[];
  priorWork: number;
  value: number;
}

export interface AnvilStep {
  stepNumber: number;
  left: InstructionItemNode;
  right: InstructionItemNode;
  costLevels: number;
  costXp: number;
  resultingPriorWorkPenalty: number;
  resultNode: InstructionItemNode;
}

export interface OptimizationResult {
  item: ItemId;
  mode: OptimizationMode;
  steps: AnvilStep[];
  totalLevels: number;
  totalXp: number;
  minimumXp: number;
  elapsedMs: number;
  selectedEnchantments: SelectedEnchantment[];
}
