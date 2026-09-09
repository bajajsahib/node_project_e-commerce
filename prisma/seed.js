const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma');

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.user.create({ data: { name: 'Store Admin', email: 'admin@storefront.local', passwordHash: await bcrypt.hash('Admin123!', 12), role: 'ADMIN' } });
  await prisma.product.createMany({ data: [
    { name: 'Canvas Tote', description: 'Durable cotton tote for daily essentials.', price: 24.99, category: 'Accessories', stock: 25 },
    { name: 'Ceramic Mug', description: 'Hand-finished mug for coffee or tea.', price: 18.5, category: 'Home', stock: 40 },
  ] });
  console.log('Database seeded. Admin: admin@storefront.local / Admin123!');
}

main().finally(() => prisma.$disconnect());