'use client';

import type { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ModuleIcon } from '@/components/shared/module-icon';
import { getRouteModuleMeta } from '@/lib/route-module-meta';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
  className,
  icon,
  moduleKey,
  hideIcon,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  moduleKey?: string;
  hideIcon?: boolean;
}) {
  const pathname = usePathname();
  const meta = getRouteModuleMeta(pathname);
  const ResolvedIcon = icon ?? meta?.icon;
  const resolvedModuleKey = moduleKey ?? meta?.navKey;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {!hideIcon && ResolvedIcon ? (
            <ModuleIcon
              icon={ResolvedIcon}
              moduleKey={resolvedModuleKey}
              size="md"
              className="shrink-0"
            />
          ) : null}
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p
            className={cn(
              'mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500',
              !hideIcon && ResolvedIcon ? 'sm:ps-[3.25rem]' : ''
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:max-w-[min(100%,42rem)] sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
