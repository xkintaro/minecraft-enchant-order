'use client';

import { Anvil, ArrowDown, Check, Clock3, Layers2, LoaderCircle, Plus } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import type { ItemId, OptimizationResult } from '@/lib/minecraft/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ItemIcon } from '@/components/item-icon';
import { SectionHeading } from '@/components/section-heading';
import { AnvilStepCard } from '@/components/AnvilStepCard';

export function ResultsPanel({
  result,
  currentItem,
  isCalculating,
}: {
  result: OptimizationResult | null;
  currentItem: ItemId | null;
  isCalculating: boolean;
}) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Card className="h-fit gap-5 py-5" aria-busy={isCalculating}>
      <CardHeader className="px-5">
        <SectionHeading
          number="03"
          title={t('ui.stepThree')}
          description={result ? t('ui.resultHint') : t('ui.emptyHint')}
        />
      </CardHeader>
      <CardContent className="px-5">
        <div aria-live="polite" className="sr-only">
          {isCalculating
            ? t('ui.working')
            : result
              ? t('ui.resultReady')
              : t('ui.selectEnchantments')}
        </div>
        {!result || !currentItem || isCalculating ? (
          <div className="flex min-h-[390px] flex-col items-center justify-center rounded-xl border border-dashed bg-background/50 px-5 py-9 text-center">
            <div className="workbench-grid relative mb-7 flex size-40 flex-col items-center justify-center rounded-full [mask-image:radial-gradient(circle,black_45%,transparent_72%)]">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg border bg-card">
                  <ItemIcon item={currentItem ?? 'sword'} size={30} />
                </span>
                <Plus className="size-3 text-muted-foreground" />
                <span className="flex size-12 items-center justify-center rounded-lg border bg-card">
                  <ItemIcon item="book" size={28} />
                </span>
              </div>
              <ArrowDown className="my-3 size-4 text-muted-foreground/60" />
              <span className="flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-card text-primary">
                {isCalculating ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <Anvil className="size-5" />
                )}
              </span>
            </div>
            <h3 className="max-w-56 font-sans text-sm font-semibold tracking-normal">
              {isCalculating ? t('ui.working') : t('emptyTitle')}
            </h3>
            <p className="mt-3 max-w-60 text-xs leading-6 text-muted-foreground">
              {t('ui.emptyBody')}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-primary">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-2.5" />
                </span>
                {t('ui.resultReady')}
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('ui.totalLevels')}</p>
                  <p className="mt-1 font-mono text-4xl font-semibold tracking-tighter">
                    {format.number(result.totalLevels)}
                  </p>
                </div>
                <ItemIcon item={currentItem} size={42} className="mb-1" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-primary/10 pt-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('ui.experience')}</p>
                  <p className="mt-1 font-mono text-xs">
                    {format.number(result.minimumXp)}–{format.number(result.totalXp)}
                  </p>
                </div>
                <div className="border-l pl-3">
                  <p className="text-[10px] text-muted-foreground">{t('ui.combinations')}</p>
                  <p className="mt-1 flex items-center gap-1.5 font-mono text-xs">
                    <Layers2 className="size-3 text-muted-foreground" />
                    {result.steps.length}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Clock3 className="size-3" />
              {t('completedIn')} {format.number(result.elapsedMs, { maximumFractionDigits: 2 })} ms
            </p>
            <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
              {result.mode === 'levels'
                ? t('optimalSolutionLevels')
                : t('optimalSolutionPriorWork')}
            </p>
            <ol className="mt-6">
              <>
                {result.steps.map((step, index) => (
                  <AnvilStepCard
                    key={step.stepNumber}
                    step={step}
                    currentItem={currentItem}
                    isLast={index === result.steps.length - 1}
                  />
                ))}
              </>
            </ol>
            <p className="mt-5 border-t pt-4 text-[10px] leading-5 text-muted-foreground">
              {t('note')}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
