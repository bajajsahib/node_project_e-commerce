const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');
const { jwtSecret, jwtExpiresIn } = require('./config');
const { authenticate, authorize, validate, asyncHandler } = require('./middleware');
const schemas = require('./schemas');

const router = express.Router();
const id = (value) => Number.parseInt(value, 10);
const cartInclude = { items: { include: { product: true } } };

function userPayload(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
function tokenFor(user) { return jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn }); }
async function getCart(userId) { return prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, include: cartInclude }); }

router.get('/health', (request, response) => response.json({ success: true, data: { status: 'ok' } }));

router.post('/auth/register', validate(schemas.register), asyncHandler(async (request, response) => {
  const { name, email, password } = request.body;
  const user = await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) } });
  response.status(201).json({ success: true, data: { user: userPayload(user), token: tokenFor(user) } });
}));
router.post('/auth/login', validate(schemas.login), asyncHandler(async (request, response) => {
  const user = await prisma.user.findUnique({ where: { email: request.body.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(request.body.password, user.passwordHash))) return response.status(401).json({ success: false, message: 'Invalid email or password.' });
  return response.json({ success: true, data: { user: userPayload(user), token: tokenFor(user) } });
}));

router.get('/products', asyncHandler(async (request, response) => {
  const page = Math.max(id(request.query.page) || 1, 1);
  const limit = Math.min(Math.max(id(request.query.limit) || 10, 1), 100);
  const where = { isActive: true, ...(request.query.category && { category: request.query.category }), ...(request.query.search && { name: { contains: request.query.search } }) };
  const [data, total] = await prisma.$transaction([prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }), prisma.product.count({ where })]);
  response.json({ success: true, data, meta: { page, limit, total } });
}));
router.get('/products/:id', asyncHandler(async (request, response) => {
  const product = await prisma.product.findFirst({ where: { id: id(request.params.id), isActive: true } });
  if (!product) return response.status(404).json({ success: false, message: 'Product not found.' });
  return response.json({ success: true, data: product });
}));
router.post('/products', authenticate, authorize('ADMIN'), validate(schemas.product), asyncHandler(async (request, response) => response.status(201).json({ success: true, data: await prisma.product.create({ data: request.body }) })));
router.patch('/products/:id', authenticate, authorize('ADMIN'), validate(schemas.product.partial()), asyncHandler(async (request, response) => {
  const product = await prisma.product.update({ where: { id: id(request.params.id) }, data: request.body });
  response.json({ success: true, data: product });
}));
router.delete('/products/:id', authenticate, authorize('ADMIN'), asyncHandler(async (request, response) => {
  await prisma.product.update({ where: { id: id(request.params.id) }, data: { isActive: false } });
  response.status(204).send();
}));

router.get('/cart', authenticate, asyncHandler(async (request, response) => response.json({ success: true, data: await getCart(request.user.id) })));
router.post('/cart/items', authenticate, validate(schemas.cartItem), asyncHandler(async (request, response) => {
  const product = await prisma.product.findFirst({ where: { id: request.body.productId, isActive: true } });
  if (!product) return response.status(404).json({ success: false, message: 'Product not found.' });
  if (product.stock < request.body.quantity) return response.status(400).json({ success: false, message: 'Insufficient product stock.' });
  const cart = await getCart(request.user.id);
  await prisma.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: product.id } }, create: { cartId: cart.id, productId: product.id, quantity: request.body.quantity }, update: { quantity: request.body.quantity } });
  return response.status(201).json({ success: true, data: await getCart(request.user.id) });
}));
router.patch('/cart/items/:productId', authenticate, validate(schemas.quantity), asyncHandler(async (request, response) => {
  const cart = await getCart(request.user.id);
  const item = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: id(request.params.productId) } }, include: { product: true } });
  if (!item) return response.status(404).json({ success: false, message: 'Cart item not found.' });
  if (item.product.stock < request.body.quantity) return response.status(400).json({ success: false, message: 'Insufficient product stock.' });
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: request.body.quantity } });
  return response.json({ success: true, data: await getCart(request.user.id) });
}));
router.delete('/cart/items/:productId', authenticate, asyncHandler(async (request, response) => {
  const cart = await getCart(request.user.id);
  await prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId: id(request.params.productId) } } });
  response.status(204).send();
}));

router.post('/orders', authenticate, validate(schemas.order), asyncHandler(async (request, response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: request.user.id }, include: cartInclude });
  if (!cart?.items.length) return response.status(400).json({ success: false, message: 'Your cart is empty.' });
  const unavailable = cart.items.find((item) => !item.product.isActive || item.product.stock < item.quantity);
  if (unavailable) return response.status(400).json({ success: false, message: `Insufficient stock for ${unavailable.product.name}.` });
  const totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const order = await prisma.$transaction(async (transaction) => {
    const created = await transaction.order.create({ data: { userId: request.user.id, shippingAddress: request.body.shippingAddress, totalAmount, items: { create: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.product.price })) } }, include: cartInclude });
    for (const item of cart.items) await transaction.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });
  response.status(201).json({ success: true, data: order });
}));
router.get('/orders', authenticate, asyncHandler(async (request, response) => response.json({ success: true, data: await prisma.order.findMany({ where: request.user.role === 'ADMIN' ? {} : { userId: request.user.id }, include: cartInclude, orderBy: { createdAt: 'desc' } }) })));

module.exports = router;