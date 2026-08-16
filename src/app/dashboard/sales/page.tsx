'use client';

import { LocalizedCrud } from '@/components/shared/localized-crud';
import { modules } from '@/lib/modules/catalog';

export default function Page() {
  return <LocalizedCrud {...modules.salesOrders} />;
}
