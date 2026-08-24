import {
  ARYA_LOGO_SRC,
  TURKMEN_LOGO_SRC,
  companyBrandName,
  type BrandCompany,
} from '@/lib/brand';

export type ExportColumn = { key: string; label: string };

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

/** Reliable print window — avoid noopener (returns null) and embed assets. */
function openPrintHtml(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    const revoke = () => URL.revokeObjectURL(url);
    win.addEventListener('beforeunload', revoke);
    setTimeout(revoke, 120_000);
    return;
  }

  // Popup blocked → same-page iframe print fallback
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
        URL.revokeObjectURL(url);
      }, 1500);
    }
  };
}

const logoCache = new Map<string, string>();

async function logoDataUri(company?: BrandCompany | null): Promise<string> {
  const path =
    company === 'arya' ? ARYA_LOGO_SRC : company === 'turkmen' ? TURKMEN_LOGO_SRC : '';
  if (!path) return '';
  const cached = logoCache.get(path);
  if (cached) return cached;
  try {
    const res = await fetch(path, { cache: 'force-cache' });
    if (!res.ok) return '';
    const blob = await res.blob();
    const dataUri = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
    if (dataUri) logoCache.set(path, dataUri);
    return dataUri;
  } catch {
    return '';
  }
}

async function brandHeaderHtml(opts: {
  title: string;
  subtitle?: string;
  company?: string;
}) {
  const brand = companyBrandName(opts.company, 'fa');
  const dataUri = await logoDataUri(opts.company);
  const logoBlock = dataUri
    ? `<img src="${dataUri}" alt="${escapeHtml(brand)}" class="logo" />`
    : `<div class="logo-fallback">${escapeHtml(brand.slice(0, 2))}</div>`;
  const isTurkmen = opts.company === 'turkmen';
  const headerClass = isTurkmen ? 'turkmen' : 'arya';

  return `
  <header class="brand-header ${headerClass}">
    <div class="logo-wrap">${logoBlock}</div>
    <div class="brand-text">
      <h1>${escapeHtml(opts.title)}</h1>
      ${opts.subtitle ? `<p class="sub">${escapeHtml(opts.subtitle)}</p>` : ''}
      <p class="meta">${escapeHtml(brand)} · تاریخ چاپ: ${new Date().toLocaleString('fa-IR')}</p>
    </div>
  </header>`;
}

