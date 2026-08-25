'use client';

import Image from 'next/image';
import {
  ARYA_LOGO_SRC,
  TURKMEN_LOGO_SRC,
  companyBrandName,
  type BrandCompany,
} from '@/lib/brand';
import { useI18n } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<Size, { box: string; text: string }> = {
  sm: { box: 'h-10 w-10', text: 'text-xs' },
  md: { box: 'h-12 w-12', text: 'text-sm' },
  lg: { box: 'h-16 w-16', text: 'text-base' },
  xl: { box: 'h-[5.5rem] w-[5.5rem]', text: 'text-lg' },
};

const ARYA_SIZE: Record<Size, string> = {
  sm: 'h-10 w-[4.5rem]',
  md: 'h-12 w-28',
  lg: 'h-16 w-36',
  xl: 'h-[5.5rem] w-[11rem]',
};

function LogoImage({
  src,
  alt,
  box,
  dark,
}: {
  src: string;
  alt: string;
  box: string;
  dark?: boolean;
}) {
  return (
    <div className={cn('relative shrink-0', box)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-contain object-center',
          dark ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]' : 'drop-shadow-sm'
        )}
        sizes="160px"
        priority
      />
    </div>
  );
}

/**
 * Company brand mark — transparent official logos, no added background.
 */
export function CompanyLogo({
  company,
  size = 'md',
  showName = false,
  className,
  dark = false,
}: {
  company?: BrandCompany | null;
  size?: Size;
  showName?: boolean;
  className?: string;
  dark?: boolean;
}) {
  const { locale } = useI18n();
  const s = SIZE[size];
  const resolved =
    company === 'arya' || company === 'turkmen' ? company : null;
  const name = companyBrandName(resolved, locale);

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {resolved === 'arya' ? (
        <LogoImage
          src={ARYA_LOGO_SRC}
          alt={locale === 'en' ? 'Azya Aria LTD' : 'آزیا آریا لمتید'}
          box={ARYA_SIZE[size]}
          dark={dark}
        />
      ) : resolved === 'turkmen' ? (
        <LogoImage
          src={TURKMEN_LOGO_SRC}
          alt={locale === 'en' ? 'Turkmen Petroleum Company' : 'ترکمن پطرولیم'}
          box={s.box}
          dark={dark}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 font-extrabold text-white shadow-sm',
            size === 'sm' && 'h-10 min-w-10 px-2 text-xs',
            size === 'md' && 'h-12 min-w-12 px-3 text-sm',
            size === 'lg' && 'h-16 min-w-16 px-4 text-base',
            size === 'xl' && 'h-20 min-w-20 px-5 text-lg'
          )}
        >
          ERP
        </div>
      )}
      {showName ? (
        <span
          className={cn(
            'font-extrabold tracking-tight',
            s.text,
            dark ? 'text-white' : 'text-slate-900'
          )}
        >
          {name}
        </span>
      ) : null}
    </div>
  );
}

/** Branded header strip for cards / detail pages */
export function BrandDocumentHeader({
  company,
  title,
  subtitle,
  actions,
}: {
  company?: BrandCompany | null;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const resolved =
    company === 'arya' || company === 'turkmen' ? company : 'turkmen';
  const turkmen = resolved === 'turkmen';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border shadow-sm',
        turkmen ? 'border-emerald-800/30' : 'border-sky-200/60'
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-4 px-5 py-4',
          turkmen
            ? 'bg-gradient-to-l from-black via-slate-950 to-emerald-950'
            : 'bg-gradient-to-l from-sky-700 via-blue-800 to-slate-900'
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          <CompanyLogo company={resolved} size="lg" dark />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-white sm:text-xl">{title}</p>
            {subtitle ? (
              <p className="mt-0.5 truncate text-sm text-white/75">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
