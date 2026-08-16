'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { ModuleIcon } from '@/components/shared/module-icon';
import { useI18n } from '@/lib/i18n/store';
import { modulePrimaryHref, type NavModule } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function OpsModuleCard({ mod }: { mod: NavModule }) {
  const { tn } = useI18n();
  const [open, setOpen] = useState(false);
  const children = mod.children ?? [];
  const hasChildren = children.length > 0;
  const href = modulePrimaryHref(mod);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white outline-none">
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full flex-1 flex-col p-5 text-start outline-none focus:outline-none focus-visible:outline-none"
          aria-expanded={open}
        >
          <div className="flex items-start justify-between gap-3">
            <ModuleIcon icon={mod.icon} moduleKey={mod.key} size="md" />
            <ChevronDown
              className={cn(
                'mt-1 h-4 w-4 shrink-0 text-slate-400 transition',
                open && 'rotate-180 text-teal-600'
              )}
            />
          </div>
          <p className="mt-3.5 text-[15px] font-extrabold text-slate-900">{tn(mod.key)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{tn(mod.descKey)}</p>
        </button>
      ) : (
        <Link href={href} className="flex flex-1 flex-col p-5 outline-none focus:outline-none">
          <ModuleIcon icon={mod.icon} moduleKey={mod.key} size="md" />
          <p className="mt-3.5 text-[15px] font-extrabold text-slate-900">{tn(mod.key)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{tn(mod.descKey)}</p>
        </Link>
      )}

      {hasChildren && open ? (
        <ul className="mx-5 mb-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="flex items-center justify-between gap-2 px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none hover:bg-slate-50 focus:outline-none"
              >
                <span>{tn(child.key)}</span>
                <ChevronLeft className="h-3.5 w-3.5 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
