'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shield, Wifi, Smartphone } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n/store';
import { navModules } from '@/lib/navigation';
import type { NavKey } from '@/lib/i18n/messages';
import type { CustomRole } from '@/lib/custom-roles-store';
import { DEFAULT_COMPANY_CIDRS } from '@/lib/network-access';
import { cn } from '@/lib/utils';

const EXTRA_PAGE_KEYS: NavKey[] = ['profitLoss', 'users', 'roles', 'executive', 'aging'];

export function RoleEditorDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: CustomRole | null;
  onSave: (values: Omit<CustomRole, 'createdAt'>) => void;
}) {
  const { tn, tx, t } = useI18n();
  const [name, setName] = useState('');
  const [moduleKeys, setModuleKeys] = useState<NavKey[]>([]);
  const [deniedChildren, setDeniedChildren] = useState<NavKey[]>([]);
  const [profitLoss, setProfitLoss] = useState(false);
  const [companyNetworkOnly, setCompanyNetworkOnly] = useState(false);
  const [blockMobile, setBlockMobile] = useState(false);
  const [allowedCidrs, setAllowedCidrs] = useState(DEFAULT_COMPANY_CIDRS.join(', '));

  const topModules = useMemo(
    () => navModules.filter((m) => m.key !== 'dashboard'),
    []
  );

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setModuleKeys(initial?.moduleKeys ?? ['dashboard', 'sales', 'customers']);
    setDeniedChildren(initial?.deniedChildren ?? []);
    setProfitLoss(initial?.profitLoss ?? false);
    setCompanyNetworkOnly(initial?.companyNetworkOnly ?? false);
    setBlockMobile(initial?.blockMobile ?? false);
    setAllowedCidrs((initial?.allowedCidrs ?? DEFAULT_COMPANY_CIDRS).join(', '));
  }, [open, initial]);

  const toggleModule = (key: NavKey) => {
    setModuleKeys((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]
    );
  };

  const toggleDenied = (key: NavKey) => {
    setDeniedChildren((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? '',
      name: name.trim(),
      moduleKeys: moduleKeys.includes('dashboard') ? moduleKeys : ['dashboard', ...moduleKeys],
      deniedChildren,
      profitLoss,
      companyNetworkOnly,
      blockMobile,
      allowedCidrs: allowedCidrs
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        initial
          ? tx('ویرایش نقش', 'Edit role')
          : tx('افزودن نقش جدید', 'Add new role')
      }
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <Label>{tx('نام نقش', 'Role name')}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tx('مثلاً: حسابدار گدام', 'e.g. Warehouse accountant')}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-slate-800">
            {tx('دسترسی به بخش‌ها', 'Section access')}
          </p>
          <p className="mb-3 text-xs text-slate-500">
            {tx(
              'بخش‌هایی که این نقش می‌تواند ببیند را علامت بزنید',
              'Check sections this role can access'
            )}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topModules.map((mod) => {
              const on = moduleKeys.includes(mod.key);
              return (
                <button
                  key={mod.key}
                  type="button"
                  onClick={() => toggleModule(mod.key)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-start text-sm font-semibold transition',
                    on
                      ? 'border-teal-300 bg-teal-50 text-teal-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  )}
                >
                  {tn(mod.key)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-slate-800">
            {tx('صفحات خاص (اختیاری)', 'Special pages (optional)')}
          </p>
          <div className="flex flex-wrap gap-2">
            {EXTRA_PAGE_KEYS.map((key) => {
              const denied = deniedChildren.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDenied(key)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-semibold',
                    denied
                      ? 'border-rose-200 bg-rose-50 text-rose-700 line-through'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  )}
                >
                  {tn(key)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {tx(
              'روی هر صفحه بزنید تا از این نقش پنهان شود',
              'Click a page to hide it from this role'
            )}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={profitLoss}
            onChange={(e) => setProfitLoss(e.target.checked)}
            className="rounded border-slate-300"
          />
          {tx('دسترسی مفاد و ضرر', 'Profit & loss access')}
        </label>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Shield className="h-4 w-4" />
            {tx('محدودیت شبکه و دستگاه', 'Network & device restrictions')}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={companyNetworkOnly}
              onChange={(e) => setCompanyNetworkOnly(e.target.checked)}
            />
            <Wifi className="h-4 w-4 text-teal-600" />
            {tx('فقط شبکه داخلی شرکت', 'Company internal network only')}
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={blockMobile}
              onChange={(e) => setBlockMobile(e.target.checked)}
            />
            <Smartphone className="h-4 w-4 text-rose-600" />
            {tx('ممنوعیت ورود از موبایل', 'Block mobile login')}
          </label>
          {companyNetworkOnly ? (
            <div className="mt-3">
              <Label>{tx('محدوده IP (CIDR)', 'Allowed IP ranges (CIDR)')}</Label>
              <Input
                value={allowedCidrs}
                onChange={(e) => setAllowedCidrs(e.target.value)}
                dir="ltr"
                className="mt-1 font-mono text-xs"
              />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t('save')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
