'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { JournalEntry } from '@/lib/demo-data';
import {
  formatJournalValue,
  journalMatchesLink,
  JOURNAL_OP_LABELS,
  resolveJournalLinks,
  type JournalLinks,
} from '@/lib/journal';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];

export function JournalLinkChips({ links }: { links?: JournalLinks | Record<string, number | boolean> }) {
  const { locale } = useI18n();
  const chips = resolveJournalLinks(links as JournalLinks | undefined);
  if (!chips.length) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((c) => (
        <Link
          key={c.href + c.labelFa}
          href={c.href}
          className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 hover:underline"
        >
          {locale === 'en' ? c.labelEn : c.labelFa}
        </Link>
      ))}
    </div>
  );
}

export function RelatedJournal({
  filter,
  titleFa = 'روزنامچه مرتبط',
  titleEn = 'Linked journal',
}: {
  filter: Partial<JournalLinks>;
  titleFa?: string;
  titleEn?: string;
}) {
  const { tx } = useI18n();
  const items = useOpsStore((s) => (s.lists.journal ?? EMPTY) as unknown as JournalEntry[]);
  const rows = items.filter((r) => journalMatchesLink(r.links as JournalLinks | undefined, filter));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{tx(titleFa, titleEn)}</CardTitle>
        <Link href="/dashboard/journal" className="text-xs text-[var(--brand)] hover:underline">
          {tx('دفتر روزنامچه', 'Open journal')}
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            {tx('هنوز سند روزنامچه‌ای به این حساب وصل نشده است.', 'No journal lines linked here yet.')}
          </p>
        ) : (
          rows.slice(0, 12).map((row) => {
            const qty = formatJournalValue({
              qty: row.qty ?? 0,
              unit: row.unit || 'تن',
              amount: row.amount,
              currency: row.currency || 'USD',
            });
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{row.details || '—'}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {row.dateJalali} · {row.giver} → {row.receiver}
                  </p>
                  <div className="mt-1">
                    <JournalLinkChips links={row.links} />
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-semibold num text-slate-900">
                    {qty || formatCurrency(row.amount, row.currency || 'USD')}
                  </p>
                  <Badge variant="muted" className="mt-1">
                    {JOURNAL_OP_LABELS[row.opType]?.fa ?? row.opType}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
