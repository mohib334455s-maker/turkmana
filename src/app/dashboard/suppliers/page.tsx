'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, Globe2, Phone, Plus, Search, Wallet, Boxes } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { emptyGoods, type SupplierRecord } from '@/lib/demo-data';
import { useOpsStore } from '@/lib/ops-store';
import { supplierGoodsValue } from '@/lib/supplier-goods';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function SuppliersPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const rows = useOpsStore((s) => s.suppliers);
  const setSuppliers = useOpsStore((s) => s.setSuppliers);
  const purchases = useOpsStore((s) => s.companyPurchases);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', code: '', country: '', phone: '' });

  useEffect(() => {
    if (searchParams.get('new') === '1') setCreateOpen(true);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totalCash = filtered.reduce((s, r) => s + r.cashBalance, 0);
  const totalGoods = filtered.reduce((s, r) => s + supplierGoodsValue(r.id, purchases), 0);
  const payable = filtered.filter((r) => r.cashBalance < 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('suppliersTitle')}
        description={t('suppliersDesc')}
        actions={
          <>
            <ExportButtons
              filename="suppliers"
              title={t('suppliersTitle')}
              columns={[
                { key: 'name', label: t('name') },
                { key: 'code', label: t('code') },
                { key: 'country', label: t('colCountry') },
                { key: 'phone', label: t('colContact') },
                { key: 'cashBalance', label: t('colCashBalance') },
                { key: 'goodsValue', label: t('colGoodsBalance') },
                { key: 'lastTxn', label: t('colLastTxn') },
              ]}
              rows={filtered.map((s) => ({
                name: s.name,
                code: s.code,
                country: s.country,
                phone: s.phone,
                cashBalance: s.cashBalance,
                goodsValue: supplierGoodsValue(s.id, purchases),
                lastTxn: s.lastTxn,
              }))}
            />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {t('newSupplier')}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('countSuppliers'), value: String(filtered.length), icon: Building2, tone: 'bg-orange-50 text-orange-600' },
          { label: t('totalCashBalance'), value: formatCurrency(totalCash), icon: Wallet, tone: 'bg-sky-50 text-sky-600', valueClass: balanceClass(totalCash) },
          { label: t('goodsAccountValue'), value: formatCurrency(totalGoods), icon: Boxes, tone: 'bg-teal-50 text-teal-600' },
          { label: t('ourPayables'), value: String(payable), icon: Globe2, tone: 'bg-rose-50 text-rose-600' },
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

      <Card className="overflow-hidden rounded-[22px] border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.045)]">
        <CardHeader className="flex-col gap-3 space-y-0 border-b border-slate-100 bg-slate-50/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">{t('suppliersListTitle')}</CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">{t('suppliersDesc')}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="h-10 rounded-xl border-slate-200 bg-white pe-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                      <TableHead>{t('colSupplier')}</TableHead>
                      <TableHead>{t('colCountry')}</TableHead>
                      <TableHead>{t('colContact')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead>{t('colCashBalance')}</TableHead>
                      <TableHead>{t('colGoodsBalance')}</TableHead>
                      <TableHead>{t('colLastTxn')}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableEmpty colSpan={8} message={t('noSuppliers')} />
                    ) : null}
                    {filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 text-sm font-bold text-white shadow-sm shadow-orange-200">
                              {s.name.slice(0, 1)}
                            </div>
                            <div>
                              <Link href={`/dashboard/suppliers/${s.id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                                {s.name}
                              </Link>
                              <p className="text-xs text-slate-500 num">{s.code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{s.country}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 num">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {s.phone || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.cashBalance < 0 ? 'danger' : 'success'}>
                            {s.cashBalance < 0 ? t('weOwe') : t('theyOwe')}
                          </Badge>
                        </TableCell>
                        <TableCell className={`num font-semibold ${balanceClass(s.cashBalance)}`}>
                          {formatCurrency(s.cashBalance)}
                        </TableCell>
                        <TableCell className="num">
                          {formatCurrency(supplierGoodsValue(s.id, purchases))}
                        </TableCell>
                        <TableCell className="num">{s.lastTxn}</TableCell>
                        <TableCell>
                          <RecordActions
                            title={t('supplierEntity')}
                            detailHref={`/dashboard/suppliers/${s.id}`}
                            row={{
                              name: s.name,
                              code: s.code,
                              country: s.country,
                              phone: s.phone,
                              lastTxn: s.lastTxn,
                              cashBalance: s.cashBalance,
                            }}
                            fields={[
                              { key: 'name', label: t('name') },
                              { key: 'code', label: t('code') },
                              { key: 'country', label: t('colCountry') },
                              { key: 'phone', label: t('phone') },
                              { key: 'lastTxn', label: t('colLastTxn') },
                              { key: 'cashBalance', label: t('colCashBalance') },
                            ]}
                            onSave={(next) => {
                              setSuppliers(
                                rows.map((r) =>
                                  r.id === s.id
                                    ? {
                                        ...r,
                                        name: String(next.name ?? r.name),
                                        code: String(next.code ?? r.code),
                                        country: String(next.country ?? r.country),
                                        phone: String(next.phone ?? r.phone),
                                        lastTxn: String(next.lastTxn ?? r.lastTxn),
                                        cashBalance: Number(next.cashBalance ?? r.cashBalance),
                                      }
                                    : r
                                )
                              );
                            }}
                            onDelete={() => setSuppliers(rows.filter((r) => r.id !== s.id))}
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
                <p className="py-10 text-center text-sm text-slate-500">{t('noSuppliers')}</p>
              ) : (
                filtered.map((s) => (
                  <MobileRecordCard
                    key={s.id}
                    title={s.name}
                    subtitle={`${s.code} · ${s.phone || s.country}`}
                    badge={
                      <Badge variant={s.cashBalance < 0 ? 'danger' : 'success'}>
                        {s.cashBalance < 0 ? t('weOwe') : t('theyOwe')}
                      </Badge>
                    }
                    metrics={[
                      {
                        label: t('colCashBalance'),
                        value: (
                          <span className={balanceClass(s.cashBalance)}>
                            {formatCurrency(s.cashBalance)}
                          </span>
                        ),
                      },
                      { label: t('colCountry'), value: s.country },
                      { label: t('colLastTxn'), value: s.lastTxn },
                      { label: t('colGoodsBalance'), value: formatCurrency(supplierGoodsValue(s.id, purchases)) },
                    ]}
                    extra={<ExtraRow label={t('colContact')} value={s.phone || '—'} />}
                    footer={
                      <RecordActions
                        layout="buttons"
                        title={t('supplierEntity')}
                        detailHref={`/dashboard/suppliers/${s.id}`}
                        row={{
                          name: s.name,
                          code: s.code,
                          country: s.country,
                          phone: s.phone,
                          lastTxn: s.lastTxn,
                          cashBalance: s.cashBalance,
                        }}
                        fields={[
                          { key: 'name', label: t('name') },
                          { key: 'code', label: t('code') },
                          { key: 'country', label: t('colCountry') },
                          { key: 'phone', label: t('phone') },
                          { key: 'lastTxn', label: t('colLastTxn') },
                          { key: 'cashBalance', label: t('colCashBalance') },
                        ]}
                        onSave={(next) => {
                          setSuppliers(
                            rows.map((r) =>
                              r.id === s.id
                                ? {
                                    ...r,
                                    name: String(next.name ?? r.name),
                                    code: String(next.code ?? r.code),
                                    country: String(next.country ?? r.country),
                                    phone: String(next.phone ?? r.phone),
                                    lastTxn: String(next.lastTxn ?? r.lastTxn),
                                    cashBalance: Number(next.cashBalance ?? r.cashBalance),
                                  }
                                : r
                            )
                          );
                        }}
                        onDelete={() => setSuppliers(rows.filter((r) => r.id !== s.id))}
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
        title={t('newSupplier')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                const id = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
                setSuppliers([
                  {
                    id,
                    code: draft.code || `SUP-${String(id).padStart(3, '0')}`,
                    name: draft.name,
                    country: draft.country || 'افغانستان',
                    phone: draft.phone,
                    cashBalance: 0,
                    lastTxn: '-',
                    goods: emptyGoods(),
                  } as SupplierRecord,
                  ...rows,
                ]);
                setCreateOpen(false);
                setDraft({ name: '', code: '', country: '', phone: '' });
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
            <Input value={draft.code} onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))} dir="ltr" className="text-left" />
          </div>
          <div>
            <Label>{t('colCountry')}</Label>
            <Input value={draft.country} onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))} />
          </div>
          <div>
            <Label>{t('phone')}</Label>
            <Input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} dir="ltr" className="text-left" />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
