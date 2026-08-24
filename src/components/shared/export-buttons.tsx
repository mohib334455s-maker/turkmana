'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToPdf, type ExportColumn, type ExportRow } from '@/lib/export';
import { useCompanyStore } from '@/lib/company-store';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

type ExportButtonsProps = {
  filename: string;
  title: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  disabled?: boolean;
  size?: 'sm' | 'default';
  className?: string;
  company?: string;
  subtitle?: string;
  onPrint?: () => void;
  printLabel?: string;
  /** When set, PDF button uses this instead of table export */
  onPdf?: () => void | Promise<void>;
};

export function ExportButtons({
  filename,
  title,
  columns,
  rows,
  disabled,
  size = 'sm',
  className,
  company,
  subtitle,
  onPrint,
  printLabel,
  onPdf,
}: ExportButtonsProps) {
  const { tx } = useI18n();
  const storeCompany = useCompanyStore((s) => s.company);
  const resolvedCompany = company || storeCompany;
  const [busy, setBusy] = useState(false);

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={size}
        disabled={disabled}
        className="h-9 rounded-xl px-3 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
        onClick={() => exportToExcel(filename, columns, rows)}
      >
        <FileSpreadsheet className="ml-2 h-4 w-4 text-emerald-600" />
        Excel
      </Button>
      <span className="hidden h-5 w-px bg-slate-200 sm:block" />
      <Button
        type="button"
        variant="ghost"
        size={size}
        disabled={disabled || busy}
        className="h-9 rounded-xl px-3 text-rose-800 hover:bg-rose-50 hover:text-rose-900"
        onClick={async () => {
          setBusy(true);
          try {
            if (onPdf) {
              await onPdf();
            } else {
              await exportToPdf(title, columns, rows, {
                company: resolvedCompany,
                subtitle,
              });
            }
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin text-rose-600" />
        ) : (
          <FileText className="ml-2 h-4 w-4 text-rose-600" />
        )}
        PDF
      </Button>
      {onPrint ? (
        <>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <Button
            type="button"
            variant="ghost"
            size={size}
            disabled={disabled}
            className="h-9 rounded-xl px-3 text-sky-800 hover:bg-sky-50 hover:text-sky-900"
            onClick={onPrint}
          >
            <Printer className="ml-2 h-4 w-4 text-sky-600" />
            {printLabel || tx('چاپ', 'Print')}
          </Button>
        </>
      ) : null}
    </div>
  );
}
