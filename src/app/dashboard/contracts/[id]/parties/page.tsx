'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { contracts, parties } from '@/lib/demo-data';
import { formatNumber } from '@/lib/utils';
import { ExportButtons } from '@/components/shared/export-buttons';

export default function ContractPartiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contractId = Number(id);
  const contract = contracts.find((c) => c.id === contractId);
  const rows = parties.filter((p) => p.contractId === contractId);

  const totals = rows.reduce(
    (acc, p) => ({
      wagons: acc.wagons + p.wagons,
      qty: acc.qty + p.qty,
      arrived: acc.arrived + p.arrived,
      unloaded: acc.unloaded + p.unloaded,
      sold: acc.sold + p.sold,
      shortage: acc.shortage + p.shortage,
      waste: acc.waste + p.waste,
      sellable: acc.sellable + p.sellable,
      transit: acc.transit + p.transit,
    }),
    {
      wagons: 0,
      qty: 0,
      arrived: 0,
      unloaded: 0,
      sold: 0,
      shortage: 0,
      waste: 0,
      sellable: 0,
      transit: 0,
    }
  );

  const locations = [...new Set(rows.map((r) => r.location))];

  if (!contract) {
    return (
      <div className="space-y-4">
        <p>قرارداد یافت نشد.</p>
        <Link href="/dashboard/contracts">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`پارتی‌های قرارداد ${contract.number}`}
        description="تفکیک محل‌ها (آقینه / هرات / ...) و جمع کل"
        actions={
          <>
            <ExportButtons
              filename={`contract-${contract.number}-parties`}
              title={`پارتی‌های ${contract.number}`}
              columns={[
                { key: 'number', label: 'شماره پارتی' },
                { key: 'location', label: 'محل' },
                { key: 'wagons', label: 'واگن' },
                { key: 'qty', label: 'مقدار' },
                { key: 'arrived', label: 'آمد' },
                { key: 'unloaded', label: 'تخلیه' },
                { key: 'sold', label: 'فروش' },
                { key: 'sellable', label: 'قابل فروش' },
                { key: 'transit', label: 'ترانزیت' },
                { key: 'status', label: 'وضعیت' },
              ]}
              rows={rows}
            />
            <Link href={`/dashboard/contracts/${contract.id}`}>
            <Button variant="outline" size="sm">
              <ArrowRight className="ml-2 h-4 w-4" />
              بازگشت به قرارداد
            </Button>
          </Link>
          </>
        }
      />

      {locations.map((location) => {
        const list = rows.filter((r) => r.location === location);
        return (
          <Card key={location}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                محل: {location}
                <Badge variant="muted">{list.length} پارتی</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 lg:pb-0">
              <ResponsiveData
                table={
                  <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره پارتی</TableHead>
                    <TableHead>واگن/موتر</TableHead>
                    <TableHead>تعداد</TableHead>
                    <TableHead>تن/لیتر</TableHead>
                    <TableHead>آمد</TableHead>
                    <TableHead>تخلیه</TableHead>
                    <TableHead>فروش</TableHead>
                    <TableHead>کسری</TableHead>
                    <TableHead>ضایعات</TableHead>
                    <TableHead>قابل فروش</TableHead>
                    <TableHead>ترانزیت</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold num">{p.number}</TableCell>
                      <TableCell className="num">{p.wagons}</TableCell>
                      <TableCell className="num">{p.wagons}</TableCell>
                      <TableCell className="num">{formatNumber(p.qty, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.arrived, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.unloaded, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.sold, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.shortage, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.waste, 0)}</TableCell>
                      <TableCell className="num text-emerald-700">
                        {formatNumber(p.sellable, 0)}
                      </TableCell>
                      <TableCell className="num">{formatNumber(p.transit, 0)}</TableCell>
                      <TableCell>
                        <Badge variant="info">{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                  </div>
                }
                cards={list.map((p) => (
                  <MobileRecordCard
                    key={p.id}
                    title={p.number}
                    subtitle={`${p.wagons} واگن/موتر`}
                    badge={<Badge variant="info">{p.status}</Badge>}
                    metrics={[
                      { label: 'مقدار', value: formatNumber(p.qty, 0) },
                      { label: 'قابل فروش', value: formatNumber(p.sellable, 0) },
                      { label: 'آمد', value: formatNumber(p.arrived, 0) },
                      { label: 'تخلیه', value: formatNumber(p.unloaded, 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="فروش" value={formatNumber(p.sold, 0)} />
                        <ExtraRow label="کسری" value={formatNumber(p.shortage, 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(p.waste, 0)} />
                        <ExtraRow label="ترانزیت" value={formatNumber(p.transit, 0)} />
                      </>
                    }
                  />
                ))}
              />
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-[var(--brand)]/30 bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">جمع کل قرارداد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ['واگن', totals.wagons],
              ['مقدار', totals.qty],
              ['آمد', totals.arrived],
              ['تخلیه', totals.unloaded],
              ['فروش', totals.sold],
              ['کسری', totals.shortage],
              ['ضایعات', totals.waste],
              ['قابل فروش', totals.sellable],
              ['ترانزیت', totals.transit],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg bg-white border px-3 py-2">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-bold num">{formatNumber(Number(value), 0)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
