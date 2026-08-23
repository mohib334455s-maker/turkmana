'use client';

import { LocalizedCrud } from '@/components/shared/localized-crud';
import { BrandDocumentHeader } from '@/components/brand/company-logo';
import { modules } from '@/lib/modules/catalog';
import { useCompanyStore } from '@/lib/company-store';
import { useI18n } from '@/lib/i18n/store';

export default function Page() {
  const { company } = useCompanyStore();
  const { pick } = useI18n();

  return (
    <div className="space-y-6">
      <BrandDocumentHeader
        company={company}
        title={pick(modules.settingsProducts.title)}
        subtitle={pick(modules.settingsProducts.description)}
      />
      <LocalizedCrud {...modules.settingsProducts} />
    </div>
  );
}
