'use client';

import { ArrowUpRight, Globe2, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { getPathname, usePathname } from '@/i18n/navigation';
import { hasLocale } from 'next-intl';
import { localeNames, routing } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/wordmark';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Header() {
  const t = useTranslations('ui');
  const common = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="border-b bg-card/60">
      <div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#" className="group inline-flex items-center gap-2.5" aria-label={t('brand')}>
          <Wordmark />
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            nativeButton={false}
            variant="ghost"
            className="hidden text-xs text-muted-foreground sm:inline-flex"
            render={<a href="#guide" />}
          >
            {t('howItWorks')}
            <ArrowUpRight className="size-3.5" />
          </Button>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <Select
            value={locale}
            onValueChange={(value) => {
              if (hasLocale(routing.locales, value)) {
                // Reinitialize document-level language and theme together on locale changes.
                window.location.assign(getPathname({ locale: value, href: pathname }));
              }
            }}
          >
            <SelectTrigger
              aria-label={common('language')}
              className="w-[124px] border-transparent bg-transparent dark:bg-transparent"
            >
              <Globe2 className="size-3.5 text-muted-foreground" />
              <SelectValue>{localeNames[locale]}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {routing.locales.map((language) => (
                <SelectItem key={language} value={language}>
                  {localeNames[language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label={t('themeToggle')}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="size-4 hidden dark:block" />
            <Moon className="size-4 dark:hidden" />
          </Button>
        </div>
      </div>
    </header>
  );
}
