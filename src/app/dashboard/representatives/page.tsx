'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Handshake, Plus, Search, Wallet, Boxes } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { emptyGoods, goodsValue, type RepresentativeRecord } from '@/lib/demo-data';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';

export default function RepresentativesPage() {
  const { t, tx } = useI18n();
  const searchParams = useSearchParams();
  const rows = useOpsStore((s) => s.representatives);
  const setRepresentatives = useOpsStore((s) => s.setRepresentatives);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', code: '', region: '', phone: '' });

  useEffect(() => {
    if (searchParams.get('new') === '1') setCreateOpen(true);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.phone.includes(q)
    );
  }, [rows, query]);

  const totalCash = filtered.reduce((s, r) => s + r.cashBalance, 0);
  const totalGoods = filtered.reduce((s, r) => s + goodsValue(r.goods), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageRepresentatives')}
        description={tx(
          'نمایندگان فروش و توزیع — حساب نقدی و جنسی هر نماینده جدا از مشتری و تأمین‌کننده است.',
          'Sales and distribution agents — each has a cash and goods account, separate from customers and suppliers.'
        )}
        actions={
          <>
            <ExportButtons
              filename="representatives"
              title={t('pageRepresentatives')}
              columns={[
                { key: 'name', label: t('name') },
                { key: 'code', label: t('code') },
                { key: 'region', label: t('colRegion') },
                { key: 'phone', label: t('colContact') },
                { key: 'cashBalance', label: t('colCashBalance') },
                { key: 'goodsValue', label: t('colGoodsBalance') },
                { key: 'lastTxn', label: t('colLastTxn') },
              ]}
              rows={filtered.map((r) => ({
                name: r.name,
                code: r.code,
                region: r.region,
                phone: r.phone,
                cashBalance: r.cashBalance,
                goodsValue: goodsValue(r.goods),
                lastTxn: r.lastTxn,
              }))}
            />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {t('newRepresentative')}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: t('countRepresentatives'), value: String(filtered.length), icon: Handshake, tone: 'bg-fuchsia-50 text-fuchsia-600' },
          { label: t('totalCashBalance'), value: formatCurrency(totalCash), icon: Wallet, tone: 'bg-sky-50 text-sky-600', valueClass: balanceClass(totalCash) },
          { label: t('goodsAccountValue'), value: formatCurrency(totalGoods), icon: Boxes, tone: 'bg-teal-50 text-teal-600' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="rounded-[22px] border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <CardContent className="flex items-center gap-3 p-4">
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', k.tone)}>
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className={cn('mt-0.5 truncate text-lg font-bold num text-slate-900', k.valueClass)}>
                    {k.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-[22px] border-slate-100">
        <CardHeader className="flex-col gap-3 space-y-0 border-b border-slate-100 bg-slate-50/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">{t('pageRepresentatives')}</CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">
              {tx('نام، منطقه، تماس و بیلانس هر نماینده', 'Name, region, contact and balances')}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="pe-9"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('code')}</TableHead>
                      <TableHead>{t('colRegion')}</TableHead>
                      <TableHead>{t('colContact')}</TableHead>
                      <TableHead>{t('colCashBalance')}</TableHead>
                      <TableHead>{t('colGoodsBalance')}</TableHead>
                      <TableHead>{t('colLastTxn')}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableEmpty colSpan={8} message={tx('هنوز نماینده‌ای ثبت نشده', 'No representatives yet')} />
                    ) : null}
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-semibold">{r.name}</TableCell>
                        <TableCell className="num">{r.code}</TableCell>
                        <TableCell>{r.region || '-'}</TableCell>
                        <TableCell className="num">{r.phone || '-'}</TableCell>
                        <TableCell className={`num font-semibold ${balanceClass(r.cashBalance)}`}>
                          {formatCurrency(r.cashBalance)}
                        </TableCell>
                        <TableCell className="num">{formatCurrency(goodsValue(r.goods))}</TableCell>
                        <TableCell className="num">{r.lastTxn}</TableCell>
                        <TableCell>
                          <RecordActions
                            title={r.name}
                            row={{
                              name: r.name,
                              code: r.code,
                              region: r.region,
                              phone: r.phone,
                              cashBalance: r.cashBalance,
                            }}
                            fields={[
                              { key: 'name', label: t('name') },
                              { key: 'code', label: t('code') },
                              { key: 'region', label: t('colRegion') },
                              { key: 'phone', label: t('phone') },
                              { key: 'cashBalance', label: t('colCashBalance') },
                            ]}
                            onSave={(next) => {
                              setRepresentatives(
                                rows.map((row) =>
                                  row.id === r.id
                                    ? {
                                        ...row,
                                        name: String(next.name ?? row.name),
                                        code: String(next.code ?? row.code),
                                        region: String(next.region ?? row.region),
                                        phone: String(next.phone ?? row.phone),
                                        cashBalance: Number(next.cashBalance ?? row.cashBalance),
                                      }
                                    : row
                                )
                              );
                            }}
                            onDelete={() => setRepresentatives(rows.filter((row) => row.id !== r.id))}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {tx('هنوز نماینده‌ای ثبت نشده', 'No representatives yet')}
                </p>
              ) : (
                filtered.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={r.name}
                    subtitle={r.code}
                    metrics={[
                      { label: t('colCashBalance'), value: formatCurrency(r.cashBalance) },
                      { label: t('colGoodsBalance'), value: formatCurrency(goodsValue(r.goods)) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={t('colRegion')} value={r.region || '-'} />
                        <ExtraRow label={t('phone')} value={r.phone || '-'} />
                      </>
                    }
                    footer={
                      <RecordActions
                        title={r.name}
                        row={{
                          name: r.name,
                          code: r.code,
                          region: r.region,
                          phone: r.phone,
                          cashBalance: r.cashBalance,
                        }}
                        fields={[
                          { key: 'name', label: t('name') },
                          { key: 'code', label: t('code') },
                          { key: 'region', label: t('colRegion') },
                          { key: 'phone', label: t('phone') },
                          { key: 'cashBalance', label: t('colCashBalance') },
                        ]}
                        onSave={(next) => {
                          setRepresentatives(
                            rows.map((row) =>
                              row.id === r.id
                                ? {
                                    ...row,
                                    name: String(next.name ?? row.name),
                                    code: String(next.code ?? row.code),
                                    region: String(next.region ?? row.region),
                                    phone: String(next.phone ?? row.phone),
                                    cashBalance: Number(next.cashBalance ?? row.cashBalance),
                                  }
                                : row
                            )
                          );
                        }}
                        onDelete={() => setRepresentatives(rows.filter((row) => row.id !== r.id))}
                      />
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('newRepresentative')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                if (!draft.name.trim()) return;
                const id = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
                const row: RepresentativeRecord = {
                  id,
                  code: draft.code || `REP-${String(id).padStart(3, '0')}`,
                  name: draft.name.trim(),
                  phone: draft.phone,
                  region: draft.region,
                  cashBalance: 0,
                  lastTxn: '-',
                  goods: emptyGoods(),
                  notes: '',
                };
                setRepresentatives([row, ...rows]);
                setCreateOpen(false);
                setDraft({ name: '', code: '', region: '', phone: '' });
              }}
            >
              {t('save')}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <div>
            <Label>{t('name')} *</Label>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <Label>{t('code')}</Label>
            <Input
              value={draft.code}
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div>
            <Label>{t('colRegion')}</Label>
            <Input value={draft.region} onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))} />
          </div>
          <div>
            <Label>{t('phone')}</Label>
            <Input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
