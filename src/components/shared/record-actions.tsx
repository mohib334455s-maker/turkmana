'use client';

import { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';

export type ActionField = {
  key: string;
  label: string;
  multiline?: boolean;
};

type Row = Record<string, unknown>;

export function RecordActions({
  row,
  fields,
  title,
  detailHref,
  onSave,
  onDelete,
  layout = 'icons',
}: {
  row: Row;
  fields: ActionField[];
  title: string;
  detailHref?: string;
  onSave?: (next: Row) => void;
  onDelete?: () => void;
  layout?: 'icons' | 'buttons';
}) {
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

  return (
    <>
      {layout === 'buttons' ? (
        <div className="flex flex-wrap items-center gap-2">
          {detailHref ? (
            <a href={detailHref}>
              <Button size="sm" variant="outline">
                مشاهده
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setDetailOpen(true)}>
              مشاهده
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={openEdit}>
            ویرایش
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteOpen(true)}>
            حذف
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-0.5">
          {detailHref ? (
            <a href={detailHref}>
              <Button size="icon" variant="ghost" title="جزئیات">
                <Eye className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              title="جزئیات"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" title="ویرایش" onClick={openEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="حذف"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`جزئیات ${title}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              بستن
            </Button>
            <Button
              onClick={() => {
                setDetailOpen(false);
                openEdit();
              }}
            >
              ویرایش
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
        title={`ویرایش ${title}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={() => {
                onSave?.(draft);
                setEditOpen(false);
              }}
            >
              ذخیره
            </Button>
          </>
        }
      >
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
        title={`حذف ${title}`}
        description="آیا از حذف این رکورد مطمئن هستید؟"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.();
                setDeleteOpen(false);
              }}
            >
              حذف
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          این تغییر فقط در جلسه جاری اعمال می‌شود.
        </p>
      </Dialog>
    </>
  );
}
