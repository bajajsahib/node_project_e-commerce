const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi');
const routes = require('./routes');
const { corsOrigin } = require('./config');
const { errorHandler } = require('./middleware');

const app = express();
app.use(helmet());
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin }));
app.use(express.json({ limit: '20kb' }));
app.use(pino());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: false }));
app.use('/api', routes);
app.use((request, response) => response.status(404).json({ success: false, message: `Route ${request.method} ${request.originalUrl} was not found.` }));
app.use(errorHandler);

module.exports = app;