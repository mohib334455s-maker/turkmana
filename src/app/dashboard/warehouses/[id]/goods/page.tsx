'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageMinus, PackagePlus, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { TableEmpty } from '@/components/shared/table-empty';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { useOpsStore } from '@/lib/ops-store';
import { useProductCatalog } from '@/lib/product-catalog';
import { runningGoodsBalances } from '@/lib/storage-ledger';
import { jalaliFromIso } from '@/lib/customer-resale';
import { todayIso } from '@/lib/purchase-flow';
import { useI18n } from '@/lib/i18n/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { RelatedJournal } from '@/components/journal/related-journal';
import type { StockLot } from '@/lib/stock-lots';

export default function StorageGoodsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const warehouseId = Number(id);
  const { t, tx } = useI18n();
  const catalog = useProductCatalog();
  const warehouseEntities = useOpsStore((s) => s.warehouseEntities);
  const stockLotsAll = useOpsStore((s) => s.stockLots);
  const storageGoodsMovesAll = useOpsStore((s) => s.storageGoodsMoves);
  const warehouse = useMemo(
    () => warehouseEntities.find((w) => w.id === warehouseId),
    [warehouseEntities, warehouseId]
  );
  const lots = useMemo(
    () => stockLotsAll.filter((l) => l.warehouseId === warehouseId),
    [stockLotsAll, warehouseId]
  );
  const moves = useMemo(
    () => storageGoodsMovesAll.filter((m) => m.warehouseId === warehouseId),
    [storageGoodsMovesAll, warehouseId]
  );
  const sellFromLot = useOpsStore((s) => s.sellFromLot);
  const addStorageGoodsMove = useOpsStore((s) => s.addStorageGoodsMove);
  const receiveToWarehouse = useOpsStore((s) => s.receiveToWarehouse);
  const setStockLotStatus = useOpsStore((s) => s.setStockLotStatus);
  const contracts = useOpsStore((s) => s.contracts);
  const rawParties = useOpsStore((s) => s.lists.parties ?? []);
  const activeLots = lots.filter((l) => (l.status || 'active') === 'active' && l.qty > 0);
  const partyOptions = rawParties.map((p) => ({
    value: String(p.id),
    label: String(p.number || p.partyNumber || p.id),
  }));

  const [sellOpen, setSellOpen] = useState(false);
  const [unloadOpen, setUnloadOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [sellQty, setSellQty] = useState('');

  const byProduct = useMemo(() => {
    const map = new Map<
      string,
      { productCode: string; productName: string; unit: string; qty: number; lots: StockLot[] }
    >();
    for (const lot of lots) {
      const prev = map.get(lot.productCode);
      if (!prev) {
        map.set(lot.productCode, {
          productCode: lot.productCode,
          productName: lot.productName,
          unit: lot.unit,
          qty: lot.qty,
          lots: [lot],
        });
      } else {
        prev.qty += lot.qty;
        prev.lots.push(lot);
      }
    }
    return [...map.values()];
  }, [lots]);

  const ledger = runningGoodsBalances(moves);
  const selectedLot = lots.find((l) => String(l.id) === selectedLotId);

  if (!warehouse) {
    return (
      <div className="space-y-4">
        <p>{tx('ذخیره یافت نشد.', 'Storage not found.')}</p>
        <Link href="/dashboard/warehouses">
          <Button variant="outline">{t('back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${tx('بخش جنسی', 'Goods')} — ${warehouse.name}`}
        description={tx(
          'هر پارتی لات جدا با قیمت بارگیری — تخلیه، کسرات، ضایعات؛ بارگیری از همان لات؛ پارتی تمام‌شده غیرفعال و مصرف بسته می‌شود.',
          'Each party is a separate lot at its load price — unload, shortage, waste; load from that lot; depleted parties lock expenses.'
        )}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setUnloadOpen(true)}>
              <PackagePlus className="ml-2 h-4 w-4" />
              {tx('تخلیه', 'Unload')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setLoadOpen(true)} disabled={activeLots.length === 0}>
              <PackageMinus className="ml-2 h-4 w-4" />
              {tx('بارگیری', 'Load')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedLotId(activeLots[0] ? String(activeLots[0].id) : '');
                setSellQty('');
                setSellOpen(true);
              }}
              disabled={activeLots.length === 0}
            >
              <ShoppingCart className="ml-2 h-4 w-4" />
              {tx('فروش از لات', 'Sell from lot')}
            </Button>
            <Link href={`/dashboard/warehouses/${warehouseId}`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="ml-2 h-4 w-4" />
                {tx('برگشت', 'Back')}
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('انواع کالا', 'Products')}</p>
            <p className="mt-1 text-2xl font-bold num">{byProduct.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('لات قرارداد', 'Contract lots')}</p>
            <p className="mt-1 text-2xl font-bold num">{lots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('جمع موجودی', 'Total qty')}</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(lots.reduce((s, l) => s + l.qty, 0), 3)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tx('دفتر جنسی — تخلیه و بارگیری', 'Goods ledger — unload & load')}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شماره</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>نوع</TableHead>
                      <TableHead>طرف حساب</TableHead>
                      <TableHead>تفصیلات</TableHead>
                      <TableHead>جنس</TableHead>
                      <TableHead>تخلیه</TableHead>
                      <TableHead>بارگیری</TableHead>
                      <TableHead>بیلانس جنسی</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.length === 0 ? (
                      <TableEmpty colSpan={9} message={tx('هنوز تخلیه یا بارگیری ثبت نشده', 'No unload/load yet')} />
                    ) : null}
                    {ledger.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="num">{r.id}</TableCell>
                        <TableCell className="num">{jalaliFromIso(r.date)}</TableCell>
                        <TableCell>
                          <Badge variant={r.kind === 'unload' ? 'success' : 'warning'}>
                            {r.kind === 'unload' ? tx('تخلیه', 'Unload') : tx('بارگیری', 'Load')}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.counterparty || '-'}</TableCell>
                        <TableCell className="max-w-[200px] whitespace-normal">{r.details || '-'}</TableCell>
                        <TableCell>{r.productName}</TableCell>
                        <TableCell className="num">{r.kind === 'unload' ? formatNumber(r.qty, 3) : '-'}</TableCell>
                        <TableCell className="num">{r.kind === 'load' ? formatNumber(r.qty, 3) : '-'}</TableCell>
                        <TableCell className="num font-semibold">{formatNumber(r.balance, 3)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={ledger.map((r) => (
              <MobileRecordCard
                key={r.id}
                title={r.productName}
                subtitle={`${jalaliFromIso(r.date)} · ${r.kind === 'unload' ? 'تخلیه' : 'بارگیری'}`}
                metrics={[
                  { label: tx('مقدار', 'Qty'), value: formatNumber(r.qty, 3) },
                  { label: tx('بیلانس', 'Balance'), value: formatNumber(r.balance, 3) },
                ]}
                extra={<ExtraRow label={tx('تفصیلات', 'Details')} value={r.details || '-'} />}
              />
            ))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tx('لات‌های موجودی قرارداد', 'Contract stock lots')}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          <div className="table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tx('کالا', 'Product')}</TableHead>
                  <TableHead>{tx('قرارداد', 'Contract')}</TableHead>
                  <TableHead>{tx('پارتی', 'Party')}</TableHead>
                  <TableHead>{tx('قیمت واحد', 'Unit price')}</TableHead>
                  <TableHead>{tx('وضعیت', 'Status')}</TableHead>
                  <TableHead>{t('colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.length === 0 ? (
                  <TableEmpty colSpan={7} message={tx('موجودی نیست — تخلیه ثبت کنید', 'No stock — record an unload')} />
                ) : null}
                {lots.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.productName}</TableCell>
                    <TableCell className="num">{l.contractNumber}</TableCell>
                    <TableCell>{l.partyNumber || '—'}</TableCell>
                    <TableCell className="num font-semibold">
                      {formatNumber(l.qty, 3)} {l.unit}
                    </TableCell>
                    <TableCell className="num">{formatCurrency(l.unitPrice || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={(l.status || 'active') === 'active' ? 'success' : 'muted'}>
                        {(l.status || 'active') === 'active'
                          ? tx('فعال', 'Active')
                          : l.status === 'depleted'
                            ? tx('تمام', 'Depleted')
                            : tx('غیرفعال', 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      {(l.status || 'active') === 'active' && l.qty > 0 ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLotId(String(l.id));
                              setSellQty('');
                              setSellOpen(true);
                            }}
                          >
                            {tx('فروش', 'Sell')}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setStockLotStatus(l.id, 'inactive')}
                          >
                            {tx('غیرفعال', 'Deactivate')}
                          </Button>
                        </>
                      ) : (l.status || 'active') === 'inactive' ? (
                        <Button size="sm" variant="outline" onClick={() => setStockLotStatus(l.id, 'active')}>
                          {tx('فعال', 'Activate')}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CompactFormDialog
        open={unloadOpen}
        onClose={() => setUnloadOpen(false)}
        title={tx('تخلیه به ذخیره', 'Unload into storage')}
        size="lg"
        fields={[
          {
            key: 'productCode',
            label: tx('جنس', 'Product'),
            type: 'select',
            required: true,
            options: catalog.map((p) => ({ value: p.code, label: p.label })),
          },
          { key: 'qty', label: tx('مقدار تخلیه (تن)', 'Unload qty (tons)'), type: 'number', required: true },
          { key: 'unitPrice', label: tx('قیمت بارگیری / واحد', 'Load unit price'), type: 'number' },
          { key: 'wagons', label: tx('تعداد واگن', 'Wagons'), type: 'number' },
          { key: 'shortageQty', label: tx('کسرات (تن)', 'Shortage (tons)'), type: 'number' },
          { key: 'wasteQty', label: tx('ضایعات (تن)', 'Waste (tons)'), type: 'number' },
          { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
          {
            key: 'contractId',
            label: tx('قرارداد', 'Contract'),
            type: 'select',
            options: [
              { value: '', label: '—' },
              ...contracts.map((c) => ({ value: String(c.id), label: `${c.number} — ${c.product}` })),
            ],
          },
          {
            key: 'partyId',
            label: tx('پارتی', 'Party'),
            type: 'select',
            options: [{ value: '', label: tx('بدون پارتی', 'No party') }, ...partyOptions],
          },
          { key: 'partyLabel', label: tx('شرح پارتی (اگر لیست خالی)', 'Party label (if not listed)') },
          { key: 'counterparty', label: tx('طرف حساب', 'Counterparty') },
          { key: 'details', label: tx('تفصیلات', 'Details') },
        ]}
        initial={{ date: todayIso(), qty: '', unitPrice: '', wagons: '', shortageQty: '', wasteQty: '' }}
        onSubmit={(v) => {
          const product = catalog.find((p) => p.code === v.productCode) ?? catalog[0];
          const qty = Number(v.qty || 0);
          if (!product || qty <= 0) return;
          const contract = contracts.find((c) => c.id === Number(v.contractId || 0));
          const partyId = Number(v.partyId || 0) || undefined;
          const party = rawParties.find((p) => Number(p.id) === partyId);
          const partyNumber = party
            ? String(party.number || party.partyNumber || '')
            : v.partyLabel;
          receiveToWarehouse({
            warehouseId,
            productCode: product.code,
            productName: product.name,
            unit: product.unit,
            qty,
            unitPrice: Number(v.unitPrice || contract?.pricePerUnit || 0),
            contractId: contract?.id ?? 0,
            contractNumber: contract?.number || '',
            partyId,
            partyNumber,
            supplierName: contract?.supplierName || warehouse.name,
            company: warehouse.company,
          });
          addStorageGoodsMove({
            warehouseId,
            date: v.date,
            kind: 'unload',
            counterparty: v.counterparty || contract?.supplierName || warehouse.name,
            details:
              v.details ||
              `تخلیه ${qty} ${product.unit} ${product.name}${partyNumber ? ` — پارتی ${partyNumber}` : ''}`,
            productName: product.name,
            productCode: product.code,
            qty,
            unit: product.unit,
            wagons: Number(v.wagons || 0) || undefined,
            shortageQty: Number(v.shortageQty || 0) || undefined,
            wasteQty: Number(v.wasteQty || 0) || undefined,
            unitPrice: Number(v.unitPrice || contract?.pricePerUnit || 0) || undefined,
            partyLabel: partyNumber || '',
            partyId,
            contractId: contract?.id,
            notes: '',
            company: warehouse.company,
          });
        }}
      />

      <CompactFormDialog
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        title={tx('بارگیری از ذخیره', 'Load from storage')}
        description={tx('فقط لات‌های فعال — مصرف از همان پارتی ثبت می‌شود.', 'Active lots only — consumption posts to that party.')}
        fields={[
          {
            key: 'stockLotId',
            label: tx('لات قرارداد / پارتی', 'Contract lot / party'),
            type: 'select',
            required: true,
            options: activeLots.map((l) => ({
              value: String(l.id),
              label: `${l.partyNumber || '—'} · ${l.contractNumber} · ${formatNumber(l.qty, 3)} ${l.unit} @ ${formatCurrency(l.unitPrice || 0)}`,
            })),
          },
          { key: 'qty', label: tx('مقدار', 'Qty'), type: 'number', required: true },
          { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
          { key: 'counterparty', label: tx('طرف حساب', 'Counterparty') },
          { key: 'details', label: tx('تفصیلات', 'Details') },
        ]}
        initial={{ date: todayIso() }}
        onSubmit={(v) => {
          const lot = lots.find((l) => l.id === Number(v.stockLotId));
          const qty = Number(v.qty || 0);
          if (!lot || qty <= 0) return;
          addStorageGoodsMove({
            warehouseId,
            date: v.date,
            kind: 'load',
            counterparty: v.counterparty || '',
            details: v.details || `بارگیری ${qty} ${lot.unit} ${lot.productName}`,
            productName: lot.productName,
            productCode: lot.productCode,
            qty,
            unit: lot.unit,
            partyLabel: lot.partyNumber || '',
            partyId: lot.partyId,
            contractId: lot.contractId,
            notes: '',
            company: warehouse.company,
            stockLotId: lot.id,
          });
        }}
      />

      <Dialog
        open={sellOpen}
        onClose={() => setSellOpen(false)}
        title={tx('فروش — انتخاب لات قرارداد', 'Sell — pick contract lot')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setSellOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                const qty = Number(sellQty || 0);
                if (!selectedLot || qty <= 0) return;
                if (sellFromLot(selectedLot.id, qty)) {
                  addStorageGoodsMove({
                    warehouseId,
                    date: todayIso(),
                    kind: 'load',
                    counterparty: '',
                    details: `فروش ${qty} ${selectedLot.unit} ${selectedLot.productName}`,
                    productName: selectedLot.productName,
                    productCode: selectedLot.productCode,
                    qty,
                    unit: selectedLot.unit,
                    partyLabel: selectedLot.partyNumber || '',
                    partyId: selectedLot.partyId,
                    contractId: selectedLot.contractId,
                    notes: '',
                    company: warehouse.company,
                  });
                  setSellOpen(false);
                }
              }}
              disabled={!selectedLotId || !sellQty}
            >
              {tx('تأیید فروش', 'Confirm sale')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>{tx('لات قرارداد', 'Contract lot')}</Label>
            <Select value={selectedLotId} onChange={(e) => setSelectedLotId(e.target.value)}>
              <option value="">—</option>
              {activeLots.map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.partyNumber || '—'} · {l.contractNumber} · {formatNumber(l.qty, 3)} {l.unit} @ {formatCurrency(l.unitPrice || 0)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{tx('مقدار فروش', 'Sell qty')}</Label>
            <Input type="number" dir="ltr" className="text-left" value={sellQty} onChange={(e) => setSellQty(e.target.value)} />
          </div>
        </div>
      </Dialog>
      <RelatedJournal filter={{ warehouseId }} />
    </div>
  );
}
