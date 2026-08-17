'use client';

import { useMemo, useState } from 'react';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import {
  EXPENSE_BOOKS,
  GOODS_EXPENSE_TYPES,
  type ExpenseBookCode,
} from '@/lib/expense-ledger';
import type { CompanyKey } from '@/lib/demo-data';
import { todayIso } from '@/lib/purchase-flow';
import { isContractOpenForExpenses, isPartyOpenForExpenses } from '@/lib/permissions';
import type { OpsRow } from '@/lib/ops-store';

const EMPTY_ROWS: OpsRow[] = [];

export function ExpenseEntryDialog({
  open,
  onClose,
  defaultBook,
  defaultAccountId,
}: {
  open: boolean;
  onClose: () => void;
  defaultBook?: ExpenseBookCode;
  defaultAccountId?: number;
}) {
  const { tx } = useI18n();
  const addExpenseEntry = useOpsStore((s) => s.addExpenseEntry);
  const accounts = useOpsStore((s) => s.expenseAccounts);
  const contracts = useOpsStore((s) => s.contracts);
  const parties = useOpsStore((s) => s.lists.parties ?? EMPTY_ROWS);
  const [book] = useState<ExpenseBookCode>(defaultBook ?? 'misc');

  const bookOptions = EXPENSE_BOOKS.map((b) => ({ value: b.code, label: b.fa }));
  const accountOptions = [
    { value: '', label: tx('بدون حساب اختصاصی', 'No dedicated account') },
    ...accounts.map((a) => ({ value: String(a.id), label: `${a.name}${a.code ? ` (${a.code})` : ''}` })),
  ];
  const typeOptions = GOODS_EXPENSE_TYPES.map((t) => ({ value: t, label: t }));
  const partyOptions = [
    { value: '', label: tx('بدون پارتی', 'No party') },
    ...parties
      .filter((p) => isPartyOpenForExpenses(String(p.status || 'active')))
      .map((p) => ({
        value: String(p.id),
        label: String(p.number || p.partyNumber || p.id),
      })),
  ];
  const contractOptions = [
    { value: '', label: tx('بدون قرارداد', 'No contract') },
    ...contracts
      .filter((c) => isContractOpenForExpenses(c.status))
      .map((c) => ({ value: String(c.id), label: c.number })),
  ];

  const fields = useMemo(
    () => [
      { key: 'book', label: tx('دفتر مصرف', 'Expense book'), type: 'select' as const, required: true, options: bookOptions },
      {
        key: 'accountId',
        label: tx('حساب مصرف جنس', 'Goods expense account'),
        type: 'select' as const,
        options: accountOptions,
      },
      { key: 'date', label: tx('تاریخ', 'Date'), type: 'date' as const, required: true },
      { key: 'expenseType', label: tx('نوعیت مصرف', 'Expense type'), type: 'select' as const, required: true, options: typeOptions },
      { key: 'counterparty', label: tx('طرف حساب', 'Counterparty'), required: true },
      { key: 'details', label: tx('تفصیلات', 'Details'), required: true },
      { key: 'productType', label: tx('نوعیت جنس', 'Goods type') },
      { key: 'productName', label: tx('اسم جنس', 'Item name') },
      { key: 'partyId', label: tx('پارتی', 'Party'), type: 'select' as const, options: partyOptions },
      { key: 'partyLabel', label: tx('شرح پارتی', 'Party label') },
      { key: 'contractId', label: tx('قرارداد', 'Contract'), type: 'select' as const, options: contractOptions },
      { key: 'location', label: tx('محل', 'Location') },
      { key: 'taken', label: tx('گرفت / پرداختی', 'Paid / taken'), type: 'number' as const },
      { key: 'given', label: tx('داد / دریافتی', 'Received / given'), type: 'number' as const },
      { key: 'litersPerBottle', label: tx('لیتر فی بوتل', 'Liters per bottle'), type: 'number' as const },
      { key: 'bottlesPerCarton', label: tx('بوتل فی کارتن', 'Bottles per carton'), type: 'number' as const },
      { key: 'notes', label: tx('ملاحظات', 'Notes') },
      {
        key: 'company',
        label: tx('شرکت', 'Company'),
        type: 'select' as const,
        options: [
          { value: 'arya', label: 'آریا' },
          { value: 'turkmen', label: 'ترکمن' },
        ],
      },
    ],
    [accountOptions, bookOptions, contractOptions, partyOptions, tx, typeOptions]
  );

  return (
    <CompactFormDialog
      open={open}
      onClose={onClose}
      title={tx('ثبت قلم مصرف', 'Record expense line')}
      description={tx(
        'هر پرداخت جداگانه ثبت می‌شود. قرارداد غیرفعال در لیست نیست و مفاد و ضررش بسته است.',
        'Each payment is its own line. Inactive contracts are locked and cannot receive new expenses.'
      )}
      size="xl"
      fields={fields}
      initial={{
        book,
        accountId: defaultAccountId ? String(defaultAccountId) : '',
        date: todayIso(),
        expenseType: 'ترانسپورت داخلی',
        taken: '',
        given: '',
        litersPerBottle: '0',
        bottlesPerCarton: '0',
        company: 'arya',
      }}
      onSubmit={(values) => {
        const partyId = Number(values.partyId || 0) || undefined;
        const party = parties.find((p) => Number(p.id) === partyId);
        const created = addExpenseEntry({
          book: (values.book as ExpenseBookCode) || book,
          accountId: Number(values.accountId || 0) || undefined,
          date: values.date,
          counterparty: values.counterparty,
          details: values.details,
          productType: values.productType || '',
          productName: values.productName || '',
          litersPerBottle: Number(values.litersPerBottle || 0),
          bottlesPerCarton: Number(values.bottlesPerCarton || 0),
          partyLabel:
            values.partyLabel ||
            (party ? String(party.number || party.partyNumber || '') : ''),
          partyId,
          contractId: Number(values.contractId || 0) || undefined,
          expenseType: values.expenseType,
          taken: Number(values.taken || 0),
          given: Number(values.given || 0),
          location: values.location || '',
          status: 'ok',
          notes: values.notes || '',
          company: (values.company as CompanyKey) || 'arya',
        });
        if (!created) {
          window.alert(
            tx(
              'ثبت رد شد — قرارداد یا پارتی غیرفعال است، یا پارتی موجودی فعال ندارد.',
              'Posting blocked — contract or party is inactive, or party has no active stock.'
            )
          );
        }
      }}
    />
  );
}

