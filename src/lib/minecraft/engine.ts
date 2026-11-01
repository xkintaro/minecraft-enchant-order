import { MINECRAFT_ENCHANTMENTS } from './data';
import {
  AnvilStep,
  EnchantmentId,
  InstructionItemNode,
  ItemId,
  OptimizationMode,
  OptimizationResult,
  SelectedEnchantment,
} from './types';

export const MAXIMUM_MERGE_LEVELS = 39;

export function calculateExperienceForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= 16) {
    return level ** 2 + 6 * level;
  } else if (level <= 31) {
    return Math.floor(2.5 * level ** 2 - 40.5 * level + 360);
  } else {
    return Math.floor(4.5 * level ** 2 - 162.5 * level + 2220);
  }
}

export class MergeLevelsTooExpensiveError extends Error {
  constructor(message = 'Merge levels exceed maximum allowed (39 levels)') {
    super(message);
    this.name = 'MergeLevelsTooExpensiveError';
  }
}

export interface InternalInstructionNode {
  I?: number | string;
  l: number; // merge cost
  w: number; // work penalty exponent
  v?: number; // enchantment value / weight
  L?: InternalInstructionNode;
  R?: InternalInstructionNode;
}

export class EngineItem {
  i: string; // 'book' or 'item' or custom ID
  e: number[]; // list of enchantment numeric IDs
  c: InternalInstructionNode;
  w: number; // work count (exponent for 2^w - 1)
  l: number; // value (level * weight sum)
  x: number; // total xp accumulated

  constructor(name: string, value = 0, ids: number[] = []) {
    this.i = name;
    this.e = [...ids];
    this.c = { I: ids.length === 1 ? ids[0] : name, l: value, w: 0, v: value };
    this.w = 0;
    this.l = value;
    this.x = 0;
  }
}

export class MergedEngineItem extends EngineItem {
  constructor(left: EngineItem, right: EngineItem) {
    const leftPwp = 2 ** left.w - 1;
    const rightPwp = 2 ** right.w - 1;
    const mergeCost = right.l + leftPwp + rightPwp;

    if (mergeCost > MAXIMUM_MERGE_LEVELS) {
      throw new MergeLevelsTooExpensiveError();
    }

    const newValue = left.l + right.l;
    super(left.i, newValue);
    this.e = left.e.concat(right.e);
    this.w = Math.max(left.w, right.w) + 1;
    this.x = left.x + right.x + calculateExperienceForLevel(mergeCost);
    this.c = {
      L: left.c,
      R: right.c,
      l: mergeCost,
      w: this.w,
      v: this.l,
    };
  }
}

export interface EngineContext {
  idToEnchant: Record<number, EnchantmentId>;
  enchantToId: Record<EnchantmentId, number>;
  idToWeight: Record<number, number>;
  itemName: ItemId;
  memoResults: Record<string, Record<number, EngineItem>>;
}

function combinations<T>(set: T[], k: number): T[][] {
  if (k > set.length || k <= 0) return [];
  if (k === set.length) return [set];
  if (k === 1) return set.map((item) => [item]);

  const result: T[][] = [];
  for (let i = 0; i <= set.length - k; i++) {
    const head = set.slice(i, i + 1);
    const tailcombs = combinations(set.slice(i + 1), k - 1);
    for (const tail of tailcombs) {
      result.push(head.concat(tail));
    }
  }
  return result;
}

function hashFromItem(item: EngineItem): string {
  const sortedIds = [...item.e].sort((a, b) => a - b).join(',');
  return `${item.i[0]}:${sortedIds}:${item.w}`;
}

function memoizeHash(items: EngineItem[]): string {
  return items.map(hashFromItem).sort().join('|');
}

function compareCheapest(item1: EngineItem, item2: EngineItem): Record<number, EngineItem> {
  const work2item: Record<number, EngineItem> = {};
  const work1 = item1.w;
  const work2 = item2.w;

  if (work1 === work2) {
    if (item1.l === item2.l) {
      if (item1.x <= item2.x) {
        work2item[work1] = item1;
      } else {
        work2item[work2] = item2;
      }
    } else if (item1.l < item2.l) {
      work2item[work1] = item1;
    } else {
      work2item[work2] = item2;
    }
  } else {
    work2item[work1] = item1;
    work2item[work2] = item2;
  }
  return work2item;
}

