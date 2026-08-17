'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n/store';

export type CompactField = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
};

export function CompactFormDialog({
  open,
  onClose,
  title,
  description,
  fields,
  initial,
  submitLabel,
  onSubmit,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: CompactField[];
  initial?: Record<string, string>;
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const f of fields) {
      next[f.key] = initial?.[f.key] ?? f.options?.[0]?.value ?? '';
    }
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = () => {
    for (const f of fields) {
      if (f.required && !String(values[f.key] ?? '').trim()) return;
    }
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={save}>
            {submitLabel ?? t('save')}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={fields.length === 1 ? 'sm:col-span-2' : undefined}>
            <Label>
              {f.label}
              {f.required ? <span className="mx-1 text-red-500">*</span> : null}
            </Label>
            {f.type === 'select' ? (
              <Select
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
              >
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : f.type === 'checkbox' ? (
              <label className="mt-1 flex h-10 items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-700"
                  checked={values[f.key] === '1'}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, [f.key]: e.target.checked ? '1' : '' }))
                  }
                />
                {f.placeholder || f.label}
              </label>
            ) : (
              <Input
                required={f.required}
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                dir={f.dir ?? (f.type === 'number' || f.type === 'date' ? 'ltr' : undefined)}
                className={
                  f.type === 'number' || f.type === 'date' || f.dir === 'ltr' ? 'text-left' : undefined
                }
              />
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
