'use client';

import { Plus } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { ROMAN_NUMERALS } from '@/lib/minecraft/constants';
import type { AnvilStep, ItemId } from '@/lib/minecraft/types';
import { Badge } from '@/components/ui/badge';
import { ItemIcon } from '@/components/item-icon';

type StepInput = AnvilStep['left'];

function CombinationInput({
  input,
  label,
  currentItem,
}: {
  input: StepInput;
  label: string;
  currentItem: ItemId;
}) {
  const t = useTranslations();
  const item = input.type === 'item' ? currentItem : 'book';
  return (
    <div className="min-w-0 flex-1 rounded-lg border bg-background/60 p-3">
      <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <ItemIcon item={item} size={22} />
        <span className="min-w-0 text-[11px] font-semibold">{t(`items.${item}`)}</span>
      </div>
      <div className="mt-2 space-y-1">
        {input.enchantments.length === 0 ? (
          <span className="text-[10px] text-muted-foreground">{t('clean')}</span>
        ) : (
          input.enchantments.map(({ id, level }) => (
            <p key={id} className="text-[10px] leading-relaxed text-muted-foreground">
              {t(`enchants.${id}`)}{' '}
              <span className="font-mono text-foreground">{ROMAN_NUMERALS[level]}</span>
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export function AnvilStepCard({
  step,
  currentItem,
  isLast,
}: {
  step: AnvilStep;
  currentItem: ItemId;
  isLast: boolean;
}) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <li className="relative pb-6 last:pb-0">
      {!isLast && <div className="absolute top-7 bottom-0 left-3.5 w-px bg-border" />}
      <div className="relative flex gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-card font-mono text-[11px] text-primary">
          {String(step.stepNumber).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
            <h3 className="font-sans text-xs font-medium tracking-normal">
              {t('stepLabel', { number: step.stepNumber })}
            </h3>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {t('ui.levelCount', { count: step.costLevels })}
            </Badge>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <CombinationInput input={step.left} label={t('ui.target')} currentItem={currentItem} />
            <Plus className="size-3 shrink-0 text-muted-foreground" />
            <CombinationInput
              input={step.right}
              label={t('ui.sacrifice')}
              currentItem={currentItem}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[9px] text-muted-foreground">
            <span>
              {format.number(step.costXp)} {t('xp')}
            </span>
            <span>
              {t('priorWorkPenalty')} {format.number(step.resultingPriorWorkPenalty)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
