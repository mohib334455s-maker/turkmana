'use client';

import { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { notifyAdminChange } from '@/lib/activity-store';
import { useI18n } from '@/lib/i18n/store';

export type ActionField = {
  key: string;
  label: string;
  multiline?: boolean;
  /** text (default) | number | date (ISO yyyy-mm-dd) */
  type?: 'text' | 'number' | 'date';
};

type Row = Record<string, unknown>;

export type ActivityMeta = {
  module: string;
  moduleFa: string;
  moduleEn: string;
  entityLabelFa: string;
  entityLabelEn: string;
  entityName: string;
};

export function RecordActions({
  row,
  fields,
  title,
  detailHref,
  onSave,
  onDelete,
  layout = 'icons',
  activity,
}: {
  row: Row;
  fields: ActionField[];
  title: string;
  detailHref?: string;
  onSave?: (next: Row) => void;
  onDelete?: () => void;
  layout?: 'icons' | 'buttons';
  /** When set, create/update/delete is logged for admin notifications */
  activity?: ActivityMeta;
}) {
  const { t, tx } = useI18n();
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState<Row>({});

  const openEdit = () => {
    const next: Row = {};
    for (const f of fields) next[f.key] = row[f.key] ?? '';
    setDraft(next);
    setEditOpen(true);
  };

  const saveEdit = () => {
    onSave?.(draft);
    if (activity) {
      notifyAdminChange({
        action: 'update',
        module: activity.module,
        moduleFa: activity.moduleFa,
        moduleEn: activity.moduleEn,
        entityLabelFa: activity.entityLabelFa,
        entityLabelEn: activity.entityLabelEn,
        entityName: String(draft[activity.entityName] ?? activity.entityName ?? title),
        detailsFa: `ویرایش سند — تاریخ قابل تغییر توسط کاربر`,
        detailsEn: `Document edited — date can be set by user`,
      });
    }
    setEditOpen(false);
  };

  const confirmDelete = () => {
    onDelete?.();
    if (activity) {
      notifyAdminChange({
        action: 'delete',
        module: activity.module,
        moduleFa: activity.moduleFa,
        moduleEn: activity.moduleEn,
        entityLabelFa: activity.entityLabelFa,
        entityLabelEn: activity.entityLabelEn,
        entityName: String(row[activity.entityName] ?? activity.entityName ?? title),
      });
    }
    setDeleteOpen(false);
  };

  return (
    <>
      {layout === 'buttons' ? (
        <div className="flex flex-wrap items-center gap-2">
          {detailHref ? (
            <a href={detailHref}>
              <Button size="sm" variant="outline">
                {t('view')}
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setDetailOpen(true)}>
              {t('view')}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={openEdit}>
            {t('edit')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteOpen(true)}>
            {t('delete')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-0.5">
          {detailHref ? (
            <a href={detailHref}>
              <Button size="icon" variant="ghost" title={t('details')}>
                <Eye className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              title={t('details')}
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" title={t('edit')} onClick={openEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title={t('delete')}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`${t('details')} ${title}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {t('close')}
            </Button>
            <Button
              onClick={() => {
                setDetailOpen(false);
                openEdit();
              }}
            >
              {t('edit')}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.key}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-xs text-slate-500">{f.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 break-words">
                {String(row[f.key] ?? '—')}
              </p>
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`${t('edit')} ${title}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={saveEdit}>{t('save')}</Button>
          </>
        }
      >
        <p className="mb-3 text-xs leading-5 text-slate-500">
          {tx(
            'تاریخ سند را می‌توانید به هر تاریخ دلخواه تغییر دهید.',
            'You can set this document date to any date you need.'
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.multiline ? 'sm:col-span-2' : undefined}>
              <Label>{f.label}</Label>
              {f.multiline ? (
                <Textarea
                  value={String(draft[f.key] ?? '')}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              ) : (
                <Input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  dir={f.type === 'date' || f.type === 'number' ? 'ltr' : undefined}
                  className={f.type === 'date' || f.type === 'number' ? 'text-left' : undefined}
                  value={String(draft[f.key] ?? '')}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`${t('delete')} ${title}`}
        description={t('confirmDelete')}
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
        <p className="text-sm text-slate-600">{t('confirmDelete')}</p>
      </Dialog>
    </>
  );
}
