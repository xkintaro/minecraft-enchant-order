import { cn } from '@/lib/utils';

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-sans text-lg font-semibold tracking-[-0.06em]', className)}>
      enchant<span className="font-normal text-muted-foreground">order</span>
      <span className="ml-0.5 text-primary">.</span>
    </span>
  );
}
