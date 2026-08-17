'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { emptyContract, useOpsStore } from '@/lib/ops-store';
import type { CompanyKey } from '@/lib/demo-data';

export default function NewContractPage() {
  const router = useRouter();
  const addContract = useOpsStore((s) => s.addContract);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    supplier: '',
    product: 'دیزل',
    location: '',
    qty: '',
    unitPrice: '',
    company: 'arya',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const qty = Number(form.qty || 0);
    addContract({
      ...emptyContract(form.company as CompanyKey),
      number: form.code.trim(),
      supplierName: form.supplier.trim(),
      product: form.product,
      totalQty: qty,
      sellable: qty,
      pricePerUnit: Number(form.unitPrice || 0),
      location: form.location.trim(),
      company: form.company as CompanyKey,
    });
    router.push('/dashboard/contracts');
  };

  return (
    <div className="flex min-h-[70vh] items-start justify-center py-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">قرارداد جدید</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/contracts')}>
            <ArrowRight className="ml-1 h-4 w-4" />
            بازگشت
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>شماره قرارداد *</Label>
              <Input required value={form.code} onChange={(e) => set('code', e.target.value)} dir="ltr" className="text-left" />
            </div>
            <div className="sm:col-span-2">
              <Label>تأمین‌کننده *</Label>
              <Input required value={form.supplier} onChange={(e) => set('supplier', e.target.value)} />
            </div>
            <div>
              <Label>نوع کالا</Label>
              <Select value={form.product} onChange={(e) => set('product', e.target.value)}>
                <option>دیزل</option>
                <option>پطرول</option>
                <option>پطرول ۹۲</option>
                <option>گاز</option>
                <option>LPG</option>
              </Select>
            </div>
            <div>
              <Label>شرکت</Label>
              <Select value={form.company} onChange={(e) => set('company', e.target.value)}>
                <option value="arya">آریا</option>
                <option value="turkmen">ترکمن</option>
              </Select>
            </div>
            <div>
              <Label>مقدار (تن) *</Label>
              <Input required type="number" value={form.qty} onChange={(e) => set('qty', e.target.value)} dir="ltr" className="text-left" />
            </div>
            <div>
              <Label>قیمت واحد</Label>
              <Input type="number" value={form.unitPrice} onChange={(e) => set('unitPrice', e.target.value)} dir="ltr" className="text-left" />
            </div>
            <div className="sm:col-span-2">
              <Label>محل</Label>
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/contracts')}>
                انصراف
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                ثبت قرارداد
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
