'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackagePlus, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';
import { BrandDocumentHeader, CompanyLogo } from '@/components/brand/company-logo';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import { calcSellable, normalizeParty, type PartyStageMetrics } from '@/lib/stock-lots';
import { formatNumber } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';
import { RelatedJournal } from '@/components/journal/related-journal';
import { todayIso } from '@/lib/purchase-flow';
import { isPartyOpenForExpenses } from '@/lib/permissions';
import { exportToPdf } from '@/lib/export';

const EMPTY: OpsRow[] = [];

const STAGES: Array<{ key: keyof typeof STAGE_KEYS; fa: string; en: string }> = [
  { key: 'arrived', fa: 'آمد واگون / موتر', en: 'Arrived wagons/trucks' },
  { key: 'unloaded', fa: 'تخلیه', en: 'Unloaded' },
  { key: 'sold', fa: 'فروش', en: 'Sold' },
  { key: 'shortage', fa: 'کسرات', en: 'Shortage' },
  { key: 'waste', fa: 'ضایعات', en: 'Waste' },
  { key: 'sellable', fa: 'قابل فروش', en: 'Sellable' },
  { key: 'transit', fa: 'ترانزیت', en: 'Transit' },
];

const STAGE_KEYS = {
  arrived: true,
  unloaded: true,
  sold: true,
  shortage: true,
  waste: true,
  sellable: true,
  transit: true,
} as const;

