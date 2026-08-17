'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { ExportButtons } from '@/components/shared/export-buttons';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { useCompanyStore } from '@/lib/company-store';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { StackLabel } from '@/components/shared/bi-label';
import { cn } from '@/lib/utils';

function bi(label: string, locale: string) {
  if (!label.includes('|')) return label;
  const [fa, en] = label.split('|');
  return locale === 'en' ? en || fa : fa;
}

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  /** Show in main table */
  list?: boolean;
  /** Include in search */
  search?: boolean;
  /** Format as money-like number in list */
  money?: boolean;
  placeholder?: string;
};

export type StatusMeta = {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
};

export type CrudRow = Record<string, string | number | boolean | null | undefined>;

export type CrudModuleConfig = {
  title: string;
  description?: string;
  entityName: string;
  fields: FieldDef[];
  initialRows: CrudRow[];
  idKey?: string;
  statusKey?: string;
  statusMap?: Record<string, StatusMeta>;
  companyKey?: string;
  showCompanySwitcher?: boolean;
};

function emptyForm(fields: FieldDef[]): CrudRow {
  const row: CrudRow = {};
  for (const f of fields) {
    row[f.key] = f.type === 'number' ? '' : f.options?.[0]?.value ?? '';
  }
  return row;
}

function formatCell(field: FieldDef, value: CrudRow[string]) {
  if (value === null || value === undefined || value === '') return '—';
  if (field.money && typeof value === 'number') {
    return new Intl.NumberFormat('en-US').format(value);
  }
  if (field.type === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(value);
  }
  return String(value);
}

