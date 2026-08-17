'use client';

import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { useI18n } from '@/lib/i18n/store';

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Construction className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{t('comingSoonTitle')}</h2>
          <p className="text-sm text-slate-500 max-w-md">{t('comingSoonBody')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
