'use client';

import { useRef, useState } from 'react';
import { Search, TriangleAlert } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { MINECRAFT_ENCHANTMENTS } from '@/lib/minecraft/data';
import { ROMAN_NUMERALS } from '@/lib/minecraft/constants';
import type { EnchantmentId } from '@/lib/minecraft/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/section-heading';
import { ClearEnchantmentsButton } from '@/components/clear-enchantments-button';

type Props = {
  hasItem: boolean;
  enchantmentGroups: EnchantmentId[][];
  selectedCount: number;
  getSelectedLevel: (id: EnchantmentId) => number | null;
  onToggleEnchantment: (id: EnchantmentId, level: number) => void;
  onClear: () => void;
  allowIncompatible: boolean;
  disabled: boolean;
};

export function EnchantmentList({
  hasItem,
  enchantmentGroups,
  selectedCount,
  getSelectedLevel,
  onToggleEnchantment,
  onClear,
  allowIncompatible,
  disabled,
}: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.toLocaleLowerCase(locale);
  const groups = enchantmentGroups
    .map((group) => ({
      key: group[0],
      isConflicting: group.length > 1,
      enchantments: group.filter((id) =>
        t(`enchants.${id}`).toLocaleLowerCase(locale).includes(normalizedQuery),
      ),
    }))
    .filter((group) => group.enchantments.length > 0)
    .sort((left, right) => Number(right.isConflicting) - Number(left.isConflicting));

  return (
    <Card className="relative isolate gap-0 py-5">
      <CardHeader className="px-5 pb-5">
        <SectionHeading
          number="02"
          title={t('ui.stepTwo')}
          description={t('ui.enchantHint')}
          action={
            <ClearEnchantmentsButton
              count={selectedCount}
              disabled={disabled}
              onClear={onClear}
              returnFocus={searchRef}
            />
          }
        />
      </CardHeader>
      <CardContent className="px-5">
        {hasItem && (
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('ui.searchEnchants')}
              aria-label={t('ui.searchEnchants')}
              className="h-9 pl-9 text-xs"
            />
          </div>
        )}
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.key}
              className={cn(
                'divide-y divide-border',
                group.isConflicting && 'rounded-lg border border-dashed bg-muted/25 px-2.5',
              )}
            >
              {group.isConflicting && (
                <p className="flex items-center gap-1.5 py-2 text-[10px] leading-5 text-muted-foreground">
                  <TriangleAlert aria-hidden="true" className="size-3 shrink-0" />
                  {t(allowIncompatible ? 'ui.conflictingGroupAllowed' : 'ui.conflictingGroup')}
                </p>
              )}
              {group.enchantments.map((id) => {
                const selectedLevel = getSelectedLevel(id);
                return (
                  <div
                    key={id}
                    className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2"
                  >
                    <span
                      className={cn(
                        'flex min-w-0 items-center gap-2 text-xs',
                        selectedLevel ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {t(`enchants.${id}`)}
                    </span>
                    <div
                      className="flex shrink-0 gap-1"
                      role="group"
                      aria-label={t(`enchants.${id}`)}
                    >
                      {Array.from(
                        { length: MINECRAFT_ENCHANTMENTS[id].levelMax },
                        (_, index) => index + 1,
                      ).map((level) => (
                        <Button
                          key={level}
                          size="icon-sm"
                          variant={selectedLevel === level ? 'default' : 'outline'}
                          aria-label={`${t(`enchants.${id}`)} — ${t('ui.levelCount', { count: level })}`}
                          aria-pressed={selectedLevel === level}
                          disabled={disabled}
                          onClick={() => onToggleEnchantment(id, level)}
                          className="size-7 rounded-md text-[11px]"
                        >
                          {ROMAN_NUMERALS[level]}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {!hasItem && (
          <div className="min-[75rem]:flex min-[75rem]:min-h-60 min-[75rem]:items-start min-[75rem]:justify-end min-[75rem]:pt-14 min-[75rem]:pr-48">
            <p
              role="status"
              className="py-10 text-center text-xs text-muted-foreground min-[75rem]:relative min-[75rem]:max-w-64 min-[75rem]:rounded-xl min-[75rem]:border min-[75rem]:border-border min-[75rem]:bg-muted min-[75rem]:px-4 min-[75rem]:py-3 min-[75rem]:leading-relaxed min-[75rem]:text-foreground min-[75rem]:after:absolute min-[75rem]:after:top-1/2 min-[75rem]:after:-right-1.5 min-[75rem]:after:size-3 min-[75rem]:after:-translate-y-1/2 min-[75rem]:after:rotate-45 min-[75rem]:after:border-t min-[75rem]:after:border-r min-[75rem]:after:border-border min-[75rem]:after:bg-muted"
            >
              {t('ui.selectItemToStart')}
            </p>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-16 bottom-4 -z-10 hidden size-56 bg-[url('/mascot.webp')] bg-contain bg-right-bottom bg-no-repeat min-[75rem]:block"
            />
          </div>
        )}
        {hasItem && groups.length === 0 && (
          <p role="status" className="py-10 text-center text-xs text-muted-foreground">
            {t('ui.noMatches')}
          </p>
        )}
        {hasItem && (
          <div className="mt-5 border-t pt-4">
            <span className="text-[11px] text-muted-foreground">
              {t('selected', { count: selectedCount })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