export function ExpenseAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { tx } = useI18n();
  const addExpenseAccount = useOpsStore((s) => s.addExpenseAccount);
  const contracts = useOpsStore((s) => s.contracts);

  return (
    <CompactFormDialog
      open={open}
      onClose={onClose}
      title={tx('حساب مصرف جنس', 'Goods expense account')}
      description={tx(
        'مثل «مصارف پطرول ۹۲ قرارداد B-035103» — بعداً پرداخت‌ها زیر همین حساب می‌آید.',
        'E.g. Petrol 92 expenses for contract B-035103. Payments are posted under this account.'
      )}
      fields={[
        { key: 'name', label: tx('طرف حساب / نام', 'Account name'), required: true },
        { key: 'code', label: tx('کد حساب', 'Account code') },
        { key: 'category', label: tx('کتگوری جنس', 'Product category'), required: true },
        { key: 'productName', label: tx('اسم جنس', 'Item name') },
        {
          key: 'contractId',
          label: tx('قرارداد', 'Contract'),
          type: 'select',
          options: [
            { value: '', label: tx('بدون قرارداد', 'No contract') },
            ...contracts
              .filter((c) => isContractOpenForExpenses(c.status))
              .map((c) => ({ value: String(c.id), label: `${c.number} — ${c.product}` })),
          ],
        },
        { key: 'notes', label: tx('ملاحظات', 'Notes') },
        {
          key: 'company',
          label: tx('شرکت', 'Company'),
          type: 'select',
          options: [
            { value: 'arya', label: 'آریا' },
            { value: 'turkmen', label: 'ترکمن' },
          ],
        },
      ]}
      initial={{ company: 'arya' }}
      onSubmit={(values) => {
        const contract = contracts.find((c) => c.id === Number(values.contractId || 0));
        if (contract && !isContractOpenForExpenses(contract.status)) return;
        addExpenseAccount({
          code: values.code || '',
          name: values.name,
          category: values.category,
          productCode: contract?.productCode || '',
          productName: values.productName || contract?.product || values.category,
          contractId: contract?.id,
          contractNumber: contract?.number || '',
          partyNumber: '',
          company: (values.company as CompanyKey) || 'arya',
          notes: values.notes || '',
        });
      }}
    />
  );
}
