Sure — here it is in clean **Markdown (`.md`) format**, ready to copy into a `.md` file:

# Node.js Storefront API Learning Guide

**Rating: 4/5**

## What Was Built

An e-commerce REST API where customers can:

* Register and log in
* Browse products
* Manage their cart
* Create orders

Administrators can:

* Create products
* Update products
* Deactivate products

## Topics Learned

* Node.js fundamentals
* Express routing
* REST APIs
* Request and response handling
* Middleware
* JWT authentication
* Role-based authorization
* Prisma database integration
* SQLite
* CRUD operations
* Zod validation
* Error handling
* Helmet
* CORS
* Rate limiting
* Environment variables
* Pino logging
* Jest/Supertest testing
* Swagger/OpenAPI

## Project Structure

```text
prisma/
├── schema.prisma       # User, Product, Cart, CartItem, Order and OrderItem models
└── seed.js             # Demo admin user and sample products

src/
├── app.js              # Express configuration, middleware, Swagger and routes
├── server.js           # Starts the server
├── routes.js           # Authentication, product, cart and order APIs
├── middleware.js       # Authentication, authorization, validation and error handling
├── schemas.js          # Zod validation schemas
└── openapi.js           # OpenAPI 3.0 Swagger documentation

tests/
└── api.test.js         # API tests
```

## API Details

### Health Check

* `GET /api/health` — Confirms that the server is running.

### Authentication

* `POST /api/auth/register` — Creates a customer account, hashes the password, and returns a JWT.
* `POST /api/auth/login` — Verifies the password and returns a JWT.

### Products

* `GET /api/products` — Lists products with search, category filters, and pagination.
* `GET /api/products/:id` — Returns one active product.
* `POST /api/products` — Creates a product. Requires `ADMIN` role.
* `PATCH /api/products/:id` — Updates a product. Requires `ADMIN` role.
* `DELETE /api/products/:id` — Deactivates a product. Requires `ADMIN` role.

### Cart

* `GET /api/cart` — Returns the authenticated user's cart.
* `POST /api/cart/items` — Adds a product and quantity after checking stock.
* `PATCH /api/cart/items/:id` — Updates a cart item.
* `DELETE /api/cart/items/:id` — Removes a cart item.

### Orders

* `POST /api/orders` — Creates an order from the cart, calculates the total on the server, reduces stock, and clears the cart using a database transaction.
* `GET /api/orders` — Returns customer order history. Administrators can view all orders.

## How to Explain the Main Topics

### 1. Node.js and Asynchronous Code

Node.js allows JavaScript to run on a backend server. Database operations are asynchronous, so `async/await` is used to wait for database results without blocking other incoming requests.

### 2. REST APIs and Express Routing

REST APIs use URLs to represent resources and HTTP methods to perform actions:

* `GET` — Read data
* `POST` — Create data
* `PATCH` — Update data
* `DELETE` — Remove or deactivate data

Express maps these requests to route handlers and returns JSON responses with appropriate HTTP status codes.

### 3. Middleware

Middleware runs between an incoming request and the route handler.

This project uses middleware for:

* JSON parsing
* Request logging
* Authentication
* Authorization
* Request validation
* Rate limiting
* CORS
* Security headers
* Error handling

This keeps common logic separate from individual API handlers.

### 4. Authentication and Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this action?

Passwords are hashed using bcrypt. After login, the server generates a JWT.

Protected requests send the token using:

```text
Authorization: Bearer <token>
```

Admin routes additionally check whether the user's JWT role is `ADMIN`.

### 5. Database and CRUD

Prisma is used as an ORM to interact with the database.

The product APIs demonstrate CRUD operations:

* Create
* Read
* Update
* Delete

The project uses **soft delete**, where a product is marked as inactive instead of being permanently removed from the database.

### 6. Validation and Error Handling

Zod validates incoming data before business logic is executed.

Validation is used for:

* Email
* Password
* Product fields
* Addresses
* Cart quantities

Invalid input returns a predictable `400` response.

Centralized error handling manages unexpected failures and prevents internal stack traces from being exposed to clients.

### 7. Security

The project implements several basic security practices:

* Passwords are never stored as plain text.
* Private APIs use JWT authentication.
* Admin APIs use role-based authorization.
* Zod validates incoming data.
* Helmet adds security-related HTTP headers.
* CORS controls allowed browser origins.
* Rate limiting helps reduce repeated API requests.
* Secrets are stored in `.env` instead of source code.

### 8. Logging and Testing

**Pino** is used for application logging, including:

* Request method
* Request URL
* Response status
* Response time

**Jest** and **Supertest** are used for API testing without manually testing every API through a browser.

### 9. Swagger/OpenAPI

OpenAPI provides a structured contract describing:

* API endpoints
* Request parameters
* Request bodies
* Authentication
* Responses

Swagger UI provides an interactive interface for testing and understanding the APIs.

The Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

This allows a frontend developer or reviewer to understand and test the backend APIs without going through the source code.

## Demonstration Steps

1. Run the application using `npm run dev`.
2. Open Swagger UI at `http://localhost:3000/api-docs`.
3. Log in through `POST /api/auth/login` using the demo admin account.
4. Copy the returned JWT token.
5. Click **Authorize** in Swagger and enter the token using the Bearer authentication scheme.
6. Create a product using the admin product API.
7. Register a customer account and authorize Swagger with the customer token.
8. Add a product to the cart.
9. Create an order.
10. Explain how the server:

    * Checks product stock
    * Calculates the order total
    * Reduces available stock
    * Creates the order
    * Clears the cart
    * Performs these operations within a database transaction

## Commands

```bash
npm install

cp .env.example .env

npm run db:generate

npx prisma db push

npm run db:seed

npm run dev

npm test
```

## Swagger

```text
http://localhost:3000/api-docs
```

## Next Phase

The following areas can be explored further to improve backend knowledge:

* Add `GET /api/orders/:id`
* Add an admin order status update API
* Validate URL parameters and query parameters
* Add tests for successful login
* Add tests for admin permissions
* Add tests for checkout totals
* Add tests for stock reduction
* Move from SQLite to PostgreSQL
* Explore refresh tokens and logout
* Implement password reset
* Add email verification
* Add audit logging
* Add CI/CD
* Add monitoring
* Learn database migrations
* Explore API versioning
* Perform load testing
* Add payment integration
* Add file uploads
* Explore webhooks
* Explore background jobs
* Build a frontend client
* Deploy the API and database
* Share a live Swagger URL

## Self-Assessment Summary

I built a documented e-commerce REST API using Node.js, Express, Prisma, and SQLite. The project helped me gain practical experience with routing, middleware, request and response handling, JWT authentication, role-based authorization, database CRUD operations, cart and order workflows, validation, error handling, security basics, logging, testing, environment configuration, and Swagger/OpenAPI.

My next goal is to build deeper knowledge in production-level areas such as deployment, testing, security, performance, and scalable API design.

You can save the content directly as **`NodeJS-Storefront-API-Learning-Guide.md`**.
