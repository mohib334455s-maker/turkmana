'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Info, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuleIcon } from '@/components/shared/module-icon';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { useI18n } from '@/lib/i18n/store';

type Note = {
  id: number;
  type: 'info' | 'warning' | 'danger';
  titleFa: string;
  titleEn: string;
  bodyFa: string;
  bodyEn: string;
  timeFa: string;
  timeEn: string;
  read: boolean;
};

const seed: Note[] = [];

export default function NotificationsPage() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Note[]>(seed);

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
                { key: 'title', label: 'عنوان' },
                { key: 'body', label: 'شرح' },
                { key: 'type', label: 'نوع' },
                { key: 'time', label: 'زمان' },
                { key: 'read', label: 'خوانده‌شده' },
              ]}
              rows={items.map((n) => ({
                title: locale === 'fa' ? n.titleFa : n.titleEn,
                body: locale === 'fa' ? n.bodyFa : n.bodyEn,
                type: n.type,
                time: locale === 'fa' ? n.timeFa : n.timeEn,
                read: n.read ? 'بله' : 'خیر',
              }))}
            />
            <Button
              variant="outline"
              disabled={items.length === 0}
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
            >
              <CheckCheck className="ms-2 h-4 w-4" />
              {t('markAllRead')}
            </Button>
          </>
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ModuleIcon icon={Bell} moduleKey="notifications" size="lg" />
            <p className="text-base font-semibold text-slate-800">{t('noNotifications')}</p>
            <p className="max-w-md text-sm text-slate-500">{t('noDataHint')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon =
              n.type === 'danger' ? TriangleAlert : n.type === 'warning' ? TriangleAlert : Info;
            return (
              <Card key={n.id} className={n.read ? 'opacity-70' : ''}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-teal-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {locale === 'fa' ? n.titleFa : n.titleEn}
                      </p>
                      {!n.read ? <Badge variant="info">New</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {locale === 'fa' ? n.bodyFa : n.bodyEn}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {locale === 'fa' ? n.timeFa : n.timeEn}
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
