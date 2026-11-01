'use client';

import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { MINECRAFT_ITEMS } from '@/lib/minecraft/data';
import type { ItemId } from '@/lib/minecraft/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ItemIcon } from '@/components/item-icon';
import { SectionHeading } from '@/components/section-heading';

export function ItemSelector({
  selectedItem,
  onSelectItem,
  disabled,
}: {
  selectedItem: ItemId | null;
  onSelectItem: (item: ItemId) => void;
  disabled: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const visibleItems = MINECRAFT_ITEMS.filter((item) =>
    t(`items.${item}`).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)),
  );

  return (
    <Card className="h-fit gap-5 py-5">
      <CardHeader className="px-5">
        <SectionHeading number="01" title={t('ui.stepOne')} description={t('ui.itemHint')} />
      </CardHeader>
      <CardContent className="space-y-4 px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('ui.searchItems')}
            aria-label={t('ui.searchItems')}
            className="h-9 pl-9 text-xs"
          />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {visibleItems.map((item) => (
            <Button
              key={item}
              variant="ghost"
              disabled={disabled}
              onClick={() => onSelectItem(item)}
              aria-pressed={selectedItem === item}
              aria-label={t(`items.${item}`)}
              title={t(`items.${item}`)}
              className={cn(
                'group relative h-[74px] min-w-0 flex-col gap-2 rounded-lg border border-transparent px-1 py-2 font-sans',
                selectedItem === item
                  ? 'border-primary/40 bg-primary/10 hover:bg-primary/15'
                  : 'hover:border-border hover:bg-muted',
              )}
            >
              {selectedItem === item && (
                <Check className="absolute top-1 right-1 size-2.5 text-primary" />
              )}
              <ItemIcon item={item} size={25} />
              <span className="block w-full truncate text-center text-[10px] font-medium">
                {t(`items.${item}`)}
              </span>
            </Button>
          ))}
        </div>
        {visibleItems.length === 0 && (
          <p role="status" className="py-8 text-center text-xs text-muted-foreground">
            {t('ui.noMatches')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
