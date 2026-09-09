module.exports = {
  openapi: '3.0.3',
  info: { title: 'Storefront API', version: '1.0.0', description: 'A Node.js, Express, Prisma, and SQLite e-commerce learning API.' },
  servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
  tags: [{ name: 'Health' }, { name: 'Auth' }, { name: 'Products' }, { name: 'Cart' }, { name: 'Orders' }],
  paths: {
    '/api/health': { get: { tags: ['Health'], summary: 'Check API health', responses: { 200: { description: 'API is available' } } } },
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register a customer', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } }, responses: { 201: { description: 'Account and access token created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 400: { $ref: '#/components/responses/ValidationError' }, 409: { $ref: '#/components/responses/Conflict' } } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Log in and get an access token', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } }, responses: { 200: { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 401: { $ref: '#/components/responses/Unauthorized' } } } },
    '/api/products': {
      get: { tags: ['Products'], summary: 'List active products', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }, { name: 'category', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Product list' } } },
      post: { tags: ['Products'], summary: 'Create a product (admin)', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } }, responses: { 201: { description: 'Product created' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' } } },
    },
    '/api/products/{id}': {
      get: { tags: ['Products'], summary: 'Get one active product', parameters: [{ $ref: '#/components/parameters/ProductId' }], responses: { 200: { description: 'Product found' }, 404: { $ref: '#/components/responses/NotFound' } } },
      patch: { tags: ['Products'], summary: 'Update a product (admin)', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/ProductId' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } }, responses: { 200: { description: 'Product updated' } } },
      delete: { tags: ['Products'], summary: 'Deactivate a product (admin)', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/ProductId' }], responses: { 204: { description: 'Product deactivated' } } },
    },
    '/api/cart': { get: { tags: ['Cart'], summary: "Get the current user's cart", security: [{ bearerAuth: [] }], responses: { 200: { description: 'Cart returned' }, 401: { $ref: '#/components/responses/Unauthorized' } } } },
    '/api/cart/items': { post: { tags: ['Cart'], summary: 'Add or replace a cart item quantity', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CartItemInput' } } } }, responses: { 201: { description: 'Cart updated' }, 400: { $ref: '#/components/responses/ValidationError' } } } },
    '/api/cart/items/{productId}': { patch: { tags: ['Cart'], summary: 'Change a cart item quantity', security: [{ bearerAuth: [] }], parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 1 } } } } } }, responses: { 200: { description: 'Cart updated' } } }, delete: { tags: ['Cart'], summary: 'Remove a cart item', security: [{ bearerAuth: [] }], parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Cart item removed' } } } },
    '/api/orders': { post: { tags: ['Orders'], summary: 'Create an order from the cart', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } } } }, responses: { 201: { description: 'Order created' }, 400: { $ref: '#/components/responses/ValidationError' } } }, get: { tags: ['Orders'], summary: 'List current user orders; admins see all', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Orders returned' } } } },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    parameters: { ProductId: { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } },
    responses: { Unauthorized: { description: 'Missing or invalid JWT' }, Forbidden: { description: 'Insufficient role' }, NotFound: { description: 'Resource not found' }, Conflict: { description: 'Unique value already exists' }, ValidationError: { description: 'Request validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
    schemas: {
      RegisterInput: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', example: 'Taylor Smith' }, email: { type: 'string', format: 'email', example: 'taylor@example.com' }, password: { type: 'string', format: 'password', example: 'Password123!' } } },
      LoginInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } },
      ProductInput: { type: 'object', required: ['name', 'description', 'price', 'category', 'stock'], properties: { name: { type: 'string', example: 'Canvas Tote' }, description: { type: 'string', example: 'Durable everyday carry tote.' }, price: { type: 'number', format: 'float', example: 24.99 }, category: { type: 'string', example: 'Accessories' }, stock: { type: 'integer', example: 25 } } },
      CartItemInput: { type: 'object', required: ['productId', 'quantity'], properties: { productId: { type: 'integer', example: 1 }, quantity: { type: 'integer', example: 2 } } },
      OrderInput: { type: 'object', required: ['shippingAddress'], properties: { shippingAddress: { type: 'string', example: '123 Market Street, San Francisco, CA 94105' } } },
      AuthResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { token: { type: 'string' }, user: { type: 'object' } } } } },
      Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string', example: 'Validation failed.' }, errors: { type: 'array', items: { type: 'object' } } } },
    },
  },
};