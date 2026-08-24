'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { foreignContractSummaries } from '@/lib/demo-data';
import { formatNumber } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

export default function ForeignContractSummaryPage() {
  const { t } = useI18n();
  const { company } = useCompanyStore();
  const rows = foreignContractSummaries.filter((r) => matchesCompany(r.company, company));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageForeignContracts')}
        description="رول‌آپ قرارداد تأمین‌کننده خارجی — آمد، تخلیه، فروش، موجودی و باقی"
        actions={
          <>
            <ExportButtons
              filename="foreign-contract-summary"
              title="خلاصه قرارداد خارجی"
              company={company}
              columns={[
                { key: 'supplier', label: 'شرکت' },
                { key: 'contractNumber', label: 'شماره قرارداد' },
                { key: 'product', label: 'نوع جنس' },
                { key: 'contractQty', label: 'مقدار قرارداد' },
                { key: 'unit', label: 'واحد' },
                { key: 'location', label: 'محل' },
                { key: 'arrivedWagons', label: 'آمد واگن' },
                { key: 'unloaded', label: 'تخلیه' },
                { key: 'sold', label: 'فروش' },
                { key: 'shortage', label: 'کسرات' },
                { key: 'waste', label: 'ضایعات' },
                { key: 'sellable', label: 'قابل فروش' },
                { key: 'transit', label: 'ترانزیت' },
                { key: 'inventory', label: 'موجودی' },
                { key: 'remaining', label: 'باقی قرارداد' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
          </>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">خلاصه قراردادهای خارجی</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شرکت</TableHead>
                      <TableHead>شماره قرارداد</TableHead>
                      <TableHead>نوع جنس</TableHead>
                      <TableHead>مقدار قرارداد</TableHead>
                      <TableHead>واحد</TableHead>
                      <TableHead>محل</TableHead>
                      <TableHead>آمد واگن</TableHead>
                      <TableHead>تخلیه</TableHead>
                      <TableHead>فروش</TableHead>
                      <TableHead>کسرات</TableHead>
                      <TableHead>ضایعات</TableHead>
                      <TableHead>قابل فروش</TableHead>
                      <TableHead>ترانزیت</TableHead>
                      <TableHead>موجودی</TableHead>
                      <TableHead>باقی قرارداد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty colSpan={15} message="خلاصه قراردادی یافت نشد" />
                    ) : null}
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/suppliers/${r.supplierId}`}
                            className="text-[var(--brand)] hover:underline font-semibold"
                          >
                            {r.supplier}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/contracts/${r.contractId}`}
                            className="text-[var(--brand)] hover:underline num"
                          >
                            {r.contractNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{r.product}</TableCell>
                        <TableCell className="num">{formatNumber(r.contractQty, 0)}</TableCell>
                        <TableCell>{r.unit}</TableCell>
                        <TableCell>{r.location}</TableCell>
                        <TableCell className="num">{r.arrivedWagons}</TableCell>
                        <TableCell className="num">{formatNumber(r.unloaded, 0)}</TableCell>
                        <TableCell className="num">{formatNumber(r.sold, 0)}</TableCell>
                        <TableCell className="num text-amber-700">{formatNumber(r.shortage, 0)}</TableCell>
                        <TableCell className="num text-amber-700">{formatNumber(r.waste, 0)}</TableCell>
                        <TableCell className="num text-emerald-700 font-semibold">
                          {formatNumber(r.sellable, 0)}
                        </TableCell>
                        <TableCell className="num">{formatNumber(r.transit, 0)}</TableCell>
                        <TableCell className="num font-semibold">{formatNumber(r.inventory, 0)}</TableCell>
                        <TableCell className="num font-bold">{formatNumber(r.remaining, 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">خلاصه قراردادی یافت نشد</p>
              ) : (
                rows.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={r.contractNumber}
                    subtitle={`${r.supplier} · ${r.product}`}
                    badge={<Badge variant="info">{r.location}</Badge>}
                    metrics={[
                      { label: 'مقدار قرارداد', value: `${formatNumber(r.contractQty, 0)} ${r.unit}` },
                      { label: 'تخلیه', value: formatNumber(r.unloaded, 0) },
                      { label: 'قابل فروش', value: formatNumber(r.sellable, 0) },
                      { label: 'باقی قرارداد', value: formatNumber(r.remaining, 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="آمد واگن" value={r.arrivedWagons} />
                        <ExtraRow label="فروش" value={formatNumber(r.sold, 0)} />
                        <ExtraRow label="کسرات" value={formatNumber(r.shortage, 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(r.waste, 0)} />
                        <ExtraRow label="ترانزیت" value={formatNumber(r.transit, 0)} />
                        <ExtraRow label="موجودی" value={formatNumber(r.inventory, 0)} />
                      </>
                    }
                    footer={
                      <div className="flex gap-3 text-sm">
                        <Link
                          href={`/dashboard/suppliers/${r.supplierId}`}
                          className="text-[var(--brand)] hover:underline"
                        >
                          تأمین‌کننده
                        </Link>
                        <Link
                          href={`/dashboard/contracts/${r.contractId}`}
                          className="text-[var(--brand)] hover:underline"
                        >
                          قرارداد
                        </Link>
                      </div>
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
