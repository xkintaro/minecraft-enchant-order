'use client';

import { useRef, useState, type RefObject } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
    <AlertDialog open={open} onOpenChange={setOpen}>
      {count > 0 && (
        <AlertDialogTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          disabled={disabled}
          aria-label={t('clearSelection')}
          title={t('clearSelection')}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </AlertDialogTrigger>
      )}
      <AlertDialogContent initialFocus={cancelRef} finalFocus={returnFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('clearConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('clearConfirmDescription', { count })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef}>{t('cancelClear')}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={disabled || count === 0}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            {t('confirmClear')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
