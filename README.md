# Turkman ERP

سیستم عملیاتی بازرگانی نفت و کالا (آریا / ترکمن) — Next.js + PostgreSQL.

## ورود

| نام کاربری | رمز | شرکت |
|------------|-----|------|
| `turkman` | `aria1234` | هر دو شرکت (آریا و ترکمن) |

## اجرای محلی

```bash
npm install
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

باز کنید: http://localhost:3000

برای کار بدون دیتابیس در `.env` بگذارید: `DEMO_AUTH=true`

## استقرار روی Vercel

1. ریپو را به Vercel وصل کنید (Import Git Repository).
2. Framework: **Next.js** — دستور ساخت پیش‌فرض کافی است.
3. Environment Variables:

| متغیر | مقدار پیشنهادی |
|--------|----------------|
| `DEMO_AUTH` | `true` |
| `JWT_SECRET` | یک رشته تصادفی بلند |
| `NODE_ENV` | `production` |

`DATABASE_URL` برای دمو لازم نیست. بعداً اگر Postgres واقعی وصل کردید، `DEMO_AUTH=false` بگذارید.

4. Deploy. ورود با حساب‌های دمو بالا.

## اسکریپت‌ها

- `npm run dev` — سرور توسعه
- `npm run build` — ساخت تولید
- `npm run db:up` — PostgreSQL توکار
- `npm run db:push` — اعمال اسکیما
- `npm run db:seed` — داده اولیه
