'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  ChevronDown,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Settings2,
  ShieldAlert,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ItemId, OptimizationMode } from '@/lib/minecraft/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ItemIcon } from '@/components/item-icon';

const COLLAPSED = '104px';
const MEDIUM = 0.55;
const LARGE = 0.9;
const COMPACT_SNAP_POINTS = [COLLAPSED, MEDIUM];
const FULL_SNAP_POINTS = [COLLAPSED, MEDIUM, LARGE];
const PANEL_CHROME_HEIGHT = 101;
type SnapPoint = string | number;

type Props = {
  item: ItemId | null;
  allowIncompatible: boolean;
  onAllowIncompatibleChange: (value: boolean) => void;
  allowMany: boolean;
  onAllowManyChange: (value: boolean) => void;
  mode: OptimizationMode;
  onModeChange: (mode: OptimizationMode) => void;
  selectedCount: number;
  isCalculating: boolean;
  error: string | null;
  onCalculate: () => void;
};

export function OptionsPanel({
  item,
  allowIncompatible,
  onAllowIncompatibleChange,
  allowMany,
  onAllowManyChange,
  mode,
  onModeChange,
  selectedCount,
  isCalculating,
  error,
  onCalculate,
}: Props) {
  const t = useTranslations();
  const [snapPoint, setSnapPoint] = useState<SnapPoint>(COLLAPSED);
  const [canExpand, setCanExpand] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isExpanded = snapPoint !== COLLAPSED;
  const isLarge = snapPoint === LARGE;
  const visibleHeight = typeof snapPoint === 'number' ? `${snapPoint * 100}dvh` : snapPoint;

  useEffect(() => {
    const settings = settingsRef.current;
    const content = contentRef.current;
    if (!isExpanded || !settings || !content) return;

    let frame = 0;
    function measure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const style = getComputedStyle(settings!);
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const requiredHeight = content!.getBoundingClientRect().height + padding;
        const availableHeight = window.innerHeight * MEDIUM - PANEL_CHROME_HEIGHT;
        // Compare against the normal panel, even while enlarged, so Restore stays available.
        const overflows = requiredHeight > availableHeight + 1;
        setCanExpand(overflows);
        if (!overflows) setSnapPoint((current) => (current === LARGE ? MEDIUM : current));
      });
    }

    const observer = new ResizeObserver(measure);
    observer.observe(settings);
    observer.observe(content);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [isExpanded]);

  function calculate() {
    setSnapPoint(COLLAPSED);
    onCalculate();
  }

  return (
    <Drawer
      open
      modal={false}
      disablePointerDismissal={!isExpanded}
      snapPoints={canExpand ? FULL_SNAP_POINTS : COMPACT_SNAP_POINTS}
      snapPoint={snapPoint}
      onSnapPointChange={(point) => setSnapPoint(point ?? COLLAPSED)}
      onOpenChange={(open) => {
        if (!open) setSnapPoint(COLLAPSED);
      }}
      showSwipeHandle
      snapToSequentialPoints
    >
      <DrawerContent
        initialFocus={false}
        finalFocus={false}
        aria-modal={false}
        className="border-t bg-card [--drawer-content-max-height:100dvh]"
      >
        <DrawerTitle className="sr-only">{t('ui.settings')}</DrawerTitle>
        <div
          style={{ height: `calc(${visibleHeight} - 13px)` } as CSSProperties}
          className="flex min-h-0 flex-col"
        >
          <div className="mx-auto flex h-[88px] w-full max-w-[1480px] shrink-0 items-center gap-3 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-5 sm:px-8">
            <Button
              variant="outline"
              size="icon-lg"
              aria-label={isExpanded ? t('ui.collapseSettings') : t('ui.expandSettings')}
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? 'calculation-settings' : undefined}
              onClick={() => setSnapPoint(isExpanded ? COLLAPSED : MEDIUM)}
              className="size-10 shrink-0"
            >
              {isExpanded ? <ChevronDown className="size-4" /> : <Settings2 className="size-4" />}
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {item && <ItemIcon item={item} size={30} className="hidden sm:block" />}
              <div className="min-w-0">
                <p className="font-sans text-xs font-semibold tracking-normal">
                  {item ? t(`items.${item}`) : t('ui.stepOne')}
                </p>
                <DrawerDescription className="mt-1 truncate text-[10px] leading-4">
                  {t('ui.selectedSummary', { count: selectedCount })}
                </DrawerDescription>
                {error && (
                  <p
                    role="alert"
                    className="max-w-80 truncate text-[10px] text-destructive"
                    title={error}
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>
            <Button
              disabled={!item || selectedCount === 0 || isCalculating}
              onClick={calculate}
              className="h-11 shrink-0 gap-3 px-5 text-xs sm:min-w-48"
            >
              {isCalculating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>
                  <span className="sm:hidden">{t('ui.calculateShort')}</span>
                  <span className="hidden sm:inline">{t('calculate')}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
              {isCalculating && <span className="sr-only">{t('ui.working')}</span>}
            </Button>
          </div>
          {isExpanded && (
            <div
              id="calculation-settings"
              ref={settingsRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t pb-[calc(1rem+env(safe-area-inset-bottom))]"
              data-base-ui-swipe-ignore
            >
              <div ref={contentRef} className="mx-auto w-full max-w-[1480px] px-5 py-6 sm:px-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-sans text-sm font-semibold tracking-normal">
                      {t('ui.settings')}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">{t('ui.settingsHint')}</p>
                  </div>
                  {canExpand && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={isLarge ? t('ui.restoreSettings') : t('ui.maximizeSettings')}
                      onClick={() => setSnapPoint(isLarge ? MEDIUM : LARGE)}
                    >
                      {isLarge ? (
                        <Minimize2 className="size-4" />
                      ) : (
                        <Maximize2 className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-12">
                  <div className="divide-y rounded-xl border px-4">
                    <div className="flex items-center justify-between gap-4 py-4">
                      <label htmlFor="incompatible" className="cursor-pointer">
                        <span className="block text-xs font-medium">{t('allowIncompatible')}</span>
                        <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                          {t('ui.incompatibleHint')}
                        </span>
                      </label>
                      <Switch
                        id="incompatible"
                        aria-label={t('allowIncompatible')}
                        checked={allowIncompatible}
                        onCheckedChange={onAllowIncompatibleChange}
                        disabled={isCalculating}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 py-4">
                      <label htmlFor="many" className="cursor-pointer">
                        <span className="block text-xs font-medium">{t('allowMany')}</span>
                        <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                          {t('ui.manyHint')}
                        </span>
                      </label>
                      <Switch
                        id="many"
                        aria-label={t('allowMany')}
                        checked={allowMany}
                        onCheckedChange={onAllowManyChange}
                        disabled={isCalculating}
                      />
                    </div>
                  </div>
                  <div>
                    <label id="optimize-label" className="mb-2 block text-xs font-medium">
                      {t('optimizeFor')}
                    </label>
                    <Select
                      value={mode}
                      onValueChange={(value) => {
                        if (value === 'levels' || value === 'prior_work') onModeChange(value);
                      }}
                      disabled={isCalculating}
                    >
                      <SelectTrigger
                        aria-labelledby="optimize-label"
                        className="h-11 w-full text-xs"
                      >
                        <SelectValue>
                          {mode === 'levels' ? t('leastXpLevels') : t('leastPriorWork')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="levels">{t('leastXpLevels')}</SelectItem>
                        <SelectItem value="prior_work">{t('leastPriorWork')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-3 text-[11px] leading-6 text-muted-foreground">
                      {t('ui.helpBody')}
                    </p>
                  </div>
                </div>
                {error && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive"
                  >
                    <ShieldAlert className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
