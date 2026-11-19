'use client';

import { useRef, useState, type RefObject } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ClearEnchantmentsButton({
  count,
  disabled,
  onClear,
  returnFocus,
}: {
  count: number;
  disabled: boolean;
  onClear: () => void;
  returnFocus: RefObject<HTMLInputElement | null>;
}) {
  const t = useTranslations('ui');
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {count > 0 && (
        <DialogTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          disabled={disabled}
          aria-label={t('clearSelection')}
          title={t('clearSelection')}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </DialogTrigger>
      )}
      <DialogContent
        initialFocus={cancelRef}
        finalFocus={returnFocus}
        showCloseButton={false}
        className="max-w-xs sm:max-w-sm"
      >
        <DialogHeader className="items-center gap-1.5 text-center sm:items-start sm:text-left">
          <DialogTitle className="leading-normal">{t('clearConfirmTitle')}</DialogTitle>
          <DialogDescription className="text-balance md:text-pretty">
            {t('clearConfirmDescription', { count })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose ref={cancelRef} render={<Button variant="outline" />}>
            {t('cancelClear')}
          </DialogClose>
          <Button
            variant="destructive"
            disabled={disabled || count === 0}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            {t('confirmClear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
