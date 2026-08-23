import { brandLogosHtml, companyBrandName } from '@/lib/brand';

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

function openPrintHtml(html: string) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function brandHeaderHtml(opts: {
  title: string;
  subtitle?: string;
  company?: string;
}) {
  const brand = companyBrandName(opts.company, 'fa');
  const logoBlock =
    brandLogosHtml(opts.company) ||
    `<div class="logo-fallback">${brand}</div>`;
  const isTurkmen = opts.company === 'turkmen';
  const headerClass = isTurkmen ? 'turkmen' : 'arya';

  return `
  <header class="brand-header ${headerClass}">
    <div class="logo-wrap">${logoBlock}</div>
    <div class="brand-text">
      <h1>${opts.title}</h1>
      ${opts.subtitle ? `<p class="sub">${opts.subtitle}</p>` : ''}
      <p class="meta">${brand} · تاریخ چاپ: ${new Date().toLocaleString('fa-IR')}</p>
    </div>
  </header>`;
}

const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: Tahoma, Arial, sans-serif; padding: 24px; color: #0f172a; margin: 0; }
  .brand-header {
    display: flex; align-items: center; gap: 20px;
    padding: 16px 20px; border-radius: 16px; margin-bottom: 20px;
    border: 1px solid #cbd5e1;
  }
  .brand-header.turkmen {
    background: linear-gradient(90deg, #020617 0%, #064e3b 100%);
    border-color: #065f46; color: #fff;
  }
  .brand-header.arya {
    background: linear-gradient(90deg, #0369a1 0%, #1e3a8a 100%);
    border-color: #0284c7; color: #fff;
  }
  .logo-wrap {
    width: 150px; height: 72px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
    flex-shrink: 0;
  }
  .logo { max-width: 100%; max-height: 100%; object-fit: contain; }
  .logo-fallback {
    width: 72px; height: 72px; border-radius: 12px; background: #fff;
    color: #0f766e; font-weight: 800; display: flex; align-items: center;
    justify-content: center; font-size: 22px; flex-shrink: 0;
  }
  .brand-text h1 { font-size: 20px; margin: 0 0 4px; }
  .brand-text .sub { font-size: 13px; margin: 0 0 4px; opacity: 0.9; }
  .brand-text .meta { font-size: 11px; margin: 0; opacity: 0.75; }
  h2 { font-size: 15px; margin: 20px 0 10px; color: #0f172a; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .kpi {
    border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; background: #f8fafc;
  }
  .kpi .label { font-size: 11px; color: #64748b; }
  .kpi .value { font-size: 15px; font-weight: 800; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; }
  th { background: #f1f5f9; }
  tr:nth-child(even) td { background: #f8fafc; }
  .footer {
    margin-top: 28px; padding-top: 12px; border-top: 1px dashed #cbd5e1;
    font-size: 11px; color: #64748b; display: flex; justify-content: space-between;
  }
  @media print {
    body { padding: 10px; }
    .brand-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

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

export function exportToPdf(
  title: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  opts?: { company?: string; subtitle?: string }
) {
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
  <style>${PRINT_CSS}</style>
</head>
<body>
  ${brandHeaderHtml({ title, subtitle: opts?.subtitle, company: opts?.company })}
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody || `<tr><td colspan="${columns.length}">داده‌ای موجود نیست</td></tr>`}</tbody>
  </table>
  <div class="footer">
    <span>ERP System</span>
    <span>${companyBrandName(opts?.company, 'fa')}</span>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  openPrintHtml(html);
}

export type ContractExportParty = {
  number: string | number;
  location?: string;
  qty?: number;
  arrived?: number;
  unloaded?: number;
  sold?: number;
  shortage?: number;
  waste?: number;
  sellable?: number;
  transit?: number;
  status?: string;
};

export type ContractExportData = {
  id: number;
  number: string;
  supplierName: string;
  product: string;
  location?: string;
  company: string;
  status?: string;
  totalQty: number;
  pricePerUnit: number;
  arrived: number;
  unloaded: number;
  sold: number;
  shortage: number;
  waste: number;
  sellable: number;
  transit: number;
  parties: ContractExportParty[];
};

function n(v: number | undefined) {
  return Number(v || 0).toLocaleString('fa-IR');
}

/** Full printable sheet for a single contract (logo + KPIs + parties). */
export function exportContractDocument(data: ContractExportData) {
  const statusLabel = data.status === 'inactive' ? 'غیرفعال' : 'فعال';
  const companyLabel = companyBrandName(data.company, 'fa');

  const partyRows = data.parties
    .map(
      (p) => `<tr>
      <td>${p.number ?? ''}</td>
      <td>${p.location ?? ''}</td>
      <td>${n(p.qty)}</td>
      <td>${n(p.arrived)}</td>
      <td>${n(p.unloaded)}</td>
      <td>${n(p.sold)}</td>
      <td>${n(p.shortage)}</td>
      <td>${n(p.waste)}</td>
      <td>${n(p.sellable)}</td>
      <td>${n(p.transit)}</td>
      <td>${p.status === 'inactive' ? 'غیرفعال' : 'فعال'}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>خروجی قرارداد ${data.number}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  ${brandHeaderHtml({
    title: `خروجی قرارداد ${data.number}`,
    subtitle: `${data.supplierName} — ${data.product}`,
    company: data.company,
  })}

  <div class="grid">
    <div class="kpi"><div class="label">شماره قرارداد</div><div class="value">${data.number}</div></div>
    <div class="kpi"><div class="label">طرف قرارداد</div><div class="value">${data.supplierName}</div></div>
    <div class="kpi"><div class="label">کالا</div><div class="value">${data.product}</div></div>
    <div class="kpi"><div class="label">شرکت / وضعیت</div><div class="value">${companyLabel} · ${statusLabel}</div></div>
    <div class="kpi"><div class="label">مقدار کل (تن)</div><div class="value">${n(data.totalQty)}</div></div>
    <div class="kpi"><div class="label">قیمت واحد</div><div class="value">${n(data.pricePerUnit)}</div></div>
    <div class="kpi"><div class="label">محل</div><div class="value">${data.location || '—'}</div></div>
    <div class="kpi"><div class="label">تعداد پارتی</div><div class="value">${data.parties.length}</div></div>
  </div>

  <h2>وضعیت اجرا</h2>
  <div class="grid">
    <div class="kpi"><div class="label">آمد</div><div class="value">${n(data.arrived)}</div></div>
    <div class="kpi"><div class="label">تخلیه</div><div class="value">${n(data.unloaded)}</div></div>
    <div class="kpi"><div class="label">فروش</div><div class="value">${n(data.sold)}</div></div>
    <div class="kpi"><div class="label">کسرات</div><div class="value">${n(data.shortage)}</div></div>
    <div class="kpi"><div class="label">ضایعات</div><div class="value">${n(data.waste)}</div></div>
    <div class="kpi"><div class="label">قابل فروش</div><div class="value">${n(data.sellable)}</div></div>
    <div class="kpi"><div class="label">ترانزیت</div><div class="value">${n(data.transit)}</div></div>
    <div class="kpi"><div class="label">باقی قرارداد</div><div class="value">${n(data.totalQty - data.arrived)}</div></div>
  </div>

  <h2>پارتی‌های قرارداد</h2>
  <table>
    <thead>
      <tr>
        <th>شماره</th><th>محل</th><th>مقدار</th><th>آمد</th><th>تخلیه</th>
        <th>فروش</th><th>کسرات</th><th>ضایعات</th><th>قابل فروش</th><th>ترانزیت</th><th>وضعیت</th>
      </tr>
    </thead>
    <tbody>
      ${partyRows || '<tr><td colspan="11">پارتی ثبت نشده است</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    <span>خروجی اختصاصی قرارداد ${data.number}</span>
    <span>${companyLabel} · ERP System</span>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  openPrintHtml(html);
}

/** Download JSON snapshot for one contract. */
export function downloadContractJson(data: ContractExportData) {
  const payload = {
    version: 1,
    type: 'contract-export',
    exportedAt: new Date().toISOString(),
    contract: data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `contract-${data.number}-export.json`);
}