export default function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const partyId = Number(id);
  const { locale, t } = useI18n();
  const contracts = useOpsStore((s) => s.contracts);
  const warehouses = useOpsStore((s) => s.warehouseEntities);
  const receiveToWarehouse = useOpsStore((s) => s.receiveToWarehouse);
  const addStorageGoodsMove = useOpsStore((s) => s.addStorageGoodsMove);
  const setPartyStatus = useOpsStore((s) => s.setPartyStatus);
  const setList = useOpsStore((s) => s.setList);
  const raw = useOpsStore((s) =>
    ((s.lists.parties ?? EMPTY) as unknown as Record<string, unknown>[]).find(
      (p) => Number(p.id) === partyId
    )
  );
  const [editOpen, setEditOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});

  const party = useMemo(() => (raw ? normalizeParty(raw) : null), [raw]);
  const contract = contracts.find((c) => c.id === party?.contractId);

  if (!party) {
    return (
      <div className="space-y-4">
        <p>{locale === 'en' ? 'Party not found.' : 'پارتی یافت نشد.'}</p>
        <Link href="/dashboard/parties">
          <Button variant="outline">{t('back')}</Button>
        </Link>
      </div>
    );
  }

  const titleProduct = party.product || contract?.product || '—';
  const titleSupplier = party.supplierName || contract?.supplierName || '—';
  const unit = party.unit || contract?.unit || 'تن';

  const openEdit = () => {
    const next: Record<string, string> = {
      plannedWagons: String(party.plannedWagons),
      plannedQty: String(party.plannedQty),
      location: party.location,
      notes: party.notes,
    };
    for (const s of STAGES) {
      const m = party[s.key] as PartyStageMetrics;
      next[`${s.key}Wagons`] = String(m.wagons);
      next[`${s.key}Count`] = String(m.count);
      next[`${s.key}Qty`] = String(m.qty);
    }
    setDraft(next);
    setEditOpen(true);
  };

  const saveEdit = () => {
    const rows = (useOpsStore.getState().lists.parties ?? []) as OpsRow[];
    const stage = (key: string): PartyStageMetrics => ({
      wagons: Number(draft[`${key}Wagons`] || 0),
      count: Number(draft[`${key}Count`] || 0),
      qty: Number(draft[`${key}Qty`] || 0),
    });
    const unloaded = stage('unloaded');
    const sold = stage('sold');
    const shortage = stage('shortage');
    const waste = stage('waste');
    const sellable = calcSellable({ unloaded, sold, shortage, waste });
    setList(
      'parties',
      rows.map((r) => {
        if (Number(r.id) !== party.id) return r;
        return {
          ...r,
          location: draft.location ?? party.location,
          notes: draft.notes ?? party.notes,
          plannedWagons: Number(draft.plannedWagons || 0),
          plannedQty: Number(draft.plannedQty || 0),
          wagons: Number(draft.plannedWagons || 0),
          qty: Number(draft.plannedQty || 0),
          arrivedWagons: stage('arrived').wagons,
          arrivedCount: stage('arrived').count,
          arrived: stage('arrived').qty,
          unloadedWagons: unloaded.wagons,
          unloadedCount: unloaded.count,
          unloaded: unloaded.qty,
          soldWagons: sold.wagons,
          soldCount: sold.count,
          sold: sold.qty,
          shortageWagons: shortage.wagons,
          shortageCount: shortage.count,
          shortage: shortage.qty,
          wasteWagons: waste.wagons,
          wasteCount: waste.count,
          waste: waste.qty,
          sellableWagons: sellable.wagons,
          sellableCount: sellable.count,
          sellable: sellable.qty,
          transitWagons: stage('transit').wagons,
          transitCount: stage('transit').count,
          transit: stage('transit').qty,
        };
      })
    );
    setEditOpen(false);
  };

  const receiveGoods = () => {
    const whId = Number(warehouseId);
    if (!whId || party.unloaded.qty <= 0) return;
    receiveToWarehouse({
      warehouseId: whId,
      productCode: party.productCode || contract?.productCode || 'DIESEL',
      productName: titleProduct,
      unit,
      qty: party.unloaded.qty,
      unitPrice: contract?.pricePerUnit || 0,
      contractId: party.contractId,
      contractNumber: party.contractNumber,
      partyId: party.id,
      partyNumber: party.number,
      supplierName: titleSupplier,
      company: party.company || contract?.company || 'arya',
      notes: `از پارتی ${party.number}`,
    });
    addStorageGoodsMove({
      warehouseId: whId,
      date: todayIso(),
      kind: 'unload',
      counterparty: titleSupplier,
      details: `تخلیه پارتی ${party.number} — ${formatNumber(party.unloaded.qty, 3)} ${unit} ${titleProduct}`,
      productName: titleProduct,
      productCode: party.productCode || contract?.productCode || 'DIESEL',
      qty: party.unloaded.qty,
      unit,
      partyLabel: party.number,
      partyId: party.id,
      contractId: party.contractId,
      notes: '',
      company: party.company || contract?.company || 'arya',
    });
    setReceiveOpen(false);
  };

  const partyCompany = party.company || contract?.company || 'arya';

  return (
    <div className="space-y-5 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/parties',
        }))}
      />

      <BrandDocumentHeader
        company={partyCompany}
        title={`${locale === 'en' ? 'Party' : 'پارتی'} ${party.number || party.id}`}
        subtitle={`${titleSupplier} — ${titleProduct} — ${locale === 'en' ? 'Contract' : 'قرارداد'} ${party.contractNumber}`}
        actions={
          <Button
            size="sm"
            className="bg-emerald-500 text-white hover:bg-emerald-400"
            onClick={() =>
              void exportToPdf(
                `${locale === 'en' ? 'Party' : 'پارتی'} ${party.number}`,
                [
                  { key: 'field', label: locale === 'en' ? 'Field' : 'فیلد' },
                  { key: 'value', label: locale === 'en' ? 'Value' : 'مقدار' },
                ],
                [
                  { field: locale === 'en' ? 'Party' : 'پارتی', value: party.number },
                  { field: locale === 'en' ? 'Contract' : 'قرارداد', value: party.contractNumber },
                  { field: locale === 'en' ? 'Vendor' : 'طرف قرارداد', value: titleSupplier },
                  { field: locale === 'en' ? 'Product' : 'کالا', value: titleProduct },
                  { field: locale === 'en' ? 'Unloaded' : 'تخلیه', value: party.unloaded.qty },
                  { field: locale === 'en' ? 'Sold' : 'فروش', value: party.sold.qty },
                  { field: locale === 'en' ? 'Shortage' : 'کسرات', value: party.shortage.qty },
                  { field: locale === 'en' ? 'Waste' : 'ضایعات', value: party.waste.qty },
                  { field: locale === 'en' ? 'Sellable' : 'قابل فروش', value: party.sellable.qty },
                ],
                { company: partyCompany, subtitle: titleSupplier }
              )
            }
          >
            {locale === 'en' ? 'Print / PDF' : 'خروجی پارتی'}
          </Button>
        }
      />

      {/* Header card matching the spreadsheet style */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 md:grid-cols-[auto_1fr_auto_auto]">
          <div className="flex items-center justify-center bg-amber-100 px-5 py-4 text-2xl font-extrabold text-amber-900 num">
            {party.number || party.id}
          </div>
          <div className="flex flex-col justify-center gap-1 bg-rose-50 px-5 py-4 text-center">
            <p className="text-base font-extrabold text-rose-900 sm:text-lg">{titleSupplier}</p>
            <p className="text-sm font-semibold text-slate-700">
              {locale === 'en' ? 'Party' : 'پارتی'} {party.plannedQty || party.number}{' '}
              {unit} {titleProduct} — {locale === 'en' ? 'Contract' : 'قرارداد'}{' '}
              <Link
                href={`/dashboard/contracts/${party.contractId}`}
                className="text-teal-700 hover:underline num"
              >
                {party.contractNumber}
              </Link>
            </p>
          </div>
          <div className="flex items-center justify-center bg-black px-4 py-3">
            <CompanyLogo company={partyCompany} size="md" />
          </div>
          <div className="flex items-center justify-center bg-slate-50 px-5 py-4 text-sm font-bold text-slate-800">
            {party.location || '—'}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{titleProduct}</Badge>
            <Badge variant="muted">{unit}</Badge>
            <Badge variant={isPartyOpenForExpenses(party.status) ? 'success' : 'warning'}>
              {isPartyOpenForExpenses(party.status)
                ? locale === 'en'
                  ? 'Active'
                  : 'فعال'
                : locale === 'en'
                  ? 'Inactive — expenses closed'
                  : 'غیرفعال — مصرف بسته'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPartyStatus(
                  party.id,
                  isPartyOpenForExpenses(party.status) ? 'inactive' : 'active'
                )
              }
            >
              {isPartyOpenForExpenses(party.status)
                ? locale === 'en'
                  ? 'Deactivate party'
                  : 'غیرفعال کردن پارتی'
                : locale === 'en'
                  ? 'Reactivate party'
                  : 'فعال کردن پارتی'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={openEdit}>
              <Pencil className="ms-2 h-3.5 w-3.5" />
              {t('edit')}
            </Button>
            <Button size="sm" onClick={() => setReceiveOpen(true)}>
              <PackagePlus className="ms-2 h-3.5 w-3.5" />
              {locale === 'en' ? 'Send to warehouse' : 'ورود به انبار'}
            </Button>
            <Link href="/dashboard/parties">
              <Button size="sm" variant="outline">
                <ArrowRight className="ms-2 h-3.5 w-3.5" />
                {t('back')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="min-w-[160px]">
                  {locale === 'en' ? 'Status' : 'وضعیت'}
                </TableHead>
                <TableHead className="text-center">
                  {locale === 'en' ? 'Wagons / trucks' : 'تعداد واگون / موتر'}
                </TableHead>
                <TableHead className="text-center">
                  {locale === 'en' ? 'Count' : 'تعداد'}
                </TableHead>
                <TableHead className="text-center">
                  {locale === 'en' ? `Qty (${unit})` : `تناژ / لیتر (${unit})`}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STAGES.map((s) => {
                const m = party[s.key] as PartyStageMetrics;
                return (
                  <TableRow key={s.key} className={s.key === 'sellable' ? 'bg-emerald-50/60' : undefined}>
                    <TableCell className="font-semibold text-slate-800">
                      {locale === 'en' ? s.en : s.fa}
                    </TableCell>
                    <TableCell className="text-center num font-medium">
                      {formatNumber(m.wagons, 0)}
                    </TableCell>
                    <TableCell className="text-center num font-medium">
                      {formatNumber(m.count, 0)}
                    </TableCell>
                    <TableCell className="text-center num font-bold">
                      {formatNumber(m.qty, 3)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">
              {locale === 'en' ? 'Planned qty' : 'مقدار برنامه‌ریزی'}
            </p>
            <p className="mt-1 text-xl font-bold num">
              {formatNumber(party.plannedQty, 0)} {unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">
              {locale === 'en' ? 'Sellable' : 'قابل فروش'}
            </p>
            <p className="mt-1 text-xl font-bold num text-emerald-700">
              {formatNumber(party.sellable.qty, 0)} {unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">
              {locale === 'en' ? 'Linked contract' : 'قرارداد مرتبط'}
            </p>
            <Link
              href={`/dashboard/contracts/${party.contractId}`}
              className="mt-1 block text-xl font-bold text-teal-700 hover:underline num"
            >
              {party.contractNumber}
            </Link>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={locale === 'en' ? 'Edit party metrics' : 'ویرایش ارقام پارتی'}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={saveEdit}>{t('save')}</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>{locale === 'en' ? 'Location' : 'محل'}</Label>
            <Input
              value={draft.location ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
            />
          </div>
          <div>
            <Label>{locale === 'en' ? 'Planned qty' : 'مقدار برنامه'}</Label>
            <Input
              type="number"
              dir="ltr"
              className="text-left"
              value={draft.plannedQty ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, plannedQty: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {STAGES.filter((s) => s.key !== 'sellable').map((s) => (
            <div key={s.key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                {locale === 'en' ? s.en : s.fa}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(['Wagons', 'Count', 'Qty'] as const).map((suf) => (
                  <div key={suf}>
                    <Label className="text-xs">
                      {suf === 'Wagons'
                        ? locale === 'en'
                          ? 'Wagons'
                          : 'واگون'
                        : suf === 'Count'
                          ? locale === 'en'
                            ? 'Count'
                            : 'تعداد'
                          : unit}
                    </Label>
                    <Input
                      type="number"
                      dir="ltr"
                      className="text-left"
                      value={draft[`${s.key}${suf}`] ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [`${s.key}${suf}`]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500">
            {locale === 'en'
              ? 'Sellable is calculated automatically: unloaded − sold − shortage − waste.'
              : 'قابل فروش به‌صورت خودکار محاسبه می‌شود: تخلیه − فروش − کسرات − ضایعات.'}
          </p>
        </div>
      </Dialog>

      <RelatedJournal filter={{ partyId: party.id }} />

      <Dialog
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        title={locale === 'en' ? 'Receive into warehouse' : 'ورود تخلیه‌شده به انبار'}
        description={
          locale === 'en'
            ? `Creates a stock lot linked to contract ${party.contractNumber}.`
            : `یک موجودی قراردادمحور برای قرارداد ${party.contractNumber} ساخته می‌شود.`
        }
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setReceiveOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={receiveGoods} disabled={!warehouseId || party.unloaded.qty <= 0}>
              {t('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {locale === 'en' ? 'Unloaded qty' : 'مقدار تخلیه'}:{' '}
            <strong className="num">
              {formatNumber(party.unloaded.qty, 3)} {unit}
            </strong>
          </p>
          <div>
            <Label>{locale === 'en' ? 'Warehouse' : 'انبار'}</Label>
            <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="">—</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name} — {w.location}
                </option>
              ))}
            </Select>
          </div>
          {warehouses.length === 0 ? (
            <Link href="/dashboard/warehouses" className="text-sm text-teal-700 underline">
              {locale === 'en' ? 'Create a warehouse first' : 'ابتدا یک انبار بسازید'}
            </Link>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