export function CrudPage({
  title,
  description,
  entityName,
  fields,
  initialRows,
  idKey = 'id',
  statusKey = 'status',
  statusMap,
  companyKey = 'company',
  showCompanySwitcher = true,
}: CrudModuleConfig) {
  const { company } = useCompanyStore();
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const persistKey = `crud:${entityName}`;
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = useOpsStore.getState().getCrud(persistKey);
    setRows(saved ?? []);
    setHydrated(true);
  }, [persistKey]);

  useEffect(() => {
    if (!hydrated) return;
    useOpsStore.getState().setCrud(persistKey, rows);
  }, [hydrated, persistKey, rows]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [draft, setDraft] = useState<CrudRow>(() => emptyForm(fields));
  const [active, setActive] = useState<CrudRow | null>(null);

  const listFields = fields.filter((f) => f.list !== false);
  const searchKeys = fields.filter((f) => f.search !== false).map((f) => f.key);

  const filtered = useMemo(() => {
    let list = rows;
    if (showCompanySwitcher && company !== 'both') {
      list = list.filter((r) => {
        const c = r[companyKey];
        if (c === undefined || c === null || c === '' || c === 'both') return true;
        return c === company;
      });
    }
    const q = query.trim().toLowerCase();
    if (statusFilter !== 'all') {
      list = list.filter((r) => String(r[statusKey] ?? '') === statusFilter);
    }
    if (!q) return list;
    return list.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
    );
  }, [rows, query, company, showCompanySwitcher, companyKey, searchKeys, statusFilter, statusKey]);

  const openCreate = () => {
    setMode('create');
    setDraft(emptyForm(fields));
    setFormOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('new') === '1') openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const openEdit = (row: CrudRow) => {
    setMode('edit');
    setActive(row);
    setDraft({ ...row });
    setFormOpen(true);
  };

  const openDetail = (row: CrudRow) => {
    setActive(row);
    setDetailOpen(true);
  };

  const openDelete = (row: CrudRow) => {
    setActive(row);
    setDeleteOpen(true);
  };

  const saveForm = () => {
    for (const f of fields) {
      if (f.required && (draft[f.key] === '' || draft[f.key] === undefined || draft[f.key] === null)) {
        return;
      }
    }

    if (mode === 'create') {
      const nextId =
        rows.reduce((max, r) => Math.max(max, Number(r[idKey]) || 0), 0) + 1;
      setRows((prev) => [{ ...draft, [idKey]: nextId }, ...prev]);
    } else if (active) {
      setRows((prev) =>
        prev.map((r) =>
          r[idKey] === active[idKey] ? { ...draft, [idKey]: active[idKey] } : r
        )
      );
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!active) return;
    setRows((prev) => prev.filter((r) => r[idKey] !== active[idKey]));
    setDeleteOpen(false);
    setActive(null);
  };

  const setField = (key: string, value: string, type?: FieldType) => {
    setDraft((prev) => ({
      ...prev,
      [key]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const exportColumns = listFields.map((f) => ({
    key: f.key,
    label: bi(f.label, locale),
  }));

  const exportRows = filtered.map((row) => {
    const out: CrudRow = {};
    listFields.forEach((f) => {
      out[f.key] = formatCell(f, row[f.key]);
    });
    return out;
  });

  const exportFilename = title
    .split('|')[0]
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={bi(title, locale)}
        description={description ? bi(description, locale) : undefined}
        actions={
          <>
            <ExportButtons
              filename={exportFilename || 'export'}
              title={bi(title, locale)}
              columns={exportColumns}
              rows={exportRows}
            />
            {showCompanySwitcher ? <CompanySwitcher /> : null}
            <Button onClick={openCreate}>
              <Plus className="ms-2 h-4 w-4" />
              {t('newEntity')} {bi(entityName, locale)}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500">{t('totalRecords')}</p>
            <p className="mt-1 text-2xl font-bold num">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500">{t('activeApproved')}</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 num">
              {
                filtered.filter((r) => {
                  const s = String(r[statusKey] ?? '');
                  return ['active', 'approved', 'completed', 'paid', 'delivered', 'فعال'].includes(s);
                }).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500">{t('pendingDraft')}</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 num">
              {
                filtered.filter((r) => {
                  const s = String(r[statusKey] ?? '');
                  return ['pending', 'draft', 'waiting', 'open', 'در انتظار', 'پیش‌نویس'].includes(s);
                }).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{bi(entityName, locale)}</CardTitle>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                className="pe-9 h-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {statusMap ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="lg:hidden"
                onClick={() => setFilterOpen(true)}
                title={locale === 'fa' ? 'فیلتر' : 'Filter'}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                {listFields.map((f) => (
                  <TableHead key={f.key}>
                    <StackLabel label={f.label} />
                  </TableHead>
                ))}
                <TableHead className="w-[140px] text-center">
                  {locale === 'fa' ? 'عملیات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={listFields.length + 1}
                    className="text-center text-slate-500 py-10"
                  >
                    {t('noRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={String(row[idKey])}>
                    {listFields.map((f) => {
                      const value = row[f.key];
                      if (f.key === statusKey && statusMap && value != null) {
                        const meta = statusMap[String(value)];
                        return (
                          <TableCell key={f.key}>
                            <Badge variant={meta?.variant ?? 'muted'}>
                              {meta?.label ? bi(meta.label, locale) : String(value)}
                            </Badge>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={f.key}
                          className={cn(
                            (f.type === 'number' || f.money) && 'num'
                          )}
                        >
                          {formatCell(f, value)}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="flex items-center justify-center gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          title={t('details')}
                          onClick={() => openDetail(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={t('edit')}
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={t('delete')}
                          onClick={() => openDelete(row)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              filtered.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-slate-500">{t('noRecords')}</p>
              ) : (
                filtered.map((row) => {
                  const titleField = listFields[0];
                  const statusVal = row[statusKey];
                  const statusMeta =
                    statusMap && statusVal != null ? statusMap[String(statusVal)] : undefined;
                  const primary = listFields.filter((f) => f.key !== statusKey).slice(0, 4);
                  const rest = listFields.filter(
                    (f) => f.key !== statusKey && !primary.includes(f)
                  );
                  return (
                    <MobileRecordCard
                      key={String(row[idKey])}
                      title={formatCell(titleField, row[titleField.key])}
                      subtitle={bi(entityName, locale)}
                      badge={
                        statusMeta ? (
                          <Badge variant={statusMeta.variant}>
                            {bi(statusMeta.label, locale)}
                          </Badge>
                        ) : null
                      }
                      metrics={primary.slice(1).map((f) => ({
                        label: bi(f.label, locale),
                        value: (
                          <span className={cn((f.money || f.type === 'number') && 'num')}>
                            {formatCell(f, row[f.key])}
                          </span>
                        ),
                      }))}
                      extra={
                        rest.length
                          ? rest.map((f) => (
                              <ExtraRow
                                key={f.key}
                                label={bi(f.label, locale)}
                                value={formatCell(f, row[f.key])}
                              />
                            ))
                          : null
                      }
                      footer={
                        <>
                          <Button size="sm" variant="outline" onClick={() => openDetail(row)}>
                            {t('details')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                            {t('edit')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDelete(row)}>
                            {t('delete')}
                          </Button>
                        </>
                      }
                    />
                  );
                })
              )
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={
          mode === 'create'
            ? `${t('newEntity')} ${bi(entityName, locale)}`
            : `${t('edit')} ${bi(entityName, locale)}`
        }
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={saveForm}>{t('save')}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.key}
              className={f.type === 'textarea' ? 'sm:col-span-2' : undefined}
            >
              <Label htmlFor={`field-${f.key}`}>
                <StackLabel label={f.label} />
                {f.required ? <span className="text-red-500 mx-1">*</span> : null}
              </Label>
              {f.type === 'textarea' ? (
                <Textarea
                  id={`field-${f.key}`}
                  value={String(draft[f.key] ?? '')}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder ? bi(f.placeholder, locale) : undefined}
                />
              ) : f.type === 'select' ? (
                <Select
                  id={`field-${f.key}`}
                  value={String(draft[f.key] ?? '')}
                  onChange={(e) => setField(f.key, e.target.value)}
                >
                  {(f.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {bi(o.label, locale)}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={`field-${f.key}`}
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'text' : 'text'}
                  value={String(draft[f.key] ?? '')}
                  onChange={(e) => setField(f.key, e.target.value, f.type)}
                  placeholder={f.placeholder ? bi(f.placeholder, locale) : undefined}
                  dir={f.type === 'number' || f.key.toLowerCase().includes('phone') || f.key.toLowerCase().includes('email') || f.key.toLowerCase().includes('code') ? 'ltr' : undefined}
                  className={
                    f.type === 'number' || f.key.toLowerCase().includes('code')
                      ? 'text-left'
                      : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`${t('details')} ${bi(entityName, locale)}`}
        description={active ? String(active[fields[0]?.key] ?? '') : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {t('close')}
            </Button>
            {active ? (
              <Button
                onClick={() => {
                  setDetailOpen(false);
                  openEdit(active);
                }}
              >
                {t('edit')}
              </Button>
            ) : null}
          </>
        }
      >
        {active ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const value = active[f.key];
              let display = formatCell(f, value);
              if (f.key === statusKey && statusMap && value != null) {
                display = bi(statusMap[String(value)]?.label ?? String(value), locale);
              }
              return (
                <div
                  key={f.key}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <p className="text-xs text-slate-500">{bi(f.label, locale)}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 break-words">
                    {display}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`${t('delete')} ${bi(entityName, locale)}`}
        description={t('sessionOnly')}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('delete')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {t('confirmDelete')}
          {active ? (
            <span className="block mt-2 font-semibold text-slate-900">
              {String(active[fields.find((f) => f.list !== false)?.key ?? 'id'] ?? active[idKey])}
            </span>
          ) : null}
        </p>
      </Dialog>

      {statusMap ? (
        <BottomSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          title={locale === 'fa' ? 'فیلتر و وضعیت' : 'Filter & status'}
        >
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('all');
                setFilterOpen(false);
              }}
            >
              {locale === 'fa' ? 'همه' : 'All'}
            </Button>
            {Object.entries(statusMap).map(([value, meta]) => (
              <Button
                key={value}
                size="sm"
                variant={statusFilter === value ? 'default' : 'outline'}
                onClick={() => {
                  setStatusFilter(value);
                  setFilterOpen(false);
                }}
              >
                {bi(meta.label, locale)}
              </Button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}