const PRINT_CSS = `
  * { box-sizing: border-box; }
  @page { size: A4 landscape; margin: 12mm; }
  body {
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    padding: 28px 32px;
    color: #0f172a;
    margin: 0;
    background: #fff;
    line-height: 1.45;
  }
  .brand-header {
    display: flex; align-items: center; gap: 24px;
    padding: 20px 24px; border-radius: 18px; margin-bottom: 24px;
    border: 1px solid #cbd5e1;
  }
  .brand-header.turkmen {
    background: linear-gradient(135deg, #020617 0%, #064e3b 55%, #047857 100%);
    border-color: #065f46; color: #fff;
  }
  .brand-header.arya {
    background: linear-gradient(135deg, #0369a1 0%, #1e3a8a 55%, #0ea5e9 100%);
    border-color: #0284c7; color: #fff;
  }
  .logo-wrap {
    width: 168px; height: 80px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; overflow: visible;
    flex-shrink: 0; background: transparent;
  }
  .logo {
    max-width: 100%; max-height: 100%; object-fit: contain;
    background: transparent !important;
  }
  .logo-fallback {
    width: 72px; height: 72px; border-radius: 14px; background: rgba(255,255,255,0.92);
    color: #0f766e; font-weight: 800; display: flex; align-items: center;
    justify-content: center; font-size: 22px; flex-shrink: 0;
  }
  .brand-text h1 { font-size: 22px; margin: 0 0 6px; font-weight: 800; }
  .brand-text .sub { font-size: 14px; margin: 0 0 6px; opacity: 0.92; font-weight: 500; }
  .brand-text .meta { font-size: 11px; margin: 0; opacity: 0.78; }
  h2 {
    font-size: 14px; margin: 24px 0 12px; color: #334155;
    font-weight: 700; border-right: 4px solid #0d9488; padding-right: 10px;
  }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .kpi {
    border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px;
    background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  }
  .kpi .label { font-size: 10px; color: #64748b; font-weight: 600; }
  .kpi .value { font-size: 16px; font-weight: 800; margin-top: 6px; color: #0f172a; }
  table {
    width: 100%; border-collapse: separate; border-spacing: 0;
    font-size: 11px; border-radius: 12px; overflow: hidden;
    border: 1px solid #cbd5e1;
  }
  th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; text-align: right; }
  th {
    background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
    font-weight: 700; color: #334155; font-size: 10px;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #f8fafc; }
  .doc-sheet {
    max-width: 820px; margin: 0 auto; border: 2px solid #cbd5e1;
    border-radius: 20px; padding: 28px; background: #fff;
  }
  .doc-title {
    text-align: center; font-size: 20px; font-weight: 800;
    margin: 0 0 20px; color: #0f766e;
  }
  .doc-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px;
    margin-bottom: 24px; font-size: 13px;
  }
  .doc-grid .lbl { color: #64748b; font-size: 11px; margin-bottom: 2px; }
  .doc-grid .val { font-weight: 700; color: #0f172a; }
  .amount-box {
    margin: 20px 0; padding: 16px 20px; border-radius: 14px;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%);
    border: 1px solid #99f6e4; text-align: center;
  }
  .amount-box .lbl { font-size: 12px; color: #0f766e; font-weight: 600; }
  .amount-box .val { font-size: 26px; font-weight: 900; color: #065f46; margin-top: 4px; }
  .signatures {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
    margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1;
    font-size: 12px; color: #64748b; text-align: center;
  }
  .signatures .line {
    margin-top: 48px; border-top: 1px solid #94a3b8; padding-top: 8px;
    font-weight: 600; color: #334155;
  }
  .footer {
    margin-top: 32px; padding-top: 14px; border-top: 1px dashed #cbd5e1;
    font-size: 10px; color: #64748b; display: flex; justify-content: space-between;
  }
  @media print {
    body { padding: 0; }
    .brand-header, .kpi, th, .amount-box, .logo-wrap, .text-block {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .doc-sheet { border: none; box-shadow: none; }
  }
  .text-doc { max-width: 820px; margin: 0 auto; }
  .text-block {
    margin-bottom: 18px; padding: 16px 18px;
    border: 1px solid #e2e8f0; border-radius: 14px;
    background: #fff; line-height: 1.75; font-size: 13px;
  }
  .text-block h3 {
    margin: 0 0 10px; font-size: 15px; font-weight: 800; color: #0f766e;
    border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;
  }
  .text-block p { margin: 4px 0; color: #334155; }
  .text-block .lbl { color: #64748b; font-weight: 600; }
  .text-sep { border: none; border-top: 2px dashed #cbd5e1; margin: 20px 0; }
  .text-summary {
    padding: 14px 18px; border-radius: 14px; margin-bottom: 20px;
    background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px;
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

export async function exportToPdf(
  title: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  opts?: { company?: string; subtitle?: string }
) {
  const headerHtml = await brandHeaderHtml({
    title,
    subtitle: opts?.subtitle,
    company: opts?.company,
  });
  const tableHead = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => {
            const val = row[c.key];
            return `<td>${val == null ? '' : escapeHtml(String(val))}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  ${headerHtml}
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody || `<tr><td colspan="${columns.length}">داده‌ای موجود نیست</td></tr>`}</tbody>
  </table>
  <div class="footer">
    <span>ERP System</span>
    <span>${escapeHtml(companyBrandName(opts?.company, 'fa'))}</span>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    };
  </script>
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
  paidAmount?: number;
  contractValue?: number;
  parties: ContractExportParty[];
};

function n(v: number | undefined) {
  return Number(v || 0).toLocaleString('fa-IR');
}

function money(v: number | undefined) {
  return `$${n(v)}`;
}

function printScript() {
  return `<script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    };
  </script>`;
}

export type ContractListExportRow = {
  number: string;
  supplierName: string;
  product: string;
  totalQty: number;
  arrived: number;
  unloaded: number;
  sold: number;
  sellable: number;
  transit: number;
  location?: string;
  status?: string;
  paidAmount?: number;
  paidPercent?: number;
  contractValue?: number;
};

