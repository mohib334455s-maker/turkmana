'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { CompanySwitcher } from '@/components/layout/company-switcher';

export default function NewContractPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    supplier: '',
    product: 'دیزل',
    location: '',
    qty: '',
    unitPrice: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    company: 'arya',
    incoterm: 'CIF',
    notes: '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      router.push('/dashboard/contracts');
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ایجاد قرارداد"
        description="ثبت قرارداد خرید جدید با تأمین‌کننده"
        actions={
          <>
            <CompanySwitcher />
            <Button variant="outline" onClick={() => router.push('/dashboard/contracts')}>
              <ArrowRight className="ml-2 h-4 w-4" />
              بازگشت
            </Button>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">اطلاعات اصلی</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>شماره قرارداد *</Label>
              <Input required value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="CTR-2405" dir="ltr" className="text-left" />
            </div>
            <div>
              <Label>تأمین‌کننده *</Label>
              <Input required value={form.supplier} onChange={(e) => set('supplier', e.target.value)} placeholder="ترکمن‌گاز" />
            </div>
            <div>
              <Label>نوع کالا *</Label>
              <Select value={form.product} onChange={(e) => set('product', e.target.value)}>
                <option>دیزل</option>
                <option>پترول</option>
                <option>پترول ۹۲</option>
                <option>گاز</option>
                <option>گاز مایع</option>
              </Select>
            </div>
            <div>
              <Label>محل قرارداد</Label>
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="ترکمن‌باشی / حیرتان" />
            </div>
            <div>
              <Label>مقدار (تن) *</Label>
              <Input required type="number" value={form.qty} onChange={(e) => set('qty', e.target.value)} dir="ltr" className="text-left" />
            </div>
            <div>
              <Label>قیمت واحد *</Label>
              <Input required type="number" value={form.unitPrice} onChange={(e) => set('unitPrice', e.target.value)} dir="ltr" className="text-left" />
            </div>
            <div>
              <Label>ارز</Label>
              <Select value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
                <option value="AFN">AFN</option>
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
              <Label>تاریخ شروع</Label>
              <Input value={form.startDate} onChange={(e) => set('startDate', e.target.value)} placeholder="1403/11/01" />
            </div>
            <div>
              <Label>تاریخ پایان</Label>
              <Input value={form.endDate} onChange={(e) => set('endDate', e.target.value)} placeholder="1404/11/01" />
            </div>
            <div>
              <Label>اینکوترمز</Label>
              <Select value={form.incoterm} onChange={(e) => set('incoterm', e.target.value)}>
                <option>CIF</option>
                <option>FOB</option>
                <option>CFR</option>
                <option>DAP</option>
                <option>EXW</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="شرایط خاص قرارداد..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/contracts')}>
            انصراف
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? 'در حال ذخیره...' : 'ذخیره قرارداد'}
          </Button>
        </div>
      </form>
    </div>
  );
}
