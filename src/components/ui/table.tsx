import * as React from 'react';
import { cn } from '@/lib/utils';

/** Dense RTL tables — fixed layout keeps headers aligned with cells */
export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        'w-full table-fixed caption-bottom border-collapse text-[11px] leading-snug sm:text-xs',
        className
      )}
      {...props}
    />
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-slate-50 border-b', className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-slate-100 even:bg-slate-50/35 transition-colors hover:bg-teal-50/50',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-9 whitespace-nowrap px-2 text-center align-middle text-[10px] font-bold text-slate-600 sm:px-3 sm:text-[11px]',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'px-2 py-2 text-center align-middle text-slate-800 sm:px-3',
        className
      )}
      {...props}
    />
  );
}