/** Text-based PDF for contracts list page (no table/cards). */
export async function exportContractsListDocument(
  rows: ContractListExportRow[],
  opts: { company?: string; title?: string }
) {
  const title = opts.title || 'خلاصه قراردادها';
  const companyLabel = companyBrandName(opts.company, 'fa');
  const headerHtml = await brandHeaderHtml({
    title,
    subtitle: 'خروجی متنی — هر قرارداد به‌صورت پاراگراف',
    company: opts.company,
  });

  const totalQty = rows.reduce((s, r) => s + Number(r.totalQty || 0), 0);
  const totalPaid = rows.reduce((s, r) => s + Number(r.paidAmount || 0), 0);

  const blocks = rows
    .map(
      (r, i) => `
    <div class="text-block">
      <h3>${i + 1}. قرارداد ${escapeHtml(r.number)}</h3>
      <p><span class="lbl">طرف قرارداد:</span> ${escapeHtml(r.supplierName)}</p>
      <p><span class="lbl">کالا:</span> ${escapeHtml(r.product)} · <span class="lbl">محل:</span> ${escapeHtml(r.location || '—')}</p>
      <p><span class="lbl">مقدار کل:</span> ${n(r.totalQty)} تن · <span class="lbl">آمد:</span> ${n(r.arrived)} · <span class="lbl">تخلیه:</span> ${n(r.unloaded)} · <span class="lbl">فروش:</span> ${n(r.sold)}</p>
      <p><span class="lbl">قابل فروش:</span> ${n(r.sellable)} · <span class="lbl">ترانزیت:</span> ${n(r.transit)} · <span class="lbl">وضعیت:</span> ${r.status === 'inactive' ? 'غیرفعال' : 'فعال'}</p>
      <p><span class="lbl">ارزش قرارداد:</span> ${money(r.contractValue)} · <span class="lbl">پرداخت‌شده:</span> ${money(r.paidAmount)} (${r.paidPercent ?? 0}٪)</p>
    </div>`
    )
    .join('<hr class="text-sep" />');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  ${headerHtml}
  <div class="text-doc">
    <div class="text-summary">
      <p><strong>تعداد قرارداد:</strong> ${rows.length} · <strong>مجموع مقدار:</strong> ${n(totalQty)} تن · <strong>مجموع پرداخت:</strong> ${money(totalPaid)}</p>
    </div>
    ${blocks || '<p class="text-block">قراردادی ثبت نشده است.</p>'}
  </div>
  <div class="footer">
    <span>${escapeHtml(title)} · ${escapeHtml(companyLabel)}</span>
    <span>ERP System</span>
  </div>
  ${printScript()}
</body>
</html>`;

  openPrintHtml(html);
}

/** Full printable text document for a single contract. */
export async function exportContractDocument(data: ContractExportData) {
  const statusLabel = data.status === 'inactive' ? 'غیرفعال' : 'فعال';
  const companyLabel = companyBrandName(data.company, 'fa');
  const contractVal =
    data.contractValue ?? Number(data.totalQty || 0) * Number(data.pricePerUnit || 0);
  const paid = Number(data.paidAmount || 0);
  const remaining = contractVal - paid;
  const pct = contractVal > 0 ? Math.round((paid / contractVal) * 1000) / 10 : 0;

  const partyText = data.parties.length
    ? data.parties
        .map(
          (p, i) => `
      <p><strong>پارتی ${i + 1} — ${escapeHtml(String(p.number ?? ''))}</strong> (${escapeHtml(String(p.location ?? ''))})</p>
      <p>مقدار ${n(p.qty)} · آمد ${n(p.arrived)} · تخلیه ${n(p.unloaded)} · فروش ${n(p.sold)} · قابل فروش ${n(p.sellable)} · ترانزیت ${n(p.transit)} · ${p.status === 'inactive' ? 'غیرفعال' : 'فعال'}</p>`
        )
        .join('')
    : '<p>پارتی ثبت نشده است.</p>';

  const headerHtml = await brandHeaderHtml({
    title: `خروجی قرارداد ${data.number}`,
    subtitle: `${data.supplierName} — ${data.product}`,
    company: data.company,
  });

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>خروجی قرارداد ${escapeHtml(data.number)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  ${headerHtml}
  <div class="text-doc">
    <div class="text-block">
      <h3>مشخصات قرارداد ${escapeHtml(data.number)}</h3>
      <p><span class="lbl">طرف قرارداد:</span> ${escapeHtml(data.supplierName)}</p>
      <p><span class="lbl">کالا:</span> ${escapeHtml(data.product)} · <span class="lbl">محل:</span> ${escapeHtml(data.location || '—')}</p>
      <p><span class="lbl">شرکت:</span> ${escapeHtml(companyLabel)} · <span class="lbl">وضعیت:</span> ${statusLabel}</p>
      <p><span class="lbl">مقدار کل:</span> ${n(data.totalQty)} تن · <span class="lbl">قیمت واحد:</span> ${money(data.pricePerUnit)}</p>
      <p><span class="lbl">ارزش قرارداد:</span> ${money(contractVal)} · <span class="lbl">پرداخت‌شده:</span> ${money(paid)} (${pct}٪) · <span class="lbl">باقی:</span> ${money(remaining)}</p>
    </div>
    <div class="text-block">
      <h3>وضعیت اجرا</h3>
      <p>آمد ${n(data.arrived)} · تخلیه ${n(data.unloaded)} · فروش ${n(data.sold)} · کسرات ${n(data.shortage)} · ضایعات ${n(data.waste)} · قابل فروش ${n(data.sellable)} · ترانزیت ${n(data.transit)} · باقی قرارداد ${n(data.totalQty - data.arrived)} تن</p>
    </div>
    <div class="text-block">
      <h3>پارتی‌های قرارداد</h3>
      ${partyText}
    </div>
  </div>
  <div class="footer">
    <span>خروجی قرارداد ${escapeHtml(data.number)} · ${escapeHtml(companyLabel)}</span>
    <span>ERP System</span>
  </div>
  ${printScript()}
</body>
</html>`;

  openPrintHtml(html);
}

