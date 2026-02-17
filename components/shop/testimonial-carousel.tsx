"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 3600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel p-6 md:p-8">
      <AnimatePresence mode="wait">
        <motion.article
          key={testimonials[index].id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-1 text-[color:var(--accent)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-lg font-medium leading-relaxed text-[color:var(--foreground)]">&quot;{testimonials[index].quote}&quot;</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--accent)]/60 bg-[color:var(--accent)]/20 text-xs font-semibold text-[color:var(--foreground)]">
              {testimonials[index].avatar}
            </div>
            <div>
              <p className="font-semibold tracking-[-0.01em] text-[color:var(--foreground)]">{testimonials[index].name}</p>
              <p className="text-xs font-medium text-[color:var(--muted)]">{testimonials[index].role}</p>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
      <div className="mt-5 flex gap-2">
        {testimonials.map((item, dotIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(dotIndex)}
            className={`h-1.5 rounded-full transition ${dotIndex === index ? "w-8 bg-[color:var(--accent)]" : "w-3 bg-[color:var(--control-border)]"}`}
            aria-label={`Show testimonial ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

