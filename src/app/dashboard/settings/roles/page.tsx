'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleEditorDialog } from '@/components/settings/role-editor-dialog';
import { UserAccessCard } from '@/components/settings/user-access-panel';
import {
  syncRolesToServer,
  useCustomRolesStore,
  type CustomRole,
} from '@/lib/custom-roles-store';
import { useAuthStore } from '@/lib/auth-store';
import { moduleKeysForRole } from '@/lib/role-access';
import { useI18n } from '@/lib/i18n/store';

export default function RolesPage() {
  const { tx, locale } = useI18n();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'admin';
  const customRoles = useCustomRolesStore((s) => s.roles);
  const addRole = useCustomRolesStore((s) => s.addRole);
  const updateRole = useCustomRolesStore((s) => s.updateRole);
  const removeRole = useCustomRolesStore((s) => s.removeRole);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CustomRole | null>(null);

  useEffect(() => {
    if (isAdmin) void syncRolesToServer(customRoles);
  }, [customRoles, isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (r: CustomRole) => {
    setEditing(r);
    setEditorOpen(true);
  };

  const handleSave = (values: Omit<CustomRole, 'createdAt'>) => {
    if (editing) {
      updateRole(editing.id, values);
    } else {
      addRole(values);
    }
    void syncRolesToServer(useCustomRolesStore.getState().roles);
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center">
        <p className="font-bold text-rose-800">
          {tx('فقط ادمین می‌تواند نقش‌ها را مدیریت کند', 'Only admin can manage roles')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tx('نقش‌ها و دسترسی', 'Roles & access')}
        description={tx(
          'نام نقش را خودتان بگذارید و مشخص کنید به کدام بخش‌ها دسترسی دارد',
          'Name each role and choose which sections it can access'
        )}
        actions={
          <Button onClick={openCreate}>
            <Plus className="ms-2 h-4 w-4" />
            {tx('افزودن نقش', 'Add role')}
          </Button>
        }
      />

      <Card className="border-teal-200 bg-teal-50/40 shadow-none">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">{tx('نقش ادمین', 'Admin role')}</p>
            <p className="mt-1 text-sm text-slate-600">
              {tx(
                'تنها نقش ثابت سیستم — دسترسی کامل، مدیریت کاربران و نقش‌ها',
                'The only fixed system role — full access, users and roles management'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <UserAccessCard
        role="admin"
        companyAccess="both"
        title={tx('مدیر سیستم (ادمین)', 'System admin')}
        compact
      />

      <section>
        <h2 className="text-base font-extrabold text-slate-900">
          {tx('نقش‌های سفارشی', 'Custom roles')} ({customRoles.length})
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tx(
            'هر نقش: بخش‌های مجاز، مفاد و ضرر، محدودیت IP و موبایل',
            'Each role: allowed sections, P&L, IP and mobile restrictions'
          )}
        </p>

        {customRoles.length === 0 ? (
          <Card className="mt-4 rounded-2xl border-dashed border-slate-200 shadow-none">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-slate-500">
                {tx('هنوز نقش سفارشی نساخته‌اید', 'No custom roles yet')}
              </p>
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="ms-2 h-4 w-4" />
                {tx('اولین نقش', 'First role')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {customRoles.map((r) => (
              <Card key={r.id} className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-extrabold text-slate-900">{r.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400 num">{r.id}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => {
                          if (window.confirm(tx('حذف این نقش؟', 'Delete this role?'))) {
                            removeRole(r.id);
                            void syncRolesToServer(useCustomRolesStore.getState().roles);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {moduleKeysForRole(r.id, customRoles)
                      .slice(0, 6)
                      .map((k) => (
                        <Badge key={k} variant="muted">
                          {k}
                        </Badge>
                      ))}
                    {moduleKeysForRole(r.id, customRoles).length > 6 ? (
                      <span className="text-[10px] text-slate-400">
                        +{moduleKeysForRole(r.id, customRoles).length - 6}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {r.profitLoss ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                        P&L
                      </span>
                    ) : null}
                    {r.companyNetworkOnly ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 font-bold text-sky-800">
                        {tx('فقط شبکه شرکت', 'LAN only')}
                      </span>
                    ) : null}
                    {r.blockMobile ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                        {tx('بدون موبایل', 'No mobile')}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <RoleEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
}
