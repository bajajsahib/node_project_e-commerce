const app = require('./app');
const prisma = require('./prisma');
const { port } = require('./config');

const server = app.listen(port, () => console.log(`Storefront API running at http://localhost:${port}`));

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);