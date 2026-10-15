# Cartevo — Technical Documentation

## 1. Architecture

Cartevo is a two-part web application:

```text
Browser
  └── React SPA (Vite; FRONTEND)
      └── HTTP/JSON + credentialed cookies
          └── Express API (BACKEND)
              ├── MongoDB via Mongoose
              └── Razorpay Orders and Checkout
```

The frontend is a React single-page application. It uses React Router for navigation and Axios for API requests. The backend is an Express REST API connected to MongoDB through Mongoose. Authentication uses a signed JWT stored in an HTTP-only cookie. Payment initiation and signature verification are handled by the backend and Razorpay.

## 2. Repository layout

```text
BACKEND/
  config/                 Razorpay client setup
  controllers/            Request handlers and business logic
  middlewares/             Authentication middleware
  models/                  Mongoose data models
  routes/                  Express route definitions
  scripts/seedProducts.js  Repeat-safe sample catalog upsert
  utils/                   Shared backend helpers
  index.js                 Express setup, MongoDB connection, server startup
FRONTEND/
  public/                  Static assets and favicon
  src/components/          Shared UI components
  src/context/             Authentication and cart state
  src/pages/               Route-level screens
  src/services/api.js      Axios API client
  src/lib/                 Frontend helpers
docs/                      Product and engineering documentation
```

## 3. Technology

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS |
| API | Node.js 20+, Express 5 |
| Persistence | MongoDB, Mongoose |
| Authentication | JWT in HTTP-only cookie; bcrypt password hashing |
| Payments | Razorpay Orders API and Checkout |
| Frontend HTTP | Axios with `withCredentials: true` |

Exact dependency versions and scripts are maintained in `FRONTEND/package.json`, `BACKEND/package.json`, and their lock files.

## 4. Runtime configuration

### Backend

Copy `BACKEND/.env.example` to `BACKEND/.env` for local development.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URL` | Yes | MongoDB URI used by the API and seed script |
| `JWT_SECRET` | Yes | Secret used to sign and verify session JWTs |
| `RAZORPAY_KEY_ID` | Checkout | Razorpay key ID; test key locally |
| `RAZORPAY_KEY_SECRET` | Checkout | Private key used by the Razorpay SDK and payment verification |
| `CLIENT_URL` | Recommended | Comma-separated exact frontend origins allowed by credentialed CORS |
| `PORT` | No | HTTP port; defaults to `8001` |
| `NODE_ENV` | Recommended | Set to `production` in production to enable secure, cross-site cookies |

### Frontend

Copy `FRONTEND/.env.example` to `FRONTEND/.env`.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend origin; defaults to `http://localhost:8001` |

Vite exposes `VITE_` values in the browser bundle. Do not put secrets in frontend environment variables.

## 5. API conventions

- Base URL is the configured backend origin, with no `/api` prefix.
- Request and response payloads use JSON.
- Customer-protected routes require a valid `token` cookie.
- The backend enables credentialed CORS and allows `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`.
- Product IDs and order IDs are MongoDB ObjectIds.

### Customer routes

Mounted at `/customers`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/customers/register` | Public | Register a customer and issue a session cookie |
| `POST` | `/customers/login` | Public | Authenticate a customer and issue a session cookie |
| `GET` | `/customers/me` | Customer | Return the authenticated customer |
| `POST` | `/customers/logout` | Public | Clear the session cookie |
| `PATCH` | `/customers/change-password` | Customer | Change the signed-in customer's password |
| `POST` | `/customers/wishlist/:productId` | Customer | Toggle the product in the customer's wishlist |
| `GET` | `/customers/wishlist` | Customer | Read the customer's wishlist |

The repository also mounts wishlist routes at `/wishlist` (`GET /`, `POST /:productId`, `DELETE /:productId`). The customer-scoped routes above are used by the current UI.

### Product routes

Mounted at `/products`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | List products; accepts optional `search` and `category` query parameters |
| `GET` | `/products/:id` | Public | Return a product by ID |
| `POST` | `/products` | No authentication middleware currently applied | Create a product |

**Production note:** `POST /products` is currently not protected by authentication or an admin role. Restrict or remove this write endpoint before exposing the API publicly.

### Cart routes

Mounted at `/cart`; all require a customer session.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/cart` | Read the customer's populated cart |
| `POST` | `/cart/:productId` | Add one unit of a product |
| `PATCH` | `/cart/:productId` | Set a product quantity |
| `DELETE` | `/cart/:productId` | Remove a product |

