# Furni Enterprise

Production-grade furniture e-commerce platform built with Next.js 14 App Router, Prisma + Supabase PostgreSQL, NextAuth, Stripe, Upstash Redis, Zustand, next-intl, and Tailwind.

## Core Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS, ShadCN-style primitives, Framer Motion
- Backend: Next.js Route Handlers, Prisma ORM, Supabase PostgreSQL
- Auth: NextAuth (JWT), role-based access (`USER`, `ADMIN`)
- Cache/Rate-limit: Upstash Redis via ioredis
- Payments: Stripe Checkout + webhook idempotency
- Email: Resend order confirmation
- i18n: next-intl (`/en/*`, `/ka/*`)
- State: Zustand cart with localStorage persistence + backend sync

## Folder Structure
```text
app/
  api/
    auth/[...nextauth]/route.ts
    auth/register/route.ts
    products/route.ts
    products/[id]/route.ts
    categories/route.ts
    categories/[id]/route.ts
    orders/route.ts
    checkout/route.ts
    cart/sync/route.ts
    webhooks/stripe/route.ts
  [locale]/
    page.tsx
    layout.tsx
    (shop)/shop/page.tsx
    (shop)/product/[slug]/page.tsx
    (shop)/cart/page.tsx
    (shop)/checkout/page.tsx
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (account)/orders/page.tsx
    admin/page.tsx
    admin/products/page.tsx
    admin/categories/page.tsx
    admin/orders/page.tsx
    (marketing)/about/page.tsx
    (marketing)/contact/page.tsx
    order-confirmation/page.tsx
  sitemap.ts
  robots.ts
components/
  layout/
  providers/
  shop/
  ui/
lib/
  auth.ts
  auth-guard.ts
  prisma.ts
  redis.ts
  rate-limit.ts
  stripe.ts
  email.ts
  csrf.ts
  catalog.ts
  validators/index.ts
messages/
  en.json
  ka.json
prisma/
  schema.prisma
  seed.ts
docs/
  supabase.md
  redis.md
  stripe.md
  email.md
  storage.md
  i18n.md
  dark-mode.md
  seo.md
  vercel.md
  domain.md
scripts/
  supabase-rls.sql
```

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Copy env file:
```bash
cp .env.example .env
```
3. Run Prisma:
```bash
npm run prisma:migrate:dev
npm run prisma:generate
npm run prisma:seed
```
4. Start app:
```bash
npm run dev
```

## Database + Supabase
- `DATABASE_URL` must use pooled connection.
- `DIRECT_URL` must use direct connection for migrations.
- Apply `scripts/supabase-rls.sql` in Supabase SQL editor.
- Schema includes indexes for product filters, order history, and admin stats.

## Redis Caching
- Cached resources:
  - product list
  - categories
  - featured products
- Cache invalidation occurs on product/category mutations.
- Falls back to DB on cache miss.

## Stripe + Webhook
- Checkout session created server-side at `POST /api/checkout`.
- Webhook route: `POST /api/webhooks/stripe`.
- Signature verification uses Stripe SDK + raw body.
- Duplicate events prevented with `WebhookEvent.eventId` unique constraint.
- Paid orders trigger confirmation email.

## Security
- Password hashing: bcryptjs
- Auth cookies: HTTP-only + secure in production
- CSP and security headers in `next.config.mjs`
- Zod validation across API entry points
- CSRF origin validation on mutating APIs
- Rate limiting via Redis in middleware
- Role-protected admin routes and API checks

## SEO + Performance
- Dynamic product metadata
- OpenGraph/Twitter metadata
- JSON-LD structured product data
- `sitemap.xml` and `robots.txt`
- Next Image optimization and lazy-loading
- ISR for catalog-style routes
- Dynamic rendering for authenticated/admin routes

## i18n + Theme
- Locales: English (`en`), Georgian (`ka`)
- Localized routes (`/en/shop`, `/ka/shop`)
- Locale switcher persists preference in localStorage
- System theme detection + manual dark mode toggle

## Admin Panel
- Dashboard stats
- Product/category/order management views
- Admin-only image upload endpoint (`POST /api/upload`) for Cloudinary
- APIs ready for full CRUD UI integration
- Route-level admin protection

## Deployment (Vercel)
1. Push repository to GitHub.
2. Import repo in Vercel.
3. Add all env vars from `.env.example`.
4. Configure Stripe webhook endpoint:
- `https://yourdomain.com/api/webhooks/stripe`
5. Validate:
- login/register
- cart persistence
- checkout -> webhook -> email
- admin route protection

## Git + GitHub Automation
Run these on your machine (this environment has no `git` CLI installed):
```bash
git init
git branch -M main
git add .
git commit -m "feat: initial production furniture ecommerce platform"
gh repo create furni-enterprise --public --source=. --remote=origin --push
```

## Final Verification Checklist
- Stripe checkout and webhook processing
- Email sent after successful payment
- Cart optimistic UX + persistence + sync
- Localized route switching
- Dark mode toggle and persistence
- SEO metadata + OG + JSON-LD
- Admin CRUD API access control
- Lighthouse audit target 90+