function removeExpensiveCandidates(
  work2item: Record<number, EngineItem>,
): Record<number, EngineItem> {
  const cheapestWork2item: Record<number, EngineItem> = {};
  let cheapestValue = Infinity;

  const sortedWorks = Object.keys(work2item)
    .map(Number)
    .sort((a, b) => a - b);

  for (const work of sortedWorks) {
    const item = work2item[work];
    if (item.l < cheapestValue) {
      cheapestWork2item[work] = item;
      cheapestValue = item.l;
    }
  }
  return cheapestWork2item;
}

function cheapestItemFromItems2(leftItem: EngineItem, rightItem: EngineItem): EngineItem {
  if (rightItem.i === 'item') {
    return new MergedEngineItem(rightItem, leftItem);
  } else if (leftItem.i === 'item') {
    return new MergedEngineItem(leftItem, rightItem);
  }

  let normalItem: EngineItem | null = null;
  try {
    normalItem = new MergedEngineItem(leftItem, rightItem);
  } catch {
    return new MergedEngineItem(rightItem, leftItem);
  }

  let reversedItem: EngineItem | null = null;
  try {
    reversedItem = new MergedEngineItem(rightItem, leftItem);
  } catch {
    return normalItem;
  }

  const cheapestWork2Item = compareCheapest(normalItem, reversedItem);
  const priorWorks = Object.keys(cheapestWork2Item).map(Number);
  return cheapestWork2Item[priorWorks[0]];
}

function cheapestItemsFromDictionaries2(
  ctx: EngineContext,
  leftWork2Item: Record<number, EngineItem>,
  rightWork2Item: Record<number, EngineItem>,
): Record<number, EngineItem> {
  const cheapestWork2Item: Record<number, EngineItem> = {};

  for (const leftWork in leftWork2Item) {
    const leftItem = leftWork2Item[leftWork];

    for (const rightWork in rightWork2Item) {
      const rightItem = rightWork2Item[rightWork];

      let newWork2Item: Record<number, EngineItem> | null = null;
      try {
        newWork2Item = cheapestItemsFromList(ctx, [leftItem, rightItem]);
      } catch (error) {
        if (!(error instanceof MergeLevelsTooExpensiveError)) {
          throw error;
        }
      }

      if (newWork2Item) {
        for (const workStr in newWork2Item) {
          const work = Number(workStr);
          const newItem = newWork2Item[work];

          if (cheapestWork2Item[work]) {
            const compared = compareCheapest(cheapestWork2Item[work], newItem);
            cheapestWork2Item[work] = compared[work];
          } else {
            cheapestWork2Item[work] = newItem;
          }
        }
      }
    }
  }

  return removeExpensiveCandidates(cheapestWork2Item);
}

function cheapestItemsFromListN(
  ctx: EngineContext,
  items: EngineItem[],
  maxSubcount: number,
): Record<number, EngineItem> {
  const cheapestWork2Item: Record<number, EngineItem> = {};

  for (let subcount = 1; subcount <= maxSubcount; subcount++) {
    const allLeftCombs = combinations(items, subcount);

    for (const leftSubset of allLeftCombs) {
      const rightSubset = items.filter((item) => !leftSubset.includes(item));

      const leftWork2Item = cheapestItemsFromList(ctx, leftSubset);
      const rightWork2Item = cheapestItemsFromList(ctx, rightSubset);
      const newWork2Item = cheapestItemsFromDictionaries2(ctx, leftWork2Item, rightWork2Item);

      for (const workStr in newWork2Item) {
        const work = Number(workStr);
        const newItem = newWork2Item[work];

        if (cheapestWork2Item[work]) {
          const compared = compareCheapest(cheapestWork2Item[work], newItem);
          cheapestWork2Item[work] = compared[work];
        } else {
          cheapestWork2Item[work] = newItem;
        }
      }
    }
  }

  return cheapestWork2Item;
}

function cheapestItemsFromList(
  ctx: EngineContext,
  items: EngineItem[],
): Record<number, EngineItem> {
  const key = memoizeHash(items);
  if (ctx.memoResults[key]) {
    return ctx.memoResults[key];
  }

  const work2item: Record<number, EngineItem> = {};
  const itemCount = items.length;

  let result: Record<number, EngineItem>;
  switch (itemCount) {
    case 1: {
      const item = items[0];
      work2item[item.w] = item;
      result = work2item;
      break;
    }
    case 2: {
      const cheapest = cheapestItemFromItems2(items[0], items[1]);
      work2item[cheapest.w] = cheapest;
      result = work2item;
      break;
    }
    default: {
      result = cheapestItemsFromListN(ctx, items, Math.floor(itemCount / 2));
      break;
    }
  }

  ctx.memoResults[key] = result;
  return result;
}

interface RawInstruction {
  L: InternalInstructionNode;
  R: InternalInstructionNode;
  mergeCost: number;
  xpCost: number;
  resultingWorkPenalty: number;
}

function parseRawInstructions(node: InternalInstructionNode, ctx: EngineContext): RawInstruction[] {
  const instructions: RawInstruction[] = [];

  if (node.L && !node.L.I) {
    instructions.push(...parseRawInstructions(node.L, ctx));
  }
  if (node.R && !node.R.I) {
    instructions.push(...parseRawInstructions(node.R, ctx));
  }

  if (node.L && node.R) {
    const leftPwp = 2 ** node.L.w - 1;
    const rightPwp = 2 ** node.R.w - 1;
    const rightVal = typeof node.R.v === 'number' ? node.R.v : node.R.l;
    const mergeCost = rightVal + leftPwp + rightPwp;
    const work = Math.max(node.L.w, node.R.w) + 1;
    const nextPwp = 2 ** work - 1;

    instructions.push({
      L: node.L,
      R: node.R,
      mergeCost,
      xpCost: calculateExperienceForLevel(mergeCost),
      resultingWorkPenalty: nextPwp,
    });
  }

  return instructions;
}

function extractEnchantmentsFromNode(
  node: InternalInstructionNode,
  ctx: EngineContext,
  selectedMap: Map<EnchantmentId, number>,
): SelectedEnchantment[] {
  const result: SelectedEnchantment[] = [];

  function walk(current?: InternalInstructionNode) {
    if (!current) return;
    if (typeof current.I === 'number') {
      const enchantId = ctx.idToEnchant[current.I];
      if (enchantId && selectedMap.has(enchantId)) {
        result.push({ id: enchantId, level: selectedMap.get(enchantId)! });
      }
    }
    if (current.L) walk(current.L);
    if (current.R) walk(current.R);
  }

  walk(node);
  return result;
}

function findItemType(
  node: InternalInstructionNode | undefined,
  ctx: EngineContext,
): { isItem: boolean; name: ItemId | 'book' } {
  if (!node) return { isItem: false, name: 'book' };

  if (node.I === 'item' || node.I === ctx.itemName) {
    return { isItem: ctx.itemName !== 'book', name: ctx.itemName };
  }

  if (node.L) {
    const leftCheck = findItemType(node.L, ctx);
    if (leftCheck.isItem) return leftCheck;
  }

  return { isItem: false, name: 'book' };
}

function convertToInstructionNode(
  node: InternalInstructionNode,
  ctx: EngineContext,
  selectedMap: Map<EnchantmentId, number>,
): InstructionItemNode {
  const enchants = extractEnchantmentsFromNode(node, ctx, selectedMap);
  const itemTypeInfo = findItemType(node, ctx);

  return {
    type: itemTypeInfo.isItem ? 'item' : 'book',
    name: itemTypeInfo.name,
    enchantments: enchants,
    priorWork: 2 ** node.w - 1,
    value: node.v ?? node.l,
  };
}

