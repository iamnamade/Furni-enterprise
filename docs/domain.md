# Domain Configuration Guide

1. Add custom domain in Vercel.
2. Set DNS records requested by Vercel.
3. Ensure `NEXTAUTH_URL` matches exact primary domain.
4. Configure SPF/DKIM/DMARC for email sending domain.
5. Update Stripe webhook endpoint to custom domain after SSL is active.
