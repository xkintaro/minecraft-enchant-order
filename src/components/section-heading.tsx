export function SectionHeading({
  number,
  title,
  description,
  action,
}: {
  number: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/60 font-mono text-xs text-muted-foreground">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-sans text-sm font-semibold tracking-normal">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
