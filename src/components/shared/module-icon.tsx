'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNavIconTheme } from '@/lib/nav-icon-theme';

type ModuleIconProps = {
  icon: LucideIcon;
  moduleKey?: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: { wrap: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  md: { wrap: 'h-10 w-10 rounded-xl', icon: 'h-[18px] w-[18px]' },
  lg: { wrap: 'h-12 w-12 rounded-xl', icon: 'h-5 w-5' },
};

export function ModuleIcon({
  icon: Icon,
  moduleKey,
  active,
  size = 'md',
  className,
}: ModuleIconProps) {
  const theme = getNavIconTheme(moduleKey);
  const s = sizes[size];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center border transition-colors',
        s.wrap,
        active
          ? cn(theme.activeIconBg, theme.activeIconBorder)
          : cn(theme.iconBg, theme.iconBorder),
        className
      )}
    >
      <Icon
        className={cn(s.icon, active ? theme.activeIconText : theme.iconText)}
        strokeWidth={1.65}
      />
    </span>
  );
}
