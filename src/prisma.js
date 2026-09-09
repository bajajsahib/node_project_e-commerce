const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL ||= 'file:./dev.db';

module.exports = new PrismaClient();