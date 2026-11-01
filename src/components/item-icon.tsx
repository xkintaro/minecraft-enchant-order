import Image from 'next/image';
import { getItemIconPath } from '@/lib/minecraft/constants';
import type { ItemId } from '@/lib/minecraft/types';
import { cn } from '@/lib/utils';

export function ItemIcon({
  item,
  size = 28,
  className,
}: {
  item: ItemId;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={getItemIconPath(item)}
      alt=""
      width={size}
      height={size}
      className={cn('mc-pixel-icon shrink-0 object-contain', className)}
      unoptimized
    />
  );
}
