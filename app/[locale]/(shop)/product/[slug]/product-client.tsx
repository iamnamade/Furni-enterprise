"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Star, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/zustand-cart";
import { useToastStore } from "@/lib/toast-store";
import { ProductCard } from "@/components/shop/product-card";

type ProductClientProps = {
  locale: string;
  product: {
    productId: string;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    category: string;
    description: string;
  };
  gallery: string[];
  relatedProducts: Array<{ id: string; slug: string; name: string; price: number; imageUrl: string }>;
};

export default function ProductClient({ locale, product, gallery, relatedProducts }: ProductClientProps) {
  const tProduct = useTranslations("product");
  const addItem = useCartStore((state) => state.addItem);
  const pushToast = useToastStore((state) => state.push);
  const [activeImage, setActiveImage] = useState(gallery[0] || product.imageUrl);
  const [quantity, setQuantity] = useState(1);
  const [accordion, setAccordion] = useState<"details" | "materials" | "shipping">("details");
  const images = useMemo(() => Array.from(new Set([product.imageUrl, ...gallery])), [gallery, product.imageUrl]);

  function addToCart() {
    for (let i = 0; i < quantity; i += 1) {
      addItem({
        productId: product.productId,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price
      });
    }
    pushToast({ title: "Added to cart", message: `${quantity} x ${product.name}` });
  }

  return (
    <div className="space-y-14 pb-24">
      <article className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0.6, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.45 }}
                transition={{ duration: 0.28 }}
              >
                <Image
                  src={activeImage}
                  alt={product.name}
                  width={1100}
                  height={960}
                  className="h-[420px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[540px]"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((image) => (
              <button
                key={image}
                type="button"
                className={`overflow-hidden rounded-xl border transition ${
                  image === activeImage ? "border-brand-secondary" : "border-white/20 hover:border-brand-secondary/50"
                }`}
                onClick={() => setActiveImage(image)}
              >
                <Image src={image} alt={`${product.name} view`} width={240} height={240} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/45 bg-brand-secondary/15 px-3 py-1 text-xs font-medium text-brand-secondary">
            <Truck className="h-3.5 w-3.5" />
            Free white-glove delivery
          </span>
          <p className="text-sm uppercase tracking-[0.22em] text-white/70">{product.category}</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{product.name}</h1>
          <div className="flex items-center gap-1 text-brand-secondary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-1 text-sm text-white/75">4.9 (312)</span>
          </div>
          <p className="text-sm leading-7 text-white/80">{product.description}</p>
          <p className="text-3xl font-semibold text-brand-secondary">${product.price.toFixed(2)}</p>
          <p className={`text-sm ${product.stock > 0 ? "text-brand-secondary" : "text-red-300"}`}>
            {product.stock > 0 ? tProduct("inStock", { count: product.stock }) : tProduct("outOfStock")}
          </p>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5">
              <button type="button" aria-label="Decrease quantity" className="h-10 w-10" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                -
              </button>
              <span className="w-9 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="h-10 w-10"
                onClick={() => setQuantity((value) => Math.min(Math.max(product.stock, 1), value + 1))}
              >
                +
              </button>
            </div>
            <Button disabled={product.stock <= 0} onClick={addToCart}>
              {tProduct("addToCart")}
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            {[
              {
                key: "details",
                title: "Product details",
                text: "Built with balanced proportions for modern interiors, engineered for daily comfort and long-term durability."
              },
              {
                key: "materials",
                title: "Materials & care",
                text: "Premium hardwood frame, performance fabric, and low-sheen finish. Clean with a soft cloth and mild soap."
              },
              {
                key: "shipping",
                title: "Shipping & returns",
                text: "Delivery in 3-7 business days in major regions. 30-day easy returns for unused products."
              }
            ].map((item) => {
              const isOpen = accordion === item.key;
              return (
                <div key={item.key} className="rounded-2xl border border-white/10 bg-white/5">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => setAccordion(item.key as "details" | "materials" | "shipping")}
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-brand-secondary">{isOpen ? "-" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden px-4 pb-4 text-sm text-white/80"
                      >
                        {item.text}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-brand-secondary/45 bg-brand-secondary/10 p-3 text-sm text-brand-secondary">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p>Crafted premium finish, protected packaging, and insured delivery included.</p>
            </div>
          </div>
        </div>
      </article>

      <section className="space-y-5">
        <h2 className="section-title">{tProduct("relatedProducts")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((related) => (
            <ProductCard key={related.id} locale={locale} product={related} />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[rgba(16,44,38,0.92)] p-3 backdrop-blur-xl lg:hidden">
        <Button className="w-full" disabled={product.stock <= 0} onClick={addToCart}>
          {tProduct("addToCart")} • ${product.price.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}


