'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';

export type CompactField = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
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
  submitLabel = 'ذخیره',
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: CompactField[];
  initial?: Record<string, string>;
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const f of fields) {
      next[f.key] = initial?.[f.key] ?? f.options?.[0]?.value ?? '';
    }
    setValues(next);
  }, [open, fields, initial]);

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
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button type="button" onClick={save}>
            {submitLabel}
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
            ) : (
              <Input
                required={f.required}
                type={f.type === 'number' ? 'number' : 'text'}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                dir={f.dir ?? (f.type === 'number' ? 'ltr' : undefined)}
                className={f.type === 'number' || f.dir === 'ltr' ? 'text-left' : undefined}
              />
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
