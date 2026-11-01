import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

export function SourceNotice() {
  const t = useTranslations('about');

  return (
    <section aria-labelledby="about-project" className="border-t py-8 sm:py-10">
      <div className="max-w-3xl">
        <h2
          id="about-project"
          className="flex items-center gap-2 font-sans text-sm font-medium tracking-normal"
        >
          <Info aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          {t('title')}
        </h2>
        <div className="mt-4 space-y-3 text-xs leading-6 text-muted-foreground">
          <p>{t('origin')}</p>
          <p>{t('remake')}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs">
          <a
            href="https://github.com/iamcal/enchant-order"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t('repository')}
          </a>
          <a
            href="https://iamcal.github.io/enchant-order/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t('website')}
          </a>
        </div>
      </div>
    </section>
  );
}
