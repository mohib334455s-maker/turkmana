'use client';

import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/store';
import {
  PURCHASE_STATUS_META,
  type PurchaseStatus,
} from '@/lib/purchase-flow';

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus | string }) {
  const { locale } = useI18n();
  const meta = PURCHASE_STATUS_META[status as PurchaseStatus];
  if (!meta) {
    return <Badge variant="muted">{status}</Badge>;
  }
  return (
    <Badge variant={meta.variant}>{locale === 'en' ? meta.en : meta.fa}</Badge>
  );
}

export function useCompanyName() {
  const { t } = useI18n();
  return (company: string) => {
    if (company === 'arya') return t('companyArya');
    if (company === 'turkmen') return t('companyTurkmen');
    return company;
  };
}