export type ExchangeRemittancePrint = {
  houseName: string;
  housePhone?: string;
  houseWhatsapp?: string;
  houseLocation?: string;
  company: string;
  remittanceNo: string;
  dateJalali: string;
  dateGregorian: string;
  kind: string;
  counterparty: string;
  details: string;
  currency: string;
  received: number;
  paid: number;
  balance: number;
  drawerSource?: string;
  purchaseRef?: string;
  rate?: number;
  commission?: number;
  notes?: string;
};

function fmtMoney(v: number) {
  return Number(v || 0).toLocaleString('fa-IR', { maximumFractionDigits: 2 });
}

/** Printable remittance / withdrawal slip for exchange transactions. */
export async function exportExchangeRemittance(data: ExchangeRemittancePrint) {
  const amount = data.received || data.paid;
  const isIn = data.received > 0;
  const companyLabel = companyBrandName(data.company, 'fa');
  const headerHtml = await brandHeaderHtml({
    title: 'سند حواله / معامله صرافی',
    subtitle: data.houseName,
    company: data.company,
  });

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>حواله ${escapeHtml(data.remittanceNo)} — ${escapeHtml(data.houseName)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  ${headerHtml}
  <div class="doc-sheet">
    <p class="doc-title">${escapeHtml(data.kind)}</p>
    <div class="doc-grid">
      <div><div class="lbl">نمبر حواله</div><div class="val num">${escapeHtml(data.remittanceNo)}</div></div>
      <div><div class="lbl">تاریخ شمسی</div><div class="val num">${escapeHtml(data.dateJalali)}</div></div>
      <div><div class="lbl">تاریخ میلادی</div><div class="val num">${escapeHtml(data.dateGregorian)}</div></div>
      <div><div class="lbl">طرف معامله</div><div class="val">${escapeHtml(data.counterparty || '—')}</div></div>
      <div><div class="lbl">صرافی / حساب</div><div class="val">${escapeHtml(data.houseName)}</div></div>
      <div><div class="lbl">محل</div><div class="val">${escapeHtml(data.houseLocation || '—')}</div></div>
      <div><div class="lbl">تماس</div><div class="val num">${escapeHtml(data.housePhone || '—')}</div></div>
      <div><div class="lbl">واتساپ</div><div class="val num">${escapeHtml(data.houseWhatsapp || '—')}</div></div>
      ${data.drawerSource ? `<div><div class="lbl">منبع برداشت / درک</div><div class="val">${escapeHtml(data.drawerSource)}</div></div>` : ''}
      ${data.purchaseRef ? `<div><div class="lbl">مرجع خرید</div><div class="val">${escapeHtml(data.purchaseRef)}</div></div>` : ''}
      <div><div class="lbl">شرکت</div><div class="val">${escapeHtml(companyLabel)}</div></div>
      <div><div class="lbl">ارز</div><div class="val">${escapeHtml(data.currency)}</div></div>
    </div>
    <div class="amount-box">
      <div class="lbl">${isIn ? 'مبلغ دریافتی' : 'مبلغ پرداختی'}</div>
      <div class="val num">${fmtMoney(amount)} ${escapeHtml(data.currency)}</div>
    </div>
    ${data.details ? `<p style="font-size:13px;color:#334155;margin:0 0 16px"><strong>تفصیلات:</strong> ${escapeHtml(data.details)}</p>` : ''}
    ${data.rate ? `<p style="font-size:12px;color:#64748b;margin:0 0 8px">نرخ: ${data.rate} · کمیشن: ${fmtMoney(data.commission || 0)}</p>` : ''}
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="kpi"><div class="label">مانده پس از معامله</div><div class="value num">${fmtMoney(data.balance)} ${escapeHtml(data.currency)}</div></div>
      <div class="kpi"><div class="label">نوع سند</div><div class="value">${escapeHtml(data.kind)}</div></div>
    </div>
    ${data.notes ? `<p style="font-size:11px;color:#94a3b8;margin-top:12px">یادداشت: ${escapeHtml(data.notes)}</p>` : ''}
    <div class="signatures">
      <div><div class="line">امضاء صادرکننده</div></div>
      <div><div class="line">امضاء دریافت‌کننده</div></div>
      <div><div class="line">تأیید مدیریت</div></div>
    </div>
  </div>
  <div class="footer">
    <span>سند حواله ${escapeHtml(data.remittanceNo)}</span>
    <span>${escapeHtml(companyLabel)} · ERP System</span>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    };
  </script>
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
