'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { optimizeEnchantments } from './engine';
import { areEnchantmentsIncompatible } from './validation';
import type {
  EnchantmentId,
  ItemId,
  OptimizationMode,
  OptimizationResult,
  SelectedEnchantment,
} from './types';

type CalculationError =
  'tooManyEnchantments' | 'selectAtLeastOne' | 'noSolutionFound' | 'calculationError';

export function useEnchantCalculator() {
  const t = useTranslations();
  const [item, setItem] = useState<ItemId | null>(null);
  const [selectedEnchantments, setSelectedEnchantments] = useState<SelectedEnchantment[]>([]);
  const [mode, setMode] = useState<OptimizationMode>('levels');
  const [allowIncompatible, setAllowIncompatible] = useState(false);
  const [allowMany, setAllowMany] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<CalculationError | null>(null);

  const invalidate = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEnchantments([]);
    invalidate();
  }, [invalidate]);

  const handleItemChange = useCallback(
    (nextItem: ItemId) => {
      if (nextItem === item) return;
      setItem(nextItem);
      clearSelection();
    },
    [item, clearSelection],
  );

  const toggleEnchantment = useCallback(
    (id: EnchantmentId, level: number) => {
      const existing = selectedEnchantments.find((enchantment) => enchantment.id === id);
      let updated = selectedEnchantments.filter((enchantment) => enchantment.id !== id);
      if (existing?.level !== level) {
        if (!allowIncompatible)
          updated = updated.filter(
            (enchantment) => !areEnchantmentsIncompatible(enchantment.id, id),
          );
        if (!allowMany && updated.length >= 10) {
          setError('tooManyEnchantments');
          return;
        }
        updated.push({ id, level });
      }
      setSelectedEnchantments(updated);
      invalidate();
    },
    [selectedEnchantments, allowIncompatible, allowMany, invalidate],
  );

  const getSelectedLevel = useCallback(
    (id: EnchantmentId) =>
      selectedEnchantments.find((enchantment) => enchantment.id === id)?.level ?? null,
    [selectedEnchantments],
  );

  const handleModeChange = useCallback(
    (nextMode: OptimizationMode) => {
      setMode(nextMode);
      invalidate();
    },
    [invalidate],
  );

  const handleAllowIncompatibleChange = useCallback(
    (allowed: boolean) => {
      setAllowIncompatible(allowed);
      if (!allowed) {
        setSelectedEnchantments((previous) =>
          previous.reduce<SelectedEnchantment[]>((compatible, enchantment) => {
            if (
              !compatible.some((existing) =>
                areEnchantmentsIncompatible(existing.id, enchantment.id),
              )
            )
              compatible.push(enchantment);
            return compatible;
          }, []),
        );
      }
      invalidate();
    },
    [invalidate],
  );

  const handleAllowManyChange = useCallback(
    (allowed: boolean) => {
      setAllowMany(allowed);
      if (!allowed) setSelectedEnchantments((previous) => previous.slice(0, 10));
      invalidate();
    },
    [invalidate],
  );

  const reset = useCallback(() => {
    setItem(null);
    setMode('levels');
    setAllowIncompatible(false);
    setAllowMany(false);
    clearSelection();
  }, [clearSelection]);

  const calculate = useCallback(() => {
    if (!item) return;
    if (selectedEnchantments.length === 0) {
      setError('selectAtLeastOne');
      return;
    }
    setIsCalculating(true);
    invalidate();
    // Give React a frame to show the pending state before running the solver.
    setTimeout(() => {
      try {
        setResult(optimizeEnchantments(item, selectedEnchantments, mode));
      } catch (cause: unknown) {
        setError(
          cause instanceof Error &&
            cause.message === 'No valid enchantment combination could be found.'
            ? 'noSolutionFound'
            : 'calculationError',
        );
      } finally {
        setIsCalculating(false);
      }
    }, 30);
  }, [item, selectedEnchantments, mode, invalidate]);

  return {
    item,
    setItem: handleItemChange,
    selectedEnchantments,
    toggleEnchantment,
    getSelectedLevel,
    clearSelection,
    mode,
    setMode: handleModeChange,
    allowIncompatible,
    setAllowIncompatible: handleAllowIncompatibleChange,
    allowMany,
    setAllowMany: handleAllowManyChange,
    result,
    isCalculating,
    error: error ? t(error) : null,
    calculate,
    reset,
  };
}
