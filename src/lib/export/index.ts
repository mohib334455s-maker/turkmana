export type ExportColumn = { key: string; label: string };

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(filename: string, columns: ExportColumn[], rows: ExportRow[]) {
  const header = columns.map((c) => escapeCsv(c.label)).join(',');
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val == null) return '""';
        return escapeCsv(String(val));
      })
      .join(',')
  );
  const csv = `\ufeff${[header, ...body].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPdf(title: string, columns: ExportColumn[], rows: ExportRow[]) {
  const tableHead = columns.map((c) => `<th>${c.label}</th>`).join('');
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => {
            const val = row[c.key];
            return `<td>${val == null ? '' : String(val)}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Tahoma, Arial, sans-serif; padding: 24px; color: #0f172a; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    p { font-size: 12px; color: #64748b; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; }
    th { background: #f1f5f9; }
    tr:nth-child(even) td { background: #f8fafc; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>تاریخ چاپ: ${new Date().toLocaleString('fa-IR')}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody || `<tr><td colspan="${columns.length}">داده‌ای موجود نیست</td></tr>`}</tbody>
  </table>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
