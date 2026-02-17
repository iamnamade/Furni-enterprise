# SEO Configuration

Implemented:
- Dynamic metadata for product detail pages.
- OpenGraph + Twitter card metadata.
- `app/sitemap.ts` dynamic sitemap generation.
- `app/robots.ts` robots config.
- Product JSON-LD structured data.
- Next Image optimization and lazy-loading on catalog grid.
- Static rendering hints (`revalidate`) for shop pages.
- Dynamic rendering for authenticated/admin routes via server session checks.

Target Lighthouse 90+ checklist:
- Use compressed next-gen images.
- Keep third-party scripts minimal.
- Enable Vercel edge caching for static localized marketing routes.
- Monitor INP/LCP in production.
