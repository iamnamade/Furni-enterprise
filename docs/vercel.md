# Vercel Deployment Guide

## Environment Variables
Set all variables from `.env.example`:
- `NEXTAUTH_URL=https://yourdomain.com`
- `NEXTAUTH_SECRET=<strong secret>`
- `DATABASE_URL=<Supabase pooled connection>`
- `DIRECT_URL=<Supabase direct connection>`
- `STRIPE_SECRET_KEY=<Stripe secret key>`
- `STRIPE_WEBHOOK_SECRET=<Stripe webhook secret>`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<Stripe publishable key>`
- `UPSTASH_REDIS_REST_URL=<Upstash REST URL>`
- `UPSTASH_REDIS_REST_TOKEN=<Upstash REST token>`
- `UPSTASH_REDIS_URL=<Upstash TLS URL>`
- `RESEND_API_KEY=<Resend API key>`
- `FROM_EMAIL=<verified sender>`
- `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<Google reCAPTCHA site key>`
- `RECAPTCHA_SECRET_KEY=<Google reCAPTCHA secret key>`
- `CLOUDINARY_URL=<Cloudinary URL if used>`

## Deploy Steps
1. Push repository to GitHub.
2. Import project into Vercel.
3. Configure env vars.
4. Run Prisma migrations in CI (or post-deploy hook).
5. Add Stripe production webhook endpoint:
- `https://yourdomain.com/api/webhooks/stripe`
6. Validate logs:
- Build success
- DB connectivity
- Stripe webhook 200 responses
