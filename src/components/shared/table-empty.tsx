'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { useI18n } from '@/lib/i18n/store';

export function TableEmpty({ colSpan, message }: { colSpan: number; message?: string }) {
  const { t } = useI18n();
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-slate-500">
        {message ?? t('noRowsYet')}
      </TableCell>
    </TableRow>
  );
}
