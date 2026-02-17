# Supabase Setup Guide

1. Create Supabase project.
2. Copy pooled and direct database URLs.
- `DATABASE_URL`: use pooled connection (`pgbouncer=true&connection_limit=1`).
- `DIRECT_URL`: use direct 5432 connection.
3. Run migrations:
```bash
npm run prisma:migrate:dev
npm run prisma:generate
npm run prisma:seed
```
4. Apply RLS SQL from `scripts/supabase-rls.sql`.
5. For production, use `npm run prisma:migrate` in CI/CD before app startup.

## Indexing strategy
The Prisma schema includes indexes for:
- `Product.categoryId`, `Product.featured`, `Product.price`
- `Order.userId`, `Order.status`, `Order.createdAt`
- `CartItem.userId`
These support catalog filtering, featured queries, admin analytics, and order history.
