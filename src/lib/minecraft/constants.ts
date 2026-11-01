import { ItemId } from './types';

export const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

export const getItemIconPath = (itemId: ItemId | 'item' | 'book', currentItem?: ItemId): string => {
  if (itemId === 'item') {
    return `/images/${currentItem || 'sword'}.gif`;
  }
  return `/images/${itemId}.gif`;
};
