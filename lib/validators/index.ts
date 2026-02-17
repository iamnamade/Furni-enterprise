import { z } from "zod";

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  captchaToken: z.string().min(10).optional()
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(80),
  password: z
    .string()
    .min(8)
    .regex(passwordRule, "Password must include uppercase, lowercase, number, and special character."),
  captchaToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().min(10)
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8)
    .regex(passwordRule, "Password must include uppercase, lowercase, number, and special character."),
  captchaToken: z.string().min(10)
});

export const resetPasswordRequestSchema = resetPasswordSchema.extend({
  token: z.string().min(40).max(256)
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url(),
  featured: z.coerce.boolean().optional().default(false),
  discountPct: z.coerce.number().int().min(0).max(90).optional().default(0),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1)
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional()
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingEmail: z.string().email(),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingCountry: z.string().min(2),
  shippingZip: z.string().min(2),
  cartItems: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive()
    })
  )
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"])
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
});