The API enforces a minimum quantity of one and rejects quantities greater than current product stock.

### Wishlist routes

Mounted at `/wishlist`; all require a customer session.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/wishlist` | Read the customer's populated wishlist |
| `POST` | `/wishlist/:productId` | Add a product |
| `DELETE` | `/wishlist/:productId` | Remove a product |

### Order routes

Mounted at `/orders`; all require a customer session.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/orders/create-payment-order` | Validate shipping and stock, create an order, and create a Razorpay order |
| `POST` | `/orders/verify-payment` | Verify payment signature, place the order, and clear the cart |
| `GET` | `/orders` | List orders for the signed-in customer |
| `GET` | `/orders/:id` | Read an order belonging to the signed-in customer |

### Operational routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic API welcome response |
| `GET` | `/health` | Returns `200` when MongoDB is connected, otherwise `503` |

## 6. Data model

### Customer

- `fullName`: required string
- `email`: required, unique, lowercased, trimmed string
- `password`: required bcrypt hash
- `phone`: required string
- `wishlist`: array of Product references
- `cart`: array of `{ product: Product reference, quantity: number }`
- `createdAt`: creation timestamp

### Product

- `name`: required string
- `description`: required string
- `price`: required number greater than zero
- `category`: required string
- `image`: required string, normally an image URL
- `stock`: required number, minimum zero
- `createdAt`: creation timestamp

### Order

- `user`: required Customer reference
- `items`: snapshot entries containing Product reference, name, price, quantity, and image
- `shippingAddress`: full name, phone, address line, city, state, and pincode
- `totalAmount`: required order total in INR
- `paymentStatus`: `PENDING`, `PAID`, or `FAILED`
- `status`: `PENDING_PAYMENT`, `PLACED`, `CONFIRMED`, `SHIPPED`, or `DELIVERED`
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: verified Razorpay payment ID
- `createdAt` and `updatedAt`: timestamps

## 7. Authentication and payment flows

### Authentication

1. The backend hashes new passwords with bcrypt.
2. Login compares the submitted password to the stored hash.
3. The backend signs a seven-day JWT containing the customer ID.
4. The JWT is stored in an HTTP-only cookie named `token`.
5. In production, the cookie uses `Secure` and `SameSite=None`; locally, it uses non-secure `SameSite=Lax`.
6. Authentication middleware verifies the cookie and attaches the customer to the request.

### Payment

1. The backend calculates totals from MongoDB product prices and the authenticated customer's cart.
2. The backend checks product existence and stock before creating the order.
3. Razorpay order amount is sent in paise.
4. The browser submits payment identifiers and signature to the API.
5. The backend recalculates the expected HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
6. A valid signature marks the order `PAID` and `PLACED` and clears the cart.

## 8. Local development

Follow the root [`README.md`](../README.md) for setup. In short:

```sh
cd BACKEND
npm install
npm run dev
```

In a second terminal:

```sh
cd FRONTEND
npm install
npm run dev
```

Optional sample catalog upsert:

```sh
cd BACKEND
npm run seed:products
```

Review `MONGO_URL` before running the seed script; it modifies the connected database.

## 9. Build, deploy, and operations

### Frontend

```sh
cd FRONTEND
npm ci
npm run lint
npm run build
```

Publish `FRONTEND/dist` with static hosting and configure SPA fallback to `index.html`. Set `VITE_API_URL` at build time.

### Backend

```sh
cd BACKEND
npm ci
npm start
```

Set secrets through the hosting provider, not source control. Configure MongoDB network access, exact CORS origins, HTTPS, and `/health` monitoring.

For cross-origin cookie authentication, both hosts must use HTTPS. Prefer frontend and API subdomains under the same registrable domain to reduce browser third-party-cookie restrictions.

## 10. Security and operational considerations

- Never commit `.env` files or place backend secrets in the frontend.
- Rotate database or payment credentials that have been exposed.
- Restrict `CLIENT_URL` to trusted production frontend origins.
- Restrict product creation to an authorized operator before public deployment.
- Keep Razorpay signature verification server-side.
- A database-backed session revocation mechanism is not currently implemented; JWTs expire after seven days.
- The backend package currently has no automated test suite configured.

