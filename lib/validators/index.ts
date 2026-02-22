import { z } from "zod";

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nameField = z.string().trim().min(2).max(120);
const slugField = z.string().trim().toLowerCase().min(2).max(90).regex(slugRule, "Invalid slug format.");
const descriptionField = z.string().trim().min(10).max(4000);

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8),
  captchaToken: z.string().min(10).optional()
});

export const registerSchema = loginSchema.extend({
  name: nameField.max(80),
  password: z
    .string()
    .min(8)
    .regex(passwordRule, "Password must include uppercase, lowercase, number, and special character."),
  captchaToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
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
  name: nameField,
  slug: slugField,
  description: descriptionField,
  price: z.coerce.number().positive(),
  imageUrl: z.string().trim().url().max(2048),
  featured: z.coerce.boolean().optional().default(false),
  discountPct: z.coerce.number().int().min(0).max(90).optional().default(0),
  stock: z.coerce.number().int().min(0).max(100000),
  categoryId: z.string().cuid()
});

export const categorySchema = z.object({
  name: nameField.max(80),
  slug: slugField,
  description: z.string().trim().max(1000).optional()
});

export const checkoutSchema = z.object({
  shippingName: z.string().trim().min(2).max(120),
  shippingEmail: z.string().trim().email().max(254),
  shippingAddress: z.string().trim().min(5).max(220),
  shippingCity: z.string().trim().min(2).max(80),
  shippingCountry: z.string().trim().min(2).max(80),
  shippingZip: z.string().trim().min(2).max(20),
  cartItems: z.array(
    z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().min(1).max(99)
    })
  ).min(1).max(100)
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"])
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
});

export const idParamSchema = z.object({
  id: z.string().cuid()
});
