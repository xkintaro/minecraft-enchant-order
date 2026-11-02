'use client';

import { useEffect, useRef } from 'react';
import { Anvil, BookOpen, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEnchantCalculator } from '@/lib/minecraft/useEnchantCalculator';
import { getApplicableEnchantments, getEnchantmentGroups } from '@/lib/minecraft/validation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Wordmark } from '@/components/wordmark';
import { ItemSelector } from '@/components/ItemSelector';
import { EnchantmentList } from '@/components/EnchantmentList';
import { OptionsPanel } from '@/components/OptionsPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { SourceNotice } from '@/components/source-notice';

export default function EnchantCalculator() {
  const t = useTranslations('ui');
  const calculator = useEnchantCalculator();
  const resultsPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calculator.result && resultsPanelRef.current) {
      resultsPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [calculator.result]);
  const enchantmentGroups = calculator.item
    ? getEnchantmentGroups(getApplicableEnchantments(calculator.item))
    : [];

  return (
    <div className="min-h-screen bg-background pb-[calc(120px+env(safe-area-inset-bottom))] text-foreground">
      <a
        href="#workbench"
        className="sr-only fixed top-3 left-3 z-50 rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground focus:not-sr-only"
      >
        {t('stepOne')}
      </a>
      <Header />
      <main className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <section className="flex flex-wrap items-end justify-between gap-6 pt-10 pb-9 sm:pt-14 sm:pb-10">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              {t('eyebrow')}
            </p>
            <h1 className="text-[clamp(1.65rem,3.4vw,3rem)] leading-[1.2] font-medium tracking-[-0.055em]">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {t('heroDescription')}
            </p>
          </div>
        </section>

        <div className="mb-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={calculator.reset}
            disabled={calculator.isCalculating}
            className="h-7 text-[10px] text-muted-foreground"
          >
            <RotateCcw className="size-3" />
            {t('reset')}
          </Button>
        </div>

        <section
          id="workbench"
          aria-label={t('eyebrow')}
          className="grid scroll-mt-5 items-start gap-5 md:grid-cols-[260px_minmax(0,1fr)] min-[75rem]:grid-cols-[270px_minmax(0,1fr)_360px]"
        >
          <ItemSelector
            selectedItem={calculator.item}
            onSelectItem={calculator.setItem}
            disabled={calculator.isCalculating}
          />
          <div className="min-w-0 space-y-5">
            <EnchantmentList
              hasItem={calculator.item !== null}
              enchantmentGroups={enchantmentGroups}
              selectedCount={calculator.selectedEnchantments.length}
              getSelectedLevel={calculator.getSelectedLevel}
              onToggleEnchantment={calculator.toggleEnchantment}
              onClear={calculator.clearSelection}
              allowIncompatible={calculator.allowIncompatible}
              disabled={calculator.isCalculating}
            />
          </div>
          <div ref={resultsPanelRef} className="min-w-0 scroll-mt-5 md:col-span-2 min-[75rem]:sticky min-[75rem]:top-5 min-[75rem]:col-span-1">
            <ResultsPanel
              result={calculator.result}
              currentItem={calculator.item}
              isCalculating={calculator.isCalculating}
            />
          </div>
        </section>

        <section id="guide" className="mt-14 scroll-mt-8 border-t pt-8 pb-12 sm:mt-20 sm:pb-16">
          <div className="mb-7 flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <h2 className="font-sans text-sm font-medium tracking-normal">{t('howItWorks')}</h2>
          </div>
          <div className="grid gap-7 sm:grid-cols-3 sm:gap-10">
            {(
              [
                { title: 'guideOne', body: 'guideOneBody', icon: Anvil },
                { title: 'guideTwo', body: 'guideTwoBody', icon: Sparkles },
                { title: 'guideThree', body: 'guideThreeBody', icon: Check },
              ] as const
            ).map(({ title, body, icon: Icon }, index) => (
              <div key={title} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <Icon className="size-3.5" />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-medium tracking-normal">
                    <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                      0{index + 1}
                    </span>
                    {t(title)}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">{t(body)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border bg-card/50 px-4 py-4">
            <h3 className="font-sans text-xs font-semibold tracking-normal">
              {t('guideNoteTitle')}
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground">
              {t('guideNoteBody')}
            </p>
          </div>
        </section>
        <SourceNotice />
      </main>
      <OptionsPanel
        item={calculator.item}
        allowIncompatible={calculator.allowIncompatible}
        onAllowIncompatibleChange={calculator.setAllowIncompatible}
        allowMany={calculator.allowMany}
        onAllowManyChange={calculator.setAllowMany}
        mode={calculator.mode}
        onModeChange={calculator.setMode}
        selectedCount={calculator.selectedEnchantments.length}
        isCalculating={calculator.isCalculating}
        error={calculator.error}
        onCalculate={calculator.calculate}
      />
      <footer className="border-t">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4 px-5 py-6 text-[10px] text-muted-foreground sm:px-8">
          <Wordmark className="text-sm text-foreground" />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="https://github.com/xkintaro/minecraft-enchant-order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-3.5 shrink-0"
              >
                <path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.628-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              minecraft-enchant-order
            </a>
            <a
              href="https://github.com/xkintaro/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              @xkintaro
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
