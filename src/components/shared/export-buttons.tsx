'use client';

import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToPdf, type ExportColumn, type ExportRow } from '@/lib/export';
import { cn } from '@/lib/utils';

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
}: ExportButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={disabled}
        className="border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100"
        onClick={() => exportToExcel(filename, columns, rows)}
      >
        <FileSpreadsheet className="ml-2 h-4 w-4 text-emerald-600" />
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={disabled}
        className="border-rose-200 bg-rose-50/50 text-rose-800 hover:bg-rose-100"
        onClick={() => exportToPdf(title, columns, rows, { company, subtitle })}
      >
        <FileText className="ml-2 h-4 w-4 text-rose-600" />
        PDF
      </Button>
    </div>
  );
}
