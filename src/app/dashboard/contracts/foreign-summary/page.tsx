'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import { formatNumber } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];

type ForeignRow = {
  id: number;
  supplier: string;
  contractNumber: string;
  product: string;
  contractQty: number;
  unit: string;
  location: string;
  arrivedWagons: number;
  unloaded: number;
  sold: number;
  shortage: number;
  waste: number;
  sellable: number;
  transit: number;
  inventory: number;
  remaining: number;
  company: string;
  arrivalsCount: number;
};

export default function ForeignContractSummaryPage() {
  const { t, tx } = useI18n();
  const { company } = useCompanyStore();
  const contracts = useOpsStore((s) => s.contracts);
  const parties = useOpsStore((s) => s.lists.parties ?? EMPTY);
  const arrivals = useOpsStore(
    (s) => (s.lists.foreignArrivals ?? EMPTY) as OpsRow[]
  );

  const rows = useMemo((): ForeignRow[] => {
    const live = contracts
      .filter((c) => matchesCompany(c.company, company))
      .map((c) => {
        const partyRows = parties.filter(
          (p) => Number(p.contractId) === c.id || String(p.contractNumber) === c.number
        );
        const arrivalRows = arrivals.filter(
          (a) =>
            matchesCompany(String(a.company), company) &&
            (String(a.contractNumber) === c.number ||
              Number(a.contractId) === c.id ||
              String(a.supplier) === c.supplierName)
        );
        const arrivedFromArrivals = arrivalRows.reduce(
          (s, a) => s + (Number(a.seymirWeight) || Number(a.qty) || 0),
          0
        );
        const arrived = Math.max(c.arrived || 0, arrivedFromArrivals);
        const unloaded = c.unloaded || 0;
        const sold = c.sold || 0;
        const shortage = c.shortage || 0;
        const waste = c.waste || 0;
        const sellable =
          c.sellable ?? Math.max(0, (unloaded || arrived) - sold - shortage - waste);
        const transit = c.transit || 0;
        const inventory = Math.max(0, sellable - transit);
        const remaining = Math.max(0, (c.totalQty || 0) - arrived);
        return {
          id: c.id,
          supplier: c.supplierName || '—',
          contractNumber: c.number,
          product: c.product || c.productCode || '—',
          contractQty: c.totalQty || 0,
          unit: c.unit || 'تن',
          location: c.location || '—',
          arrivedWagons: c.wagons || arrivalRows.length,
          unloaded,
          sold,
          shortage,
          waste,
          sellable,
          transit,
          inventory,
          remaining,
          company: c.company,
          arrivalsCount: arrivalRows.length + partyRows.length,
        };
      });
    return live;
  }, [contracts, parties, arrivals, company]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageForeignContracts')}
        description={tx(
          'راپور خارجی زنده از قراردادها + وارده‌ها — آمد، تخلیه، فروش، موجودی و باقی',
          'Live foreign report from contracts + arrivals — arrived, unload, sold, stock, remaining'
        )}
        actions={
          <>
            <ExportButtons
              filename="foreign-contract-summary"
              title={tx('خلاصه قرارداد خارجی', 'Foreign contract summary')}
              company={company}
              columns={[
                { key: 'supplier', label: tx('شرکت طرف', 'Counterparty') },
                { key: 'contractNumber', label: tx('شماره قرارداد', 'Contract no.') },
                { key: 'product', label: tx('نوع جنس', 'Product') },
                { key: 'contractQty', label: tx('مقدار قرارداد', 'Contract qty') },
                { key: 'unit', label: tx('واحد', 'Unit') },
                { key: 'location', label: tx('محل', 'Location') },
                { key: 'arrivedWagons', label: tx('آمد واگن', 'Arrived wagons') },
                { key: 'unloaded', label: tx('تخلیه', 'Unloaded') },
                { key: 'sold', label: tx('فروش', 'Sold') },
                { key: 'shortage', label: tx('کسرات', 'Shortage') },
                { key: 'waste', label: tx('ضایعات', 'Waste') },
                { key: 'sellable', label: tx('قابل فروش', 'Sellable') },
                { key: 'transit', label: tx('ترانزیت', 'Transit') },
                { key: 'inventory', label: tx('موجودی', 'Inventory') },
                { key: 'remaining', label: tx('باقی قرارداد', 'Remaining') },
                { key: 'arrivalsCount', label: tx('تعداد وارده/پارتی', 'Arrivals/parties') },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Link href="/dashboard/foreign-arrivals">
              <Button variant="outline">{tx('وارده خارجی', 'Foreign arrivals')}</Button>
            </Link>
            <Link href="/dashboard/contracts">
              <Button>{tx('قراردادها', 'Contracts')}</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('تعداد قرارداد', 'Contracts')}</p>
            <p className="mt-1 text-2xl font-extrabold num">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('جمع مقدار قرارداد', 'Total contract qty')}</p>
            <p className="mt-1 text-2xl font-extrabold num">
              {formatNumber(rows.reduce((s, r) => s + r.contractQty, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('جمع باقی', 'Total remaining')}</p>
            <p className="mt-1 text-2xl font-extrabold num text-amber-700">
              {formatNumber(rows.reduce((s, r) => s + r.remaining, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[22px] shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {tx('خلاصه قراردادهای خارجی', 'Foreign contracts summary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tx('شرکت طرف', 'Counterparty')}</TableHead>
                      <TableHead>{tx('شماره', 'No.')}</TableHead>
                      <TableHead>{tx('جنس', 'Product')}</TableHead>
                      <TableHead>{tx('قرارداد', 'Contract')}</TableHead>
                      <TableHead>{tx('آمد', 'Arrived')}</TableHead>
                      <TableHead>{tx('تخلیه', 'Unload')}</TableHead>
                      <TableHead>{tx('فروش', 'Sold')}</TableHead>
                      <TableHead>{tx('موجودی', 'Stock')}</TableHead>
                      <TableHead>{tx('باقی', 'Remain')}</TableHead>
                      <TableHead>{tx('وارده', 'Arrivals')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty
                        colSpan={10}
                        message={tx(
                          'هنوز قرارداد خارجی ثبت نشده — از قراردادها یا وارده خارجی شروع کنید',
                          'No foreign contracts yet — start from contracts or foreign arrivals'
                        )}
                      />
                    ) : (
                      rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-semibold">{r.supplier}</TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/contracts/${r.id}`}
                              className="text-teal-700 hover:underline num"
                            >
                              {r.contractNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{r.product}</TableCell>
                          <TableCell className="num">
                            {formatNumber(r.contractQty)} {r.unit}
                          </TableCell>
                          <TableCell className="num">{formatNumber(r.arrivedWagons)}</TableCell>
                          <TableCell className="num">{formatNumber(r.unloaded)}</TableCell>
                          <TableCell className="num">{formatNumber(r.sold)}</TableCell>
                          <TableCell className="num font-bold">{formatNumber(r.inventory)}</TableCell>
                          <TableCell className="num text-amber-700">
                            {formatNumber(r.remaining)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="info">{r.arrivalsCount}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              <div className="space-y-3 px-3 py-3">
                {rows.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    {tx('هنوز داده خارجی نیست', 'No foreign data yet')}
                  </p>
                ) : (
                  rows.map((r) => (
                    <MobileRecordCard
                      key={r.id}
                      title={r.supplier}
                      subtitle={`${r.contractNumber} · ${r.product}`}
                      badge={<Badge variant="info">{r.unit}</Badge>}
                      metrics={[
                        {
                          label: tx('قرارداد', 'Contract'),
                          value: formatNumber(r.contractQty),
                        },
                        {
                          label: tx('موجودی', 'Stock'),
                          value: formatNumber(r.inventory),
                        },
                        {
                          label: tx('باقی', 'Remain'),
                          value: formatNumber(r.remaining),
                        },
                      ]}
                      extra={
                        <>
                          <ExtraRow label={tx('تخلیه', 'Unload')} value={formatNumber(r.unloaded)} />
                          <ExtraRow label={tx('فروش', 'Sold')} value={formatNumber(r.sold)} />
                          <ExtraRow label={tx('محل', 'Location')} value={r.location} />
                        </>
                      }
                    />
                  ))
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
