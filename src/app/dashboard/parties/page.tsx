'use client';

import { useState } from 'react';
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
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { Plus } from 'lucide-react';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { PartyRecord } from '@/lib/demo-data';
import { formatNumber } from '@/lib/utils';

const EMPTY: OpsRow[] = [];

export default function PartiesPage() {
  const rows = useOpsStore((s) => (s.lists.parties ?? EMPTY) as unknown as PartyRecord[]);
  const addToList = useOpsStore((s) => s.addToList);
  const setList = useOpsStore((s) => s.setList);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="پارتی‌های قرارداد"
        description="شماره قرارداد، تفکیک پارتی‌ها، محل، واگن/موتر، مقدار تن/لیتر، آمد، تخلیه، فروش، کسری، ضایعات، قابل فروش، ترانزیت"
        actions={
          <>
            <ExportButtons
              filename="parties"
              title="پارتی‌های قرارداد"
              columns={[
                { key: 'number', label: 'شماره پارتی' },
                { key: 'contractNumber', label: 'قرارداد' },
                { key: 'location', label: 'محل' },
                { key: 'wagons', label: 'واگن/موتر' },
                { key: 'qty', label: 'مقدار' },
                { key: 'arrived', label: 'آمد' },
                { key: 'unloaded', label: 'تخلیه' },
                { key: 'sold', label: 'فروش' },
                { key: 'shortage', label: 'کسری' },
                { key: 'waste', label: 'ضایعات' },
                { key: 'sellable', label: 'قابل فروش' },
                { key: 'transit', label: 'ترانزیت' },
                { key: 'status', label: 'وضعیت' },
              ]}
              rows={rows}
            />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              پارتی جدید
            </Button>
            <Link href="/dashboard/contracts">
            <Button variant="outline">مشاهده قراردادها</Button>
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">لیست پارتی‌ها</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره پارتی</TableHead>
                <TableHead>شماره قرارداد</TableHead>
                <TableHead>محل</TableHead>
                <TableHead>تعداد واگن/موتر</TableHead>
                <TableHead>مقدار تن/لیتر</TableHead>
                <TableHead>آمد</TableHead>
                <TableHead>تخلیه</TableHead>
                <TableHead>فروش</TableHead>
                <TableHead>کسری</TableHead>
                <TableHead>ضایعات</TableHead>
                <TableHead>قابل فروش</TableHead>
                <TableHead>ترانزیت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={14} message="هنوز پارتی ثبت نشده است" />
              ) : null}
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold num">{p.number}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/contracts/${p.contractId}/parties`}
                      className="text-[var(--brand)] hover:underline num"
                    >
                      {p.contractNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{p.location}</TableCell>
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
                    <Badge variant="muted">{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <RecordActions
                      title="پارتی"
                      detailHref={`/dashboard/contracts/${p.contractId}/parties`}
                      row={{
                        number: p.number,
                        contractNumber: p.contractNumber,
                        location: p.location,
                        qty: p.qty,
                        status: p.status,
                        sellable: p.sellable,
                      }}
                      fields={[
                        { key: 'number', label: 'شماره پارتی' },
                        { key: 'contractNumber', label: 'قرارداد' },
                        { key: 'location', label: 'محل' },
                        { key: 'qty', label: 'مقدار' },
                        { key: 'sellable', label: 'قابل فروش' },
                        { key: 'status', label: 'وضعیت' },
                      ]}
                      onSave={(next) => {
                        setList(
                          'parties',
                          rows.map((r) => {
                            if (r.id !== p.id) return r;
                            return {
                              ...r,
                              number: String(next.number ?? r.number),
                              location: String(next.location ?? r.location),
                              qty: Number(next.qty ?? r.qty),
                              sellable: Number(next.sellable ?? r.sellable),
                            };
                          })
                        );
                      }}
                      onDelete={() => setList('parties', rows.filter((r) => r.id !== p.id))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">هنوز پارتی ثبت نشده است</p>
              ) : (
                rows.map((p) => (
                  <MobileRecordCard
                    key={p.id}
                    title={p.number}
                    subtitle={`قرارداد ${p.contractNumber} · ${p.location}`}
                    badge={<Badge variant="muted">{p.status}</Badge>}
                    metrics={[
                      { label: 'مقدار', value: formatNumber(p.qty, 0) },
                      { label: 'قابل فروش', value: formatNumber(p.sellable, 0) },
                      { label: 'واگن/موتر', value: p.wagons },
                      { label: 'ترانزیت', value: formatNumber(p.transit, 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="آمد" value={formatNumber(p.arrived, 0)} />
                        <ExtraRow label="تخلیه" value={formatNumber(p.unloaded, 0)} />
                        <ExtraRow label="فروش" value={formatNumber(p.sold, 0)} />
                        <ExtraRow label="کسری" value={formatNumber(p.shortage, 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(p.waste, 0)} />
                      </>
                    }
                    footer={
                      <RecordActions
                        layout="buttons"
                        title="پارتی"
                        detailHref={`/dashboard/contracts/${p.contractId}/parties`}
                        row={{
                          number: p.number,
                          contractNumber: p.contractNumber,
                          location: p.location,
                          qty: p.qty,
                          status: p.status,
                          sellable: p.sellable,
                        }}
                        fields={[
                          { key: 'number', label: 'شماره پارتی' },
                          { key: 'contractNumber', label: 'قرارداد' },
                          { key: 'location', label: 'محل' },
                          { key: 'qty', label: 'مقدار' },
                          { key: 'sellable', label: 'قابل فروش' },
                          { key: 'status', label: 'وضعیت' },
                        ]}
                        onSave={(next) => {
                          setList(
                            'parties',
                            rows.map((r) => {
                              if (r.id !== p.id) return r;
                              return {
                                ...r,
                                number: String(next.number ?? r.number),
                                location: String(next.location ?? r.location),
                                qty: Number(next.qty ?? r.qty),
                                sellable: Number(next.sellable ?? r.sellable),
                              };
                            })
                          );
                        }}
                        onDelete={() => setList('parties', rows.filter((r) => r.id !== p.id))}
                      />
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="پارتی جدید"
        fields={[
          { key: 'number', label: 'شماره پارتی', required: true, dir: 'ltr' },
          { key: 'contractNumber', label: 'شماره قرارداد', required: true },
          { key: 'location', label: 'محل' },
          { key: 'qty', label: 'مقدار', type: 'number', required: true },
        ]}
        submitLabel="ثبت"
        onSubmit={(v) => {
          const qty = Number(v.qty || 0);
          addToList('parties', {
            number: v.number.trim(),
            contractId: 0,
            contractNumber: v.contractNumber.trim(),
            location: v.location,
            wagons: 0,
            qty,
            arrived: 0,
            unloaded: 0,
            sold: 0,
            shortage: 0,
            waste: 0,
            sellable: qty,
            transit: 0,
            status: 'ثبت‌شده',
          });
        }}
      />
    </div>
  );
}
