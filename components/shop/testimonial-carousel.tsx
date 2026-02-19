import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Elena S.",
    role: "Architect",
    quote: "The finish quality is exceptional, and delivery was exactly on time.",
    avatar: "ES"
  },
  {
    id: 2,
    name: "Mark T.",
    role: "Product Designer",
    quote: "Simple checkout, accurate photos, and the sofa looks better in person.",
    avatar: "MT"
  },
  {
    id: 3,
    name: "Nina R.",
    role: "Homeowner",
    quote: "Support helped me pick dimensions quickly. Great buying experience.",
    avatar: "NR"
  }
];

export function TestimonialCarousel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {testimonials.map((item) => (
        <article key={item.id} className="glass-panel p-6">
          <div className="flex items-center gap-1 text-[color:var(--accent)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-4 text-base font-medium leading-relaxed text-[color:var(--foreground)]">&quot;{item.quote}&quot;</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--accent)]/60 bg-[color:var(--accent)]/20 text-xs font-semibold text-[color:var(--foreground)]">
              {item.avatar}
            </div>
            <div>
              <p className="font-semibold tracking-[-0.01em] text-[color:var(--foreground)]">{item.name}</p>
              <p className="text-xs font-medium text-[color:var(--muted)]">{item.role}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
