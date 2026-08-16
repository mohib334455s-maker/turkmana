import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Construction className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            آماده اتصال — فاز بعدی
          </h2>
          <p className="text-sm text-slate-500 max-w-md">
            این صفحه در ساختار منو قرار گرفته و پس از تکمیل هستهٔ عملیاتی با داده و
            API واقعی پر خواهد شد.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
