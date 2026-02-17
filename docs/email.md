# Email Setup (Resend)

1. Add and verify sender domain in Resend.
2. Set:
- `RESEND_API_KEY`
- `FROM_EMAIL` (example: `Furniture Store <orders@yourdomain.com>`)
3. Order emails are sent from Stripe webhook after payment confirmation.
4. Email includes order id, products, total, and shipping block.
