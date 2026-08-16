import { TableCell, TableRow } from '@/components/ui/table';

export function TableEmpty({ colSpan, message = 'هنوز ردیفی ثبت نشده است' }: { colSpan: number; message?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-slate-500">
        {message}
      </TableCell>
    </TableRow>
  );
}
