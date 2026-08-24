'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Train } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { ExpensePageBar } from '@/components/expenses/expense-page-bar';
import { useOpsStore } from '@/lib/ops-store';
import {
  accrueWagonRent,
  cashNet,
  runningCashBalances,
} from '@/lib/storage-ledger';
import { jalaliFromIso } from '@/lib/customer-resale';
import { todayIso } from '@/lib/purchase-flow';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';

export default function StorageCashPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const warehouseId = Number(id);
  const { tx } = useI18n();
  const warehouseEntities = useOpsStore((s) => s.warehouseEntities);
  const storageCashEntriesAll = useOpsStore((s) => s.storageCashEntries);
  const wagonRentStaysAll = useOpsStore((s) => s.wagonRentStays);
  const warehouse = useMemo(
    () => warehouseEntities.find((w) => w.id === warehouseId),
    [warehouseEntities, warehouseId]
  );
  const entries = useMemo(
    () => storageCashEntriesAll.filter((e) => e.warehouseId === warehouseId),
    [storageCashEntriesAll, warehouseId]
  );
  const stays = useMemo(
    () => wagonRentStaysAll.filter((s) => s.warehouseId === warehouseId),
    [wagonRentStaysAll, warehouseId]
  );
  const addStorageCashEntry = useOpsStore((s) => s.addStorageCashEntry);
  const addWagonRentStay = useOpsStore((s) => s.addWagonRentStay);
  const settleWagonRent = useOpsStore((s) => s.settleWagonRent);
  const rawParties = useOpsStore((s) => s.lists.parties ?? []);

  const [cashOpen, setCashOpen] = useState(false);
  const [rentOpen, setRentOpen] = useState(false);
  const [settleId, setSettleId] = useState<number | null>(null);
  const [settleEnd, setSettleEnd] = useState(todayIso());

  const ledger = runningCashBalances(entries);
  const net = entries.reduce((s, e) => s + cashNet(e), 0);
  const openStays = stays.filter((s) => s.status === 'open');
  const openAccrued = openStays.reduce((s, stay) => s + accrueWagonRent(stay).amount, 0);

  const settleStay = stays.find((s) => s.id === settleId);
  const settlePreview = settleStay
    ? accrueWagonRent({ ...settleStay, rentEndDate: settleEnd }, settleEnd)
    : null;

  if (!warehouse) {
    return (
      <div className="space-y-3">
        <p>{tx('ذخیره یافت نشد.', 'Storage not found.')}</p>
        <Link href="/dashboard/warehouses">
          <Button variant="outline">{tx('بازگشت', 'Back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ExpensePageBar
        title={`${tx('حساب نقدی', 'Cash account')} — ${warehouse.name}`}
        balance={net}
        backHref={`/dashboard/warehouses/${warehouseId}`}
        backLabel={tx('برگشت به صفحه', 'Back to page')}
        actions={
          <>
            <Button type="button" size="sm" variant="secondary" onClick={() => setRentOpen(true)}>
              <Train className="ml-2 h-4 w-4" />
              {tx('شروع کرایه واگن', 'Start wagon rent')}
            </Button>
            <Button type="button" size="sm" onClick={() => setCashOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {tx('ثبت قلم نقدی', 'Cash entry')}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden rounded-[22px] border-amber-200 bg-amber-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tx('کرایه روزانه واگن', 'Daily wagon rent')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <p className="text-sm leading-relaxed text-slate-600">
            {tx(
              'واگن از روز ورود تا تاریخ ختم کرایه می‌خورد. روزهای رایگان کم می‌شود، بعد تعداد واگن × روز × نرخ روزانه. تا وقتی ختم نزنید، مبلغ تا امروز جمع می‌شود.',
              'Wagons accrue rent from arrival until the rent-end date. After free days: wagons × days × daily rate. While open, the amount grows through today.'
            )}
          </p>
          <p className="text-sm font-semibold">
            {tx('طلب باز کرایه', 'Open rent accrued')}:{' '}
            <span className="num">{formatCurrency(openAccrued)}</span>
          </p>
          {openStays.length === 0 ? (
            <p className="text-sm text-slate-500">{tx('واگن بازی در این ذخیره نیست.', 'No open wagon stays here.')}</p>
          ) : (
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tx('شروع', 'Start')}</TableHead>
                    <TableHead>{tx('واگن', 'Wagons')}</TableHead>
                    <TableHead>{tx('نرخ روزانه', 'Daily rate')}</TableHead>
                    <TableHead>{tx('روز قابل‌کرایه', 'Billable days')}</TableHead>
                    <TableHead>{tx('طلب تا امروز', 'Accrued')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openStays.map((stay) => {
                    const acc = accrueWagonRent(stay);
                    return (
                      <TableRow key={stay.id}>
                        <TableCell className="num">{jalaliFromIso(stay.date)}</TableCell>
                        <TableCell className="num">{stay.wagons}</TableCell>
                        <TableCell className="num">{formatCurrency(stay.dailyRatePerWagon)}</TableCell>
                        <TableCell className="num">{acc.days}</TableCell>
                        <TableCell className="num font-semibold">{formatCurrency(acc.amount)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSettleId(stay.id);
                              setSettleEnd(todayIso());
                            }}
                          >
                            {tx('ختم و ثبت در نقدی', 'Close & post')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-teal-50 px-4 py-3 text-center font-bold text-teal-950">
          {warehouse.name}
        </div>
        <ResponsiveData
          table={
            <div className="table-scroll table-scroll-wide">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>تاریخ ختم کرایه</TableHead>
                    <TableHead>طرف حساب</TableHead>
                    <TableHead>تفصیلات</TableHead>
                    <TableHead>گرفت</TableHead>
                    <TableHead>داد</TableHead>
                    <TableHead>بیلانس</TableHead>
                    <TableHead>محل</TableHead>
                    <TableHead>نوعیت</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="py-10 text-center text-sm text-slate-500">
                        {tx('هنوز قلم نقدی نیست.', 'No cash lines yet.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledger.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="num">{r.id}</TableCell>
                        <TableCell className="num">{jalaliFromIso(r.date)}</TableCell>
                        <TableCell className="num">{r.rentEndDate ? jalaliFromIso(r.rentEndDate) : '-'}</TableCell>
                        <TableCell>{r.counterparty}</TableCell>
                        <TableCell className="max-w-[240px] whitespace-normal">{r.details}</TableCell>
                        <TableCell className="num">{r.taken ? formatCurrency(r.taken) : '-'}</TableCell>
                        <TableCell className="num">{r.given ? formatCurrency(r.given) : '-'}</TableCell>
                        <TableCell className={`num font-semibold ${balanceClass(r.balance)}`}>
                          {formatCurrency(r.balance)}
                        </TableCell>
                        <TableCell>{r.location || '-'}</TableCell>
                        <TableCell>{r.productType || '-'}</TableCell>
                        <TableCell>{r.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          }
          cards={ledger.map((r) => (
            <MobileRecordCard
              key={r.id}
              title={r.counterparty || warehouse.name}
              subtitle={jalaliFromIso(r.date)}
              metrics={[
                { label: 'گرفت', value: r.taken ? formatCurrency(r.taken) : '-' },
                { label: 'داد', value: r.given ? formatCurrency(r.given) : '-' },
                {
                  label: 'بیلانس',
                  value: <span className={balanceClass(r.balance)}>{formatCurrency(r.balance)}</span>,
                },
              ]}
              extra={
                <>
                  <ExtraRow label="ختم کرایه" value={r.rentEndDate ? jalaliFromIso(r.rentEndDate) : '-'} />
                  <ExtraRow label="تفصیلات" value={r.details} />
                  <ExtraRow label="محل" value={r.location || '-'} />
                </>
              }
            />
          ))}
        />
      </div>

      <CompactFormDialog
        open={cashOpen}
        onClose={() => setCashOpen(false)}
        title={tx('ثبت حساب نقدی ذخیره', 'Storage cash entry')}
        size="lg"
        fields={[
          { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
          { key: 'rentEndDate', label: tx('تاریخ ختم کرایه', 'Rent end date'), type: 'date' },
          { key: 'counterparty', label: tx('طرف حساب', 'Counterparty'), required: true },
          { key: 'details', label: tx('تفصیلات', 'Details'), required: true },
          { key: 'taken', label: tx('گرفت', 'Taken'), type: 'number' },
          { key: 'given', label: tx('داد', 'Given / paid'), type: 'number' },
          { key: 'location', label: tx('محل', 'Location') },
          { key: 'productType', label: tx('نوعیت', 'Commodity type') },
          { key: 'notes', label: tx('ملاحظات', 'Notes') },
        ]}
        initial={{
          date: todayIso(),
          location: warehouse.location,
          taken: '',
          given: '',
        }}
        onSubmit={(v) => {
          addStorageCashEntry({
            warehouseId,
            date: v.date,
            rentEndDate: v.rentEndDate || '',
            counterparty: v.counterparty,
            details: v.details,
            taken: Number(v.taken || 0),
            given: Number(v.given || 0),
            location: v.location || warehouse.location,
            productType: v.productType || '',
            notes: v.notes || '',
            company: warehouse.company,
          });
        }}
      />

      <CompactFormDialog
        open={rentOpen}
        onClose={() => setRentOpen(false)}
        title={tx('شروع کرایه واگن', 'Start wagon rent')}
        description={tx(
          'از این تاریخ واگن‌ها روزانه کرایه می‌خورند تا وقتی ختم بزنید و به حساب نقدی ثبت شود.',
          'From this date wagons accrue daily rent until you close the stay and post it to cash.'
        )}
        size="lg"
        fields={[
          { key: 'date', label: tx('تاریخ شروع', 'Start date'), type: 'date', required: true },
          { key: 'wagons', label: tx('تعداد واگن', 'Wagons'), type: 'number', required: true },
          { key: 'dailyRatePerWagon', label: tx('کرایه روزانه فی واگن (دالر)', 'Daily rate per wagon (USD)'), type: 'number', required: true },
          { key: 'freeDays', label: tx('روز رایگان', 'Free days'), type: 'number' },
          { key: 'qty', label: tx('وزن / مقدار', 'Weight / qty'), type: 'number' },
          { key: 'dailyRatePerTon', label: tx('نرخ روزانه فی تن (اختیاری)', 'Daily rate per ton (optional)'), type: 'number' },
          { key: 'productType', label: tx('نوعیت جنس', 'Commodity'), required: true },
          {
            key: 'partyId',
            label: tx('پارتی (کرایه جدا)', 'Party (separate rent)'),
            type: 'select',
            options: [
              { value: '', label: tx('بدون پارتی', 'No party') },
              ...rawParties.map((p) => ({
                value: String(p.id),
                label: String(p.number || p.partyNumber || p.id),
              })),
            ],
          },
          { key: 'partyLabel', label: tx('شرح پارتی', 'Party label') },
          { key: 'location', label: tx('محل', 'Location') },
          { key: 'notes', label: tx('ملاحظات', 'Notes') },
        ]}
        initial={{
          date: todayIso(),
          wagons: '60',
          dailyRatePerWagon: '5',
          freeDays: '0',
          location: warehouse.location,
        }}
        onSubmit={(v) => {
          const party = rawParties.find((p) => Number(p.id) === Number(v.partyId || 0));
          addWagonRentStay({
            warehouseId,
            date: v.date,
            rentEndDate: '',
            wagons: Number(v.wagons || 0),
            dailyRatePerWagon: Number(v.dailyRatePerWagon || 0),
            dailyRatePerTon: Number(v.dailyRatePerTon || 0),
            freeDays: Number(v.freeDays || 0),
            qty: Number(v.qty || 0),
            unit: 'تن',
            productType: v.productType,
            partyLabel:
              v.partyLabel ||
              (party ? String(party.number || party.partyNumber || '') : ''),
            partyId: party ? Number(party.id) : undefined,
            location: v.location || warehouse.location,
            notes: v.notes || '',
            company: warehouse.company,
          });
        }}
      />

      {settleStay && settlePreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={() => setSettleId(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold">{tx('ختم کرایه و ثبت نقدی', 'Close rent and post cash')}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {settleStay.wagons} {tx('واگن', 'wagons')} · {settleStay.productType}
            </p>
            <div className="mt-3 space-y-1.5">
              <Label>{tx('تاریخ ختم کرایه', 'Rent end date')}</Label>
              <Input type="date" value={settleEnd} onChange={(e) => setSettleEnd(e.target.value)} />
            </div>
            <p className="mt-3 text-sm">
              {tx('روز قابل‌کرایه', 'Billable days')}: <strong className="num">{settlePreview.days}</strong>
            </p>
            <p className="text-sm">
              {tx('مبلغ', 'Amount')}: <strong className="num">{formatCurrency(settlePreview.amount)}</strong>
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSettleId(null)}>
                {tx('انصراف', 'Cancel')}
              </Button>
              <Button
                onClick={() => {
                  settleWagonRent(settleStay.id, settleEnd);
                  setSettleId(null);
                }}
              >
                {tx('ثبت در حساب نقدی', 'Post to cash')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
