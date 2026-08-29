import { z } from "zod";

export const productTypeSchema = z.enum(["tour", "audio_tour", "ticket"]);
export type ProductType = z.infer<typeof productTypeSchema>;

export const manualPaymentMethodSchema = z.enum(["qr_bolivia", "qr_pix", "crypto"]);
export type ManualPaymentMethod = z.infer<typeof manualPaymentMethodSchema>;

export const orderPaymentMethodSchema = z.enum(["stripe", "qr_bolivia", "qr_pix", "crypto"]);
export type OrderPaymentMethod = z.infer<typeof orderPaymentMethodSchema>;

export const orderStatusSchema = z.enum(["pending", "paid", "cancelled"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const productSchema = z.object({
  id: z.string(),
  type: productTypeSchema,
  hostId: z.string().nullable(),
  eventId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  priceBob: z.number(),
  priceUsd: z.number().nullable(),
  audioUrl: z.string().nullable(),
  capacity: z.number().nullable(),
  active: z.boolean().nullable(),
  createdAt: z.string().nullable(),
});
export type ProductDto = z.infer<typeof productSchema>;

export const paymentMethodSchema = z.object({
  id: z.string(),
  method: manualPaymentMethodSchema,
  label: z.string(),
  qrImageUrl: z.string().nullable(),
  addressOrKey: z.string().nullable(),
  instructions: z.string().nullable(),
  active: z.boolean().nullable(),
});
export type PaymentMethodDto = z.infer<typeof paymentMethodSchema>;

export const orderSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  quantity: z.number().nullable(),
  totalPriceBob: z.number(),
  paymentMethod: orderPaymentMethodSchema,
  referenceNote: z.string().nullable(),
  status: orderStatusSchema.nullable(),
  createdAt: z.string().nullable(),
});
export type OrderDto = z.infer<typeof orderSchema>;

export const createOrderRequestSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).default(1),
  paymentMethod: orderPaymentMethodSchema,
  referenceNote: z.string().optional(),
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

/** Returned by POST /api/orders — either a Stripe Checkout URL to redirect to,
 * or the manual payment method's receiving details to display. */
export const createOrderResponseSchema = z.object({
  order: orderSchema,
  stripeCheckoutUrl: z.string().nullable(),
  paymentInstructions: paymentMethodSchema.nullable(),
});
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;
