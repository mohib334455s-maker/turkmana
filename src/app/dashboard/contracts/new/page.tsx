'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — full create form lives on the contracts list. */
export default function NewContractPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/contracts?new=1');
  }, [router]);
  return (
    <p className="p-8 text-sm text-slate-500">در حال انتقال به فرم قرارداد…</p>
  );
}