export function optimizeEnchantments(
  item: ItemId,
  selectedEnchantments: SelectedEnchantment[],
  mode: OptimizationMode = 'levels',
): OptimizationResult {
  const startTime = performance.now();

  if (selectedEnchantments.length === 0) {
    return {
      item,
      mode,
      steps: [],
      totalLevels: 0,
      totalXp: 0,
      minimumXp: 0,
      elapsedMs: 0,
      selectedEnchantments: [],
    };
  }

  // Setup context mappings
  const idToEnchant: Record<number, EnchantmentId> = {};
  const enchantToId = {} as Record<EnchantmentId, number>;
  const idToWeight: Record<number, number> = {};

  let numId = 0;
  for (const enchantKey in MINECRAFT_ENCHANTMENTS) {
    const id = enchantKey as EnchantmentId;
    idToEnchant[numId] = id;
    enchantToId[id] = numId;
    idToWeight[numId] = MINECRAFT_ENCHANTMENTS[id].weight;
    numId++;
  }

  const ctx: EngineContext = {
    idToEnchant,
    enchantToId,
    idToWeight,
    itemName: item,
    memoResults: {},
  };

  const selectedMap = new Map<EnchantmentId, number>();
  selectedEnchantments.forEach((e) => selectedMap.set(e.id, e.level));

  // 1. Create enchant objects (books)
  const enchantObjs: EngineItem[] = selectedEnchantments.map((enchant) => {
    const id = enchantToId[enchant.id];
    const weight = idToWeight[id];
    const value = enchant.level * weight;
    const book = new EngineItem('book', value, [id]);
    book.c = { I: id, l: value, w: 0, v: value };
    return book;
  });

  // 2. Find most expensive enchantment
  let mostExpensiveIdx = 0;
  for (let i = 1; i < enchantObjs.length; i++) {
    if (enchantObjs[i].l > enchantObjs[mostExpensiveIdx].l) {
      mostExpensiveIdx = i;
    }
  }

  let baseItem: EngineItem;
  if (item === 'book') {
    const primaryId = enchantObjs[mostExpensiveIdx].e[0];
    baseItem = new EngineItem(String(primaryId), enchantObjs[mostExpensiveIdx].l, [primaryId]);
    baseItem.c = { I: primaryId, l: baseItem.l, w: 0, v: baseItem.l };
    enchantObjs.splice(mostExpensiveIdx, 1);

    if (enchantObjs.length > 0) {
      mostExpensiveIdx = 0;
      for (let i = 1; i < enchantObjs.length; i++) {
        if (enchantObjs[i].l > enchantObjs[mostExpensiveIdx].l) {
          mostExpensiveIdx = i;
        }
      }
    }
  } else {
    baseItem = new EngineItem('item', 0, []);
    baseItem.c = { I: 'item', l: 0, w: 0, v: 0 };
  }

  let allObjs: EngineItem[];
  if (enchantObjs.length > 0) {
    const mergedWithBase = new MergedEngineItem(baseItem, enchantObjs[mostExpensiveIdx]);
    mergedWithBase.c.L = { I: baseItem.i, l: 0, w: 0, v: 0 };
    enchantObjs.splice(mostExpensiveIdx, 1);
    allObjs = enchantObjs.concat(mergedWithBase);
  } else {
    allObjs = [baseItem];
  }

  // 3. Compute cheapest combinations
  const cheapestMap = cheapestItemsFromList(ctx, allObjs);

  let bestItem: EngineItem | null = null;
  let bestCost = Infinity;

  for (const workStr in cheapestMap) {
    const current = cheapestMap[Number(workStr)];
    const cost = mode === 'levels' ? current.x : current.w;
    if (cost < bestCost) {
      bestCost = cost;
      bestItem = current;
    }
  }

  if (!bestItem) {
    throw new Error('No valid enchantment combination could be found.');
  }

  // 4. Generate anvil instructions
  const rawInstructions = parseRawInstructions(bestItem.c, ctx);

  let totalLevels = 0;
  const steps: AnvilStep[] = rawInstructions.map((raw, index) => {
    totalLevels += raw.mergeCost;
    const leftNode = convertToInstructionNode(raw.L, ctx, selectedMap);
    const rightNode = convertToInstructionNode(raw.R, ctx, selectedMap);
    const resultNode: InstructionItemNode = {
      type: leftNode.type,
      name: leftNode.name,
      enchantments: [...leftNode.enchantments, ...rightNode.enchantments],
      priorWork: raw.resultingWorkPenalty,
      value: (raw.L.v ?? raw.L.l) + (raw.R.v ?? raw.R.l),
    };

    return {
      stepNumber: index + 1,
      left: leftNode,
      right: rightNode,
      costLevels: raw.mergeCost,
      costXp: raw.xpCost,
      resultingPriorWorkPenalty: raw.resultingWorkPenalty,
      resultNode,
    };
  });

  const totalXp = calculateExperienceForLevel(totalLevels);
  const minimumXp = bestItem.x;
  const elapsedMs = performance.now() - startTime;

  return {
    item,
    mode,
    steps,
    totalLevels,
    totalXp,
    minimumXp,
    elapsedMs,
    selectedEnchantments,
  };
}
