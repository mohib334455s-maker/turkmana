'use client';

import {
  Bell,
  CheckCheck,
  Info,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuleIcon } from '@/components/shared/module-icon';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import {
  unreadActivityCount,
  useActivityStore,
  type ActivityAction,
  type ActivityNote,
} from '@/lib/activity-store';
import { useI18n } from '@/lib/i18n/store';
import { canManageUsers, useAuthStore } from '@/lib/auth-store';

function actionMeta(action: ActivityAction, locale: 'fa' | 'en') {
  const map = {
    create: {
      fa: 'افزودن',
      en: 'Created',
      icon: Plus,
      variant: 'success' as const,
    },
    update: {
      fa: 'ویرایش',
      en: 'Updated',
      icon: Pencil,
      variant: 'info' as const,
    },
    delete: {
      fa: 'حذف',
      en: 'Deleted',
      icon: Trash2,
      variant: 'danger' as const,
    },
    txn: {
      fa: 'تراکنش',
      en: 'Transaction',
      icon: Wallet,
      variant: 'warning' as const,
    },
  };
  const m = map[action];
  return { ...m, label: locale === 'en' ? m.en : m.fa };
}

function formatWhen(iso: string, locale: 'fa' | 'en') {
  try {
    return new Date(iso).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-GB');
  } catch {
    return iso;
  }
}

function noteTitle(n: ActivityNote, locale: 'fa' | 'en') {
  const action = actionMeta(n.action, locale).label;
  const entity = locale === 'en' ? n.entityLabelEn : n.entityLabelFa;
  const module = locale === 'en' ? n.moduleEn : n.moduleFa;
  return locale === 'en'
    ? `${action}: ${entity} «${n.entityName}» · ${module}`
    : `${action}: ${entity} «${n.entityName}» · ${module}`;
}

function noteBody(n: ActivityNote, locale: 'fa' | 'en') {
  const details = locale === 'en' ? n.detailsEn : n.detailsFa;
  const who =
    locale === 'en'
      ? `By ${n.userName}${n.userEmail ? ` (${n.userEmail})` : ''} · role: ${n.userRole}`
      : `توسط ${n.userName}${n.userEmail ? ` (${n.userEmail})` : ''} · نقش: ${n.userRole}`;
  return details ? `${who}\n${details}` : who;
}

export default function NotificationsPage() {
  const { t, locale, tx } = useI18n();
  const role = useAuthStore((s) => s.role);
  const items = useActivityStore((s) => s.items);
  const markRead = useActivityStore((s) => s.markRead);
  const markAllRead = useActivityStore((s) => s.markAllRead);
  const clear = useActivityStore((s) => s.clear);
  const unread = unreadActivityCount(items);
  const isAdmin = canManageUsers(role);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('notificationsTitle')}
        description={t('notificationsDesc')}
        actions={
          <>
            <ExportButtons
              filename="notifications"
              title={t('notificationsTitle')}
              columns={[
                { key: 'title', label: tx('عنوان', 'Title') },
                { key: 'body', label: tx('شرح', 'Details') },
                { key: 'user', label: tx('کاربر', 'User') },
                { key: 'time', label: tx('زمان', 'Time') },
                { key: 'read', label: tx('خوانده‌شده', 'Read') },
              ]}
              rows={items.map((n) => ({
                title: noteTitle(n, locale),
                body: noteBody(n, locale),
                user: n.userName,
                time: formatWhen(n.createdAt, locale),
                read: n.read ? tx('بله', 'Yes') : tx('خیر', 'No'),
              }))}
            />
            <Button variant="outline" disabled={unread === 0} onClick={() => markAllRead()}>
              <CheckCheck className="ms-2 h-4 w-4" />
              {t('markAllRead')}
              {unread ? ` (${unread})` : ''}
            </Button>
            {isAdmin ? (
              <Button variant="outline" disabled={items.length === 0} onClick={() => clear()}>
                {tx('پاک کردن همه', 'Clear all')}
              </Button>
            ) : null}
          </>
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ModuleIcon icon={Bell} moduleKey="notifications" size="lg" />
            <p className="text-base font-semibold text-slate-800">{t('noNotifications')}</p>
            <p className="max-w-lg text-sm leading-6 text-slate-500">
              {tx(
                'وقتی کاربری معامله‌ای ثبت، ویرایش یا حذف کند، نام او، نقش، بخش و زمان اینجا برای ادمین نشان داده می‌شود. از آیکن زنگوله در هدر هم می‌توانید وارد شوید.',
                'When a user creates, edits or deletes a transaction, their name, role, module and time appear here for the admin. Open via the bell icon in the header.'
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const meta = actionMeta(n.action, locale);
            const Icon =
              n.action === 'delete'
                ? Trash2
                : n.action === 'create'
                  ? Plus
                  : n.action === 'txn'
                    ? Wallet
                    : n.action === 'update'
                      ? Pencil
                      : Info;
            return (
              <Card
                key={n.id}
                className={n.read ? 'opacity-75' : 'ring-1 ring-teal-200'}
                onClick={() => {
                  if (!n.read) markRead(n.id);
                }}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-teal-700">
                    {n.action === 'delete' ? (
                      <TriangleAlert className="h-5 w-5 text-rose-600" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{noteTitle(n, locale)}</p>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      <Badge variant="muted">{n.userName}</Badge>
                      {!n.read ? <Badge variant="info">{tx('جدید', 'New')}</Badge> : null}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                      {noteBody(n, locale)}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 num">
                      {formatWhen(n.createdAt, locale)}
                      {n.userEmail ? ` · ${n.userEmail}` : ''}
                      {n.userRole ? ` · ${n.userRole}` : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
