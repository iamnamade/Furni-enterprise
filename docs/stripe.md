# Stripe Setup Guide

1. Create Stripe account and get API keys.
2. Set env vars:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
3. Start Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
4. Webhook route uses raw request body (`request.text()`) and verifies signature via Stripe SDK.
5. Duplicate events are ignored via `WebhookEvent.eventId` unique index.
6. Checkout flow:
- `/api/checkout` creates pending order + Stripe session
- webhook `checkout.session.completed` marks order as `PAID`
- confirmation page: `/[locale]/order-confirmation?orderId=<id>`
