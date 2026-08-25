'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Columns3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { Dialog } from '@/components/ui/dialog';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { CompanyKey, ForeignArrivalRecord } from '@/lib/demo-data';
import {
  expenseTotal,
  normalizeExpenseColumns,
  slugExpenseKey,
  type ExpenseColumnDef,
} from '@/lib/foreign-arrival-expenses';
import { notifyAdminChange } from '@/lib/activity-store';
import { jalaliFromIso } from '@/lib/customer-resale';
import { gregorianFromIso } from '@/lib/date-utils';
import { todayIso } from '@/lib/purchase-flow';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];
const EXPENSE_COLS_KEY = 'foreignArrivalExpenseColumns';

export default function ForeignArrivalsPage() {
  const { t, tx, locale } = useI18n();
  const { company } = useCompanyStore();
  const items = useOpsStore(
    (s) => (s.lists.foreignArrivals ?? EMPTY) as unknown as ForeignArrivalRecord[]
  );
  const rawCols = useOpsStore((s) => s.lists[EXPENSE_COLS_KEY] ?? EMPTY);
  const setList = useOpsStore((s) => s.setList);
  const addToList = useOpsStore((s) => s.addToList);
  const [createOpen, setCreateOpen] = useState(false);
  const [colOpen, setColOpen] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [expenseEditId, setExpenseEditId] = useState<number | null>(null);

  const expenseCols = useMemo(
    () => normalizeExpenseColumns(rawCols),
    [rawCols]
  );

  const rows = items.filter((a) => matchesCompany(a.company, company));
  const editing = rows.find((r) => r.id === expenseEditId);

  const saveColumns = (cols: ExpenseColumnDef[]) => {
    setList(
      EXPENSE_COLS_KEY,
      cols.map((c, i) => ({ id: i + 1, key: c.key, label: c.label }))
    );
  };

  const addExpenseColumn = () => {
    const label = newColLabel.trim();
    if (!label) return;
    const key = slugExpenseKey(label);
    if (expenseCols.some((c) => c.key === key || c.label === label)) {
      setNewColLabel('');
      setColOpen(false);
      return;
    }
    saveColumns([...expenseCols, { key, label }]);
    setNewColLabel('');
    setColOpen(false);
    notifyAdminChange({
      action: 'create',
      module: 'foreign-arrivals',
      moduleFa: 'وارده خارجی',
      moduleEn: 'Foreign arrivals',
      entityLabelFa: 'ستون مصرف',
      entityLabelEn: 'Expense column',
      entityName: label,
    });
  };

  const saveExpenses = (arrivalId: number, values: Record<string, string>) => {
    setList(
      'foreignArrivals',
      items.map((r) => {
        if (r.id !== arrivalId) return r;
        const expenses: Record<string, number> = { ...(r.expenses || {}) };
        for (const c of expenseCols) {
          expenses[c.key] = Number(values[c.key] || 0);
        }
        return { ...r, expenses };
      })
    );
    notifyAdminChange({
      action: 'update',
      module: 'foreign-arrivals',
      moduleFa: 'وارده خارجی',
      moduleEn: 'Foreign arrivals',
      entityLabelFa: 'مصارف وارده',
      entityLabelEn: 'Arrival expenses',
      entityName: String(editing?.number || arrivalId),
    });
    setExpenseEditId(null);
  };

  const activity = {
    module: 'foreign-arrivals',
    moduleFa: 'وارده خارجی',
    moduleEn: 'Foreign arrivals',
    entityLabelFa: 'وارده',
    entityLabelEn: 'Arrival',
    entityName: 'number',
  };

  const exportRows = rows.map((a) => {
    const expenses = a.expenses || {};
    const expFields = Object.fromEntries(
      expenseCols.map((c) => [c.key, Number(expenses[c.key]) || 0])
    );
    const {
      expenses: _e,
      id: _id,
      supplierId: _sid,
      contractId: _cid,
      ...rest
    } = a;
    return {
      ...rest,
      ...expFields,
      expenseTotal: expenseTotal(expenses, expenseCols),
      company: a.company === 'arya' ? t('companyArya') : t('companyTurkmen'),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageForeignArrivals')}
        description={tx(
          'وارده خارجی با مصارف قابل‌تنظیم — ستون مصرف جدید اضافه کنید و مبلغ هر وارده را ثبت کنید. تاریخ سند قابل تغییر است.',
          'Foreign arrivals with configurable expenses — add expense columns and amounts. Document dates are editable.'
        )}
        actions={
          <>
            <ExportButtons
              filename="foreign-arrivals"
              title={tx('وارده‌های خارجی', 'Foreign arrivals')}
              columns={[
                { key: 'number', label: tx('شماره', 'No.') },
                { key: 'dateJalali', label: tx('تاریخ', 'Date') },
                { key: 'supplier', label: tx('فروشنده', 'Seller') },
                { key: 'product', label: tx('نوع جنس', 'Product') },
                { key: 'contractNumber', label: tx('قرارداد', 'Contract') },
                { key: 'seymirWeight', label: tx('وزن/مقدار', 'Qty') },
                ...expenseCols.map((c) => ({ key: c.key, label: c.label })),
                { key: 'expenseTotal', label: tx('جمع مصارف', 'Expense total') },
                { key: 'status', label: tx('وضعیت', 'Status') },
              ]}
              rows={exportRows}
            />
            <CompanySwitcher />
            <Button variant="outline" onClick={() => setColOpen(true)}>
              <Columns3 className="ms-2 h-4 w-4" />
              {tx('ستون مصرف جدید', 'New expense column')}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {tx('وارده جدید', 'New arrival')}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('تعداد وارده', 'Arrivals')}</p>
            <p className="mt-1 text-xl font-bold num">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('ستون‌های مصارف', 'Expense columns')}</p>
            <p className="mt-1 text-xl font-bold num">{expenseCols.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('جمع مصارف', 'Total expenses')}</p>
            <p className="mt-1 text-xl font-bold num">
              {formatCurrency(
                rows.reduce((s, a) => s + expenseTotal(a.expenses, expenseCols), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tx('وارده شرکت', 'Company arrivals')}</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-0 pb-4 lg:pb-0">
          <ResponsiveData
            breakpoint="md"
            table={
              <div className="table-scroll table-scroll-wide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <BiLabel fa="شماره" en="No." />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="تاریخ" en="Date" />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="فروشنده" en="Seller" />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="جنس" en="Product" />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="قرارداد" en="Contract" />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="مقدار" en="Qty" />
                      </TableHead>
                      {expenseCols.map((c) => (
                        <TableHead key={c.key}>{c.label}</TableHead>
                      ))}
                      <TableHead>
                        <BiLabel fa="جمع مصارف" en="Expenses" />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="وضعیت" en="Status" />
                      </TableHead>
                      <TableHead>
                        <BiLabel fa="عملیات" en="Actions" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty
                        colSpan={9 + expenseCols.length}
                        message={tx(
                          'هنوز وارده خارجی ثبت نشده است',
                          'No foreign arrivals yet'
                        )}
                      />
                    ) : null}
                    {rows.map((a) => {
                      const total = expenseTotal(a.expenses, expenseCols);
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="num font-semibold">{a.number}</TableCell>
                          <TableCell className="num">{a.dateJalali || '—'}</TableCell>
                          <TableCell>
                            {a.supplierId ? (
                              <Link
                                href={`/dashboard/suppliers/${a.supplierId}`}
                                className="text-[var(--brand)] hover:underline"
                              >
                                {a.supplier || '—'}
                              </Link>
                            ) : (
                              a.supplier || '—'
                            )}
                          </TableCell>
                          <TableCell>{a.product}</TableCell>
                          <TableCell>
                            {a.contractId ? (
                              <Link
                                href={`/dashboard/contracts/${a.contractId}`}
                                className="num text-[var(--brand)] hover:underline"
                              >
                                {a.contractNumber}
                              </Link>
                            ) : (
                              <span className="num">{a.contractNumber || '—'}</span>
                            )}
                          </TableCell>
                          <TableCell className="num">
                            {formatNumber(a.seymirWeight, 1)}
                          </TableCell>
                          {expenseCols.map((c) => (
                            <TableCell key={c.key} className="num">
                              {formatNumber(Number(a.expenses?.[c.key]) || 0, 0)}
                            </TableCell>
                          ))}
                          <TableCell className="num font-bold text-amber-800">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="muted">{a.status || '—'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExpenseEditId(a.id)}
                              >
                                {tx('مصارف', 'Expenses')}
                              </Button>
                              <RecordActions
                                title={tx('وارده خارجی', 'Foreign arrival')}
                                activity={activity}
                                row={{
                                  number: a.number,
                                  dateIso: a.dateIso || '',
                                  dateJalali: a.dateJalali,
                                  supplier: a.supplier,
                                  product: a.product,
                                  contractNumber: a.contractNumber,
                                  location: a.location,
                                  seymirWeight: a.seymirWeight,
                                  unloadedWeight: a.unloadedWeight,
                                  shortage: a.shortage,
                                  notes: a.notes,
                                }}
                                fields={[
                                  { key: 'number', label: tx('شماره', 'No.') },
                                  {
                                    key: 'dateIso',
                                    label: tx('تاریخ سند (میلادی)', 'Document date'),
                                    type: 'date',
                                  },
                                  { key: 'dateJalali', label: tx('تاریخ شمسی', 'Jalali date') },
                                  { key: 'supplier', label: tx('فروشنده', 'Seller') },
                                  { key: 'product', label: tx('کالا', 'Product') },
                                  { key: 'contractNumber', label: tx('قرارداد', 'Contract') },
                                  { key: 'location', label: tx('محل', 'Location') },
                                  {
                                    key: 'seymirWeight',
                                    label: tx('وزن/مقدار', 'Qty'),
                                    type: 'number',
                                  },
                                  {
                                    key: 'unloadedWeight',
                                    label: tx('وزن تخلیه', 'Unloaded'),
                                    type: 'number',
                                  },
                                  {
                                    key: 'shortage',
                                    label: tx('کسری', 'Shortage'),
                                    type: 'number',
                                  },
                                  {
                                    key: 'notes',
                                    label: tx('ملاحظات', 'Notes'),
                                    multiline: true,
                                  },
                                ]}
                                onSave={(next) => {
                                  const dateIso = String(next.dateIso || a.dateIso || '');
                                  setList(
                                    'foreignArrivals',
                                    items.map((r) =>
                                      r.id === a.id
                                        ? {
                                            ...r,
                                            number: String(next.number ?? r.number),
                                            dateIso: dateIso || r.dateIso,
                                            dateJalali: dateIso
                                              ? jalaliFromIso(dateIso)
                                              : String(next.dateJalali ?? r.dateJalali),
                                            dateGregorian: dateIso
                                              ? gregorianFromIso(dateIso)
                                              : r.dateGregorian,
                                            product: String(next.product ?? r.product),
                                            supplier: String(next.supplier ?? r.supplier),
                                            contractNumber: String(
                                              next.contractNumber ?? r.contractNumber
                                            ),
                                            location: String(next.location ?? r.location),
                                            seymirWeight: Number(
                                              next.seymirWeight ?? r.seymirWeight
                                            ),
                                            unloadedWeight: Number(
                                              next.unloadedWeight ?? r.unloadedWeight
                                            ),
                                            shortage: Number(next.shortage ?? r.shortage),
                                            notes: String(next.notes ?? r.notes),
                                          }
                                        : r
                                    )
                                  );
                                }}
                                onDelete={() =>
                                  setList(
                                    'foreignArrivals',
                                    items.filter((r) => r.id !== a.id)
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {tx('هنوز وارده خارجی ثبت نشده است', 'No foreign arrivals yet')}
                </p>
              ) : (
                rows.map((a) => (
                  <MobileRecordCard
                    key={a.id}
                    title={a.number}
                    subtitle={`${a.product} · ${a.dateJalali || '—'}`}
                    badge={<Badge variant="info">{a.status || '—'}</Badge>}
                    metrics={[
                      { label: tx('فروشنده', 'Seller'), value: a.supplier || '—' },
                      {
                        label: tx('مقدار', 'Qty'),
                        value: formatNumber(a.seymirWeight, 1),
                      },
                      {
                        label: tx('جمع مصارف', 'Expenses'),
                        value: formatCurrency(expenseTotal(a.expenses, expenseCols)),
                      },
                      {
                        label: tx('کسری', 'Shortage'),
                        value: formatNumber(a.shortage, 1),
                      },
                    ]}
                    extra={
                      <>
                        {expenseCols.map((c) => (
                          <ExtraRow
                            key={c.key}
                            label={c.label}
                            value={formatNumber(Number(a.expenses?.[c.key]) || 0, 0)}
                          />
                        ))}
                        <ExtraRow label={tx('مبدأ', 'Origin')} value={a.originCountry || '—'} />
                        <ExtraRow label={tx('مرز', 'Border')} value={a.border || '—'} />
                        <ExtraRow label={tx('ملاحظات', 'Notes')} value={a.notes || '—'} />
                      </>
                    }
                    footer={
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpenseEditId(a.id)}
                        >
                          {tx('مصارف', 'Expenses')}
                        </Button>
                        <RecordActions
                          layout="buttons"
                          title={tx('وارده خارجی', 'Foreign arrival')}
                          activity={activity}
                          row={{
                            number: a.number,
                            dateIso: a.dateIso || '',
                            dateJalali: a.dateJalali,
                            product: a.product,
                            notes: a.notes,
                          }}
                          fields={[
                            { key: 'number', label: tx('شماره', 'No.') },
                            {
                              key: 'dateIso',
                              label: tx('تاریخ سند', 'Document date'),
                              type: 'date',
                            },
                            { key: 'product', label: tx('کالا', 'Product') },
                            {
                              key: 'notes',
                              label: tx('ملاحظات', 'Notes'),
                              multiline: true,
                            },
                          ]}
                          onSave={(next) => {
                            const dateIso = String(next.dateIso || '');
                            setList(
                              'foreignArrivals',
                              items.map((r) =>
                                r.id === a.id
                                  ? {
                                      ...r,
                                      number: String(next.number ?? r.number),
                                      dateIso: dateIso || r.dateIso,
                                      dateJalali: dateIso
                                        ? jalaliFromIso(dateIso)
                                        : r.dateJalali,
                                      dateGregorian: dateIso
                                        ? gregorianFromIso(dateIso)
                                        : r.dateGregorian,
                                      product: String(next.product ?? r.product),
                                      notes: String(next.notes ?? r.notes),
                                    }
                                  : r
                              )
                            );
                          }}
                          onDelete={() =>
                            setList(
                              'foreignArrivals',
                              items.filter((r) => r.id !== a.id)
                            )
                          }
                        />
                      </div>
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
        title={tx('وارده جدید', 'New arrival')}
        description={tx(
          'تاریخ سند را دلخواه وارد کنید؛ مصارف را بعد از ثبت می‌توانید تکمیل کنید.',
          'Pick any document date; fill expenses after saving.'
        )}
        fields={[
          {
            key: 'number',
            label: tx('شماره', 'No.'),
            required: true,
            dir: 'ltr',
            placeholder: 'FA-001',
          },
          {
            key: 'date',
            label: tx('تاریخ سند', 'Document date'),
            type: 'date',
            required: true,
          },
          { key: 'supplier', label: tx('فروشنده', 'Seller'), required: true },
          { key: 'product', label: tx('نوع جنس', 'Product'), required: true },
          { key: 'contractNumber', label: tx('قرارداد', 'Contract') },
          {
            key: 'seymirWeight',
            label: tx('وزن/مقدار', 'Qty'),
            type: 'number',
          },
          { key: 'location', label: tx('محل', 'Location') },
          { key: 'originCountry', label: tx('کشور مبدأ', 'Origin country') },
          {
            key: 'company',
            label: t('colCompany'),
            type: 'select',
            options: [
              { value: 'arya', label: t('companyArya') },
              { value: 'turkmen', label: t('companyTurkmen') },
            ],
          },
        ]}
        initial={{ date: todayIso(), company: 'arya' }}
        submitLabel={tx('ثبت وارده', 'Save arrival')}
        onSubmit={(v) => {
          const dateIso = v.date || todayIso();
          const number = v.number.trim();
          addToList('foreignArrivals', {
            number,
            dateIso,
            dateJalali: jalaliFromIso(dateIso),
            dateGregorian: gregorianFromIso(dateIso),
            product: v.product,
            supplier: v.supplier,
            supplierId: 0,
            contractId: 0,
            contractNumber: v.contractNumber,
            shipmentNo: '',
            wagons: 0,
            seymirWeight: Number(v.seymirWeight || 0),
            unloadedWagons: 0,
            unloadedWeight: 0,
            shortage: 0,
            location: v.location,
            originCountry: v.originCountry,
            border: '',
            destWarehouse: '',
            status: 'در راه',
            company: (v.company as CompanyKey) || 'arya',
            notes: '',
            expenses: Object.fromEntries(expenseCols.map((c) => [c.key, 0])),
          });
          notifyAdminChange({
            action: 'create',
            module: 'foreign-arrivals',
            moduleFa: 'وارده خارجی',
            moduleEn: 'Foreign arrivals',
            entityLabelFa: 'وارده',
            entityLabelEn: 'Arrival',
            entityName: number,
            detailsFa: `تاریخ سند: ${jalaliFromIso(dateIso)}`,
            detailsEn: `Document date: ${dateIso}`,
          });
        }}
      />

      <Dialog
        open={colOpen}
        onClose={() => setColOpen(false)}
        title={tx('افزودن ستون مصرف', 'Add expense column')}
        description={tx(
          'مثلاً: بیمه، تلکس، خدمات بندری — برای همه وارده‌ها ستون جدید ساخته می‌شود.',
          'e.g. insurance, telex, port services — applies to all arrivals.'
        )}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setColOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={addExpenseColumn}>{t('save')}</Button>
          </>
        }
      >
        <Label>{tx('نام ستون مصرف', 'Expense column name')}</Label>
        <Input
          value={newColLabel}
          onChange={(e) => setNewColLabel(e.target.value)}
          placeholder={locale === 'en' ? 'e.g. Insurance' : 'مثلاً بیمه'}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {expenseCols.map((c) => (
            <Badge key={c.key} variant="muted">
              {c.label}
            </Badge>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={expenseEditId != null && !!editing}
        onClose={() => setExpenseEditId(null)}
        title={tx(
          `مصارف وارده ${editing?.number || ''}`,
          `Expenses · ${editing?.number || ''}`
        )}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setExpenseEditId(null)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                const values: Record<string, string> = {};
                for (const c of expenseCols) {
                  const el = document.getElementById(
                    `exp-${editing.id}-${c.key}`
                  ) as HTMLInputElement | null;
                  values[c.key] = el?.value || '0';
                }
                saveExpenses(editing.id, values);
              }}
            >
              {t('save')}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {expenseCols.map((c) => (
              <div key={c.key}>
                <Label>{c.label}</Label>
                <Input
                  id={`exp-${editing.id}-${c.key}`}
                  type="number"
                  dir="ltr"
                  className="text-left"
                  defaultValue={String(Number(editing.expenses?.[c.key]) || 0)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
