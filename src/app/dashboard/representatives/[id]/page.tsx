'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Handshake,
  MapPin,
  Phone,
  Plus,
  Wallet,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ExportButtons } from '@/components/shared/export-buttons';
import { BrandDocumentHeader, CompanyLogo } from '@/components/brand/company-logo';
import { useCompanyStore } from '@/lib/company-store';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { useOpsStore } from '@/lib/ops-store';
import { goodsValue, products } from '@/lib/demo-data';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function RepresentativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const repId = Number(id);
  const { t, tx } = useI18n();
  const { company } = useCompanyStore();
  const rep = useOpsStore((s) => s.representatives.find((r) => r.id === repId));
  const setRepresentatives = useOpsStore((s) => s.setRepresentatives);
  const allReps = useOpsStore((s) => s.representatives);
  const [cashOpen, setCashOpen] = useState(false);
  const [cashDraft, setCashDraft] = useState({ amount: '', note: '' });

  const goodsRows = useMemo(() => {
    if (!rep) return [];
    return products
      .map((p) => ({
        code: p.code,
        name: p.name,
        unit: p.unit,
        qty: rep.goods[p.code] ?? 0,
      }))
      .filter((g) => g.qty !== 0);
  }, [rep]);

  if (!rep) {
    return (
      <div className="space-y-4">
        <p>{tx('نماینده یافت نشد.', 'Representative not found.')}</p>
        <Link href="/dashboard/representatives">
          <Button variant="outline">{t('back')}</Button>
        </Link>
      </div>
    );
  }

  const gVal = goodsValue(rep.goods);
  const isDebtor = rep.cashBalance < 0;

  const applyCashAdjust = (delta: number) => {
    setRepresentatives(
      allReps.map((r) =>
        r.id === rep.id
          ? {
              ...r,
              cashBalance: r.cashBalance + delta,
              lastTxn: new Date().toISOString().slice(0, 10),
            }
          : r
      )
    );
    setCashOpen(false);
    setCashDraft({ amount: '', note: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BrandDocumentHeader
        company={company}
        title={rep.name}
        subtitle={`${tx('نماینده', 'Representative')} · ${rep.code} · ${rep.region || '—'}`}
        actions={
          <>
            <ExportButtons
              filename={`representative-${rep.code}`}
              title={rep.name}
              company={company}
              columns={[
                { key: 'field', label: tx('فیلد', 'Field') },
                { key: 'value', label: tx('مقدار', 'Value') },
              ]}
              rows={[
                { field: t('name'), value: rep.name },
                { field: t('code'), value: rep.code },
                { field: t('colRegion'), value: rep.region },
                { field: t('phone'), value: rep.phone },
                { field: t('colCashBalance'), value: rep.cashBalance },
                { field: t('colGoodsBalance'), value: gVal },
              ]}
            />
            <Button size="sm" className="bg-emerald-500 text-white" onClick={() => setCashOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {tx('ثبت رسید/پرداخت', 'Record receipt/payment')}
            </Button>
            <Link href="/dashboard/representatives">
              <Button size="sm" variant="outline" className="border-white/30 bg-white/10 text-white">
                <ArrowRight className="ms-2 h-4 w-4" />
                {t('back')}
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t('colCashBalance'),
            value: formatCurrency(rep.cashBalance),
            icon: Wallet,
            tone: 'text-sky-600 bg-sky-50',
            valueClass: balanceClass(rep.cashBalance),
          },
          {
            label: t('colGoodsBalance'),
            value: formatCurrency(gVal),
            icon: Boxes,
            tone: 'text-teal-600 bg-teal-50',
          },
          {
            label: tx('بدهی نقدی', 'Cash debt'),
            value: isDebtor ? formatCurrency(Math.abs(rep.cashBalance)) : '—',
            icon: Handshake,
            tone: 'text-rose-600 bg-rose-50',
          },
          {
            label: t('colLastTxn'),
            value: rep.lastTxn,
            icon: MapPin,
            tone: 'text-violet-600 bg-violet-50',
          },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{k.label}</p>
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', k.tone)}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className={cn('mt-3 text-xl font-extrabold num', k.valueClass)}>{k.value}</p>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="goods">
        <TabsList className="w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100 p-1 sm:w-auto">
          <TabsTrigger value="goods" className="rounded-xl">
            {tx('حساب جنسی', 'Goods account')}
          </TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl">
            {t('tabInfo')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goods">
          <Card className="rounded-[22px] border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{tx('موجودی جنسی', 'Goods inventory')}</CardTitle>
              <CompanyLogo company={company} size="sm" />
            </CardHeader>
            <CardContent className="px-0 pb-4">
              <ResponsiveData
                table={
                  <div className="table-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('colProduct')}</TableHead>
                          <TableHead>{t('colQty')}</TableHead>
                          <TableHead>{t('colUnit')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goodsRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-slate-500">
                              {tx('موجودی جنسی ثبت نشده', 'No goods balance')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          goodsRows.map((g) => (
                            <TableRow key={g.code}>
                              <TableCell className="font-medium">{g.name}</TableCell>
                              <TableCell className="num">{formatNumber(g.qty, 0)}</TableCell>
                              <TableCell>{g.unit}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={goodsRows.map((g) => (
                  <MobileRecordCard
                    key={g.code}
                    title={g.name}
                    metrics={[{ label: t('colQty'), value: `${formatNumber(g.qty, 0)} ${g.unit}` }]}
                  />
                ))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [t('name'), rep.name],
              [t('code'), rep.code],
              [t('colRegion'), rep.region || '—'],
              [t('phone'), rep.phone || '—'],
              [t('colLastTxn'), rep.lastTxn],
              [
                tx('وضعیت حساب', 'Account status'),
                isDebtor ? tx('بدهکار', 'Debtor') : tx('فعال', 'Active'),
              ],
              [tx('ملاحظات', 'Notes'), rep.notes || '—'],
            ].map(([label, value]) => (
              <Card key={String(label)} className="rounded-[20px] border-slate-100">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={cashOpen}
        onClose={() => setCashOpen(false)}
        title={tx('ثبت رسید یا پرداخت', 'Record receipt or payment')}
        footer={
          <>
            <Button variant="outline" onClick={() => setCashOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                const amt = Number(cashDraft.amount);
                if (amt > 0) applyCashAdjust(amt);
              }}
            >
              {tx('رسید (دریافت)', 'Receipt (in)')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const amt = Number(cashDraft.amount);
                if (amt > 0) applyCashAdjust(-amt);
              }}
            >
              {tx('پرداخت (خروج)', 'Payment (out)')}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <div>
            <Label>{tx('مبلغ', 'Amount')}</Label>
            <Input
              type="number"
              value={cashDraft.amount}
              onChange={(e) => setCashDraft((d) => ({ ...d, amount: e.target.value }))}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div>
            <Label>{tx('ملاحظات', 'Notes')}</Label>
            <Input
              value={cashDraft.note}
              onChange={(e) => setCashDraft((d) => ({ ...d, note: e.target.value }))}
            />
          </div>
          <p className="text-xs text-slate-500">
            {tx(
              'رسید = افزایش بیلانس نقدی نماینده · پرداخت = کاهش بیلانس',
              'Receipt increases cash balance · Payment decreases it'
            )}
          </p>
        </div>
      </Dialog>
    </div>
  );
}
