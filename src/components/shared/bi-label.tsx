import { cn } from '@/lib/utils';

/** Professional bilingual field label: Persian + English */
export function BiLabel({
  fa,
  en,
  className,
}: {
  fa: string;
  en: string;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex flex-col gap-0.5 leading-tight', className)}>
      <span>{fa}</span>
      <span className="text-[9px] font-medium tracking-wide text-slate-400">{en}</span>
    </span>
  );
}

export function splitBi(label: string): { fa: string; en: string } {
  if (!label.includes('|')) return { fa: label, en: label };
  const [fa, en] = label.split('|');
  return { fa, en: en || fa };
}

export function StackLabel({ label, className }: { label: string; className?: string }) {
  const { fa, en } = splitBi(label);
  if (fa === en) return <span className={className}>{fa}</span>;
  return <BiLabel fa={fa} en={en} className={className} />;
}
