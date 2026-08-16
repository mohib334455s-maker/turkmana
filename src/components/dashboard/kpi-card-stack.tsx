'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KpiCardItem = {
  title: string;
  value: string;
  change: string;
  up: boolean;
  icon: LucideIcon;
  /** Full card surface: gradient + border */
  accent: string;
  /** Active pagination dot color */
  indicator: string;
};

type Props = {
  items: KpiCardItem[];
  variant?: 'mobile' | 'embedded';
};

const STORAGE_KEY = 'turkmen-kpi-stack-front';
const LAYER_MOBILE = 12;
const LAYER_EMBEDDED = 10;
const CARD_H_MOBILE = 176;
const CARD_H_EMBEDDED = 208;

export function KpiCardStack({ items, variant = 'mobile' }: Props) {
  const embedded = variant === 'embedded';
  const LAYER = embedded ? LAYER_EMBEDDED : LAYER_MOBILE;
  const CARD_H = embedded ? CARD_H_EMBEDDED : CARD_H_MOBILE;
  const [front, setFront] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    try {
      const prev = Number(window.sessionStorage.getItem(STORAGE_KEY) ?? '-1');
      const next = Number.isFinite(prev) ? (prev + 1) % items.length : 0;
      window.sessionStorage.setItem(STORAGE_KEY, String(next));
      setFront(next);
    } catch {
      setFront(0);
    }
  }, [items.length]);

  const cycle = useCallback(() => {
    if (leaving || items.length < 2) return;
    setLeaving(true);
    window.setTimeout(() => {
      setFront((i) => {
        const next = (i + 1) % items.length;
        try {
          window.sessionStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      setLeaving(false);
    }, 220);
  }, [items.length, leaving]);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 28 || Math.abs(dx) < 6) cycle();
  };

  const stackH = CARD_H + (items.length - 1) * LAYER;

  return (
    <div
      className={cn(
        'w-full',
        embedded ? 'flex min-h-0 flex-1 flex-col justify-end' : 'mx-auto max-w-lg'
      )}
    >
      <div
        className={cn(
          'relative cursor-pointer select-none outline-none focus:outline-none',
          embedded && 'flex-1'
        )}
        style={{ height: embedded ? Math.max(stackH, CARD_H + LAYER * 2) : stackH }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cycle();
          }
        }}
        aria-label="کارت بعدی"
      >
        {items.map((item, i) => {
          const depth = (i - front + items.length) % items.length;
          const Icon = item.icon;
          const Trend = item.up ? ArrowUpRight : ArrowDownRight;
          const isFront = depth === 0;

          return (
            <article
              key={item.title}
              className={cn(
                'absolute inset-x-0 overflow-hidden rounded-[22px] border outline-none transition-all duration-200',
                item.accent,
                embedded ? 'bottom-0 top-auto' : 'top-0',
                isFront && leaving && 'pointer-events-none opacity-0 -translate-x-16 scale-95'
              )}
              style={{
                zIndex: items.length - depth,
                height: CARD_H,
                transform:
                  isFront && leaving
                    ? undefined
                    : embedded
                      ? `translateY(${-depth * LAYER}px) scale(${1 - depth * 0.018})`
                      : `translateY(${depth * LAYER}px) scale(${1 - depth * 0.018})`,
                opacity: isFront && leaving ? undefined : 1 - depth * 0.08,
              }}
            >
              <div
                className={cn(
                  'flex h-full flex-col',
                  embedded ? 'px-5 py-4 sm:px-6 sm:py-5' : 'px-6 py-5'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      'font-semibold text-white/85',
                      embedded ? 'text-sm sm:text-[15px]' : 'text-[15px]'
                    )}
                  >
                    {item.title}
                  </p>
                  <span
                    className={cn(
                      'flex shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/10',
                      embedded ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-11 w-11'
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.7} />
                  </span>
                </div>
                <p
                  className={cn(
                    'mt-3 font-extrabold tracking-tight text-white num leading-none sm:mt-4',
                    embedded ? 'text-[28px] sm:text-[32px]' : 'text-[34px]'
                  )}
                >
                  {item.value}
                </p>
                <div
                  className={cn(
                    'mt-auto flex flex-wrap items-center gap-1.5 font-semibold',
                    embedded ? 'text-xs sm:text-[13px]' : 'text-[13px]',
                    item.up ? 'text-emerald-200' : 'text-rose-200'
                  )}
                >
                  <Trend className="h-4 w-4" />
                  <span>{item.change}</span>
                  <span className="font-normal text-white/50">نسبت به ماه قبل</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className={cn('flex items-center justify-center gap-1.5', embedded ? 'mt-4 shrink-0' : 'mt-5')}>
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            aria-label={item.title}
            onClick={() => setFront(i)}
            className={cn(
              'h-1.5 rounded-full outline-none transition-all focus:outline-none',
              i === front ? cn('w-5', item.indicator) : 'w-1.5 bg-slate-300'
            )}
          />
        ))}
      </div>
    </div>
  );
}
