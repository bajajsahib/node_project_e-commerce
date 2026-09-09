const { z } = require('zod');

const register = z.object({ name: z.string().min(2).max(80), email: z.email(), password: z.string().min(8).max(100) });
const login = z.object({ email: z.email(), password: z.string().min(1) });
const product = z.object({ name: z.string().min(2).max(120), description: z.string().min(5).max(1000), price: z.coerce.number().positive(), category: z.string().min(2).max(80), stock: z.coerce.number().int().nonnegative() });
const cartItem = z.object({ productId: z.coerce.number().int().positive(), quantity: z.coerce.number().int().positive().max(99) });
const quantity = z.object({ quantity: z.coerce.number().int().positive().max(99) });
const order = z.object({ shippingAddress: z.string().min(10).max(300) });
const orderStatus = z.object({ status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) });

module.exports = { register, login, product, cartItem, quantity, order, orderStatus };