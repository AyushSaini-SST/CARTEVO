# Cartevo — Product Requirements Document

## 1. Document status

| Field | Value |
| --- | --- |
| Product | Cartevo |
| Document | Product Requirements Document |
| Status | Describes the current application |
| Last updated | 2026-10-15 |

This document records the product behavior currently implemented in the repository. It is not a commitment to unimplemented features.

## 2. Product summary

Cartevo is a customer-facing e-commerce storefront for browsing and purchasing products across electronics, fashion, books, and home. Customers can create an account, browse and search the catalog, save products, manage a persistent cart, submit shipping details, pay through Razorpay, and review their orders.

## 3. Problem and goals

### Customer problem

Customers need a straightforward way to discover a small multi-category catalog, keep track of items they may want, and complete a purchase with clear stock and order information.

### Product goals

1. Make product discovery and category browsing simple.
2. Keep saved items and cart contents associated with a signed-in customer.
3. Show product availability and prevent cart quantities from exceeding current stock.
4. Provide a secure, verifiable payment and order flow.
5. Support responsive use on mobile and desktop.

### Out of scope in the current implementation

- Customer-facing product reviews or ratings.
- Product variants such as size or color.
- Coupons, promotions, or loyalty points.
- Shipment carrier tracking.
- An administrative dashboard or role-based catalog management.
- Guest checkout.

## 4. Users

### Shopper

A person who wants to browse the catalog, save products for later, buy available items, and review their own order history.

### Store operator

An operator who supplies product catalog records and configures the database, payment provider, and deployment environment. The repository does not currently provide a dedicated operator interface.

## 5. Current user journeys

### 5.1 Account creation and sign-in

1. A visitor opens the sign-up page.
2. They submit their full name, email, phone number, and password.
3. The API validates required fields, rejects duplicate email addresses, hashes the password, creates the customer, and issues an HTTP-only session cookie.
4. On successful sign-up, the frontend stores the returned customer and navigates to the home page.
5. Returning customers sign in with email and password.
6. The app checks the current session when it loads and protects shopping pages from signed-out visitors.

### 5.2 Browse and search

1. A signed-in customer opens the home page or shop.
2. They can browse the available product catalog and select a category.
3. Category selection is represented in the shop URL query string.
4. Product search is debounced before the catalog request is sent.
5. Loading, request-failure, and empty-result states are shown.
6. Selecting a product opens its product details page.

### 5.3 Save a product

1. A signed-in customer selects the save control on a product.
2. The product is added to or removed from that customer’s wishlist.
3. The wishlist page displays saved products and links back to product details.

### 5.4 Manage the cart

1. A customer adds an in-stock product to the cart.
2. The cart is persisted with the customer record and is available after signing in on another device.
3. The customer can increase or decrease quantity, or remove the product.
4. The API prevents quantities below one and quantities above available stock.
5. The cart displays line prices, item count, subtotal, and free shipping.

### 5.5 Place an order

1. The customer enters full name, phone number, address line, city, state, and six-digit pincode.
2. The API validates the shipping fields and stock, creates a pending order, and requests a Razorpay payment order.
3. The browser opens Razorpay Checkout.
4. The API verifies the returned payment signature using the private Razorpay secret.
5. On success, the order is marked paid and placed, the cart is cleared, and the customer is sent to the order-success page.
6. The customer can later review their order list and order details.

## 6. Functional requirements and acceptance criteria

### Accounts and access

- **FR-001:** The system shall allow a customer to register with full name, email, phone, and password.
- **FR-002:** The system shall reject registration when required fields are missing, the email already exists, or the password is shorter than six characters.
- **FR-003:** The system shall store a password hash rather than the submitted password.
- **FR-004:** The system shall allow a customer to sign in and sign out.
- **FR-005:** Protected shopping routes shall redirect unauthenticated visitors to sign-in.
- **FR-006:** The session token shall be carried in an HTTP-only cookie.

### Catalog

- **FR-007:** The shop shall list products with a name, description, price, category, image, and stock count.
- **FR-008:** Customers shall be able to filter the catalog by category.
- **FR-009:** Customers shall be able to search products by name.
- **FR-010:** The system shall provide a product details view for a catalog product.
- **FR-011:** Product cards and details shall communicate sold-out and low-stock states.

### Wishlist and cart

- **FR-012:** A customer shall be able to add and remove products from their wishlist.
- **FR-013:** A customer shall be able to add products to their cart and change quantities.
- **FR-014:** The system shall not allow cart quantity to exceed current stock.
- **FR-015:** A customer shall be able to remove a cart item, including by decreasing a quantity of one.
- **FR-016:** The cart shall show item count and a subtotal calculated from current cart prices.

### Checkout and orders

- **FR-017:** Checkout shall require all shipping fields, a ten-digit phone number, and a six-digit pincode.
- **FR-018:** The server shall recalculate the order total from current product prices and cart quantities.
- **FR-019:** The server shall reject checkout if a cart is empty, a product no longer exists, or stock is insufficient.
- **FR-020:** Payment completion shall be confirmed server-side using Razorpay signature verification.
- **FR-021:** On successful payment verification, the system shall mark the order paid and placed and clear the customer's cart.
- **FR-022:** A customer shall only be able to retrieve their own orders.

## 7. Non-functional requirements

- **Security:** Secrets stay on the backend; passwords are hashed; customer data and orders are scoped to the authenticated customer; production cookies use secure settings.
- **Availability:** The backend exposes `/health`, which returns success only when MongoDB is connected.
- **Usability:** The frontend provides visible loading, empty, and error states for key catalog and cart experiences.
- **Responsive design:** Core shopping flows should remain usable on mobile and desktop viewport sizes.
- **Accessibility:** Interactive elements should have accessible labels, semantic controls, and visible status or error messages.
- **Data integrity:** Checkout totals and stock checks are performed by the server, not trusted from the browser.

## 8. Success measures

The repository does not currently include product analytics. Suggested measures for a future analytics implementation:

- Registration completion rate.
- Product list-to-detail click-through rate.
- Add-to-cart rate.
- Checkout initiation and verified-payment completion rates.
- Checkout failure rate by validation, stock, and payment reason.
- Repeat purchase rate.

## 9. Dependencies and assumptions

- MongoDB is reachable from the backend and contains the intended catalog.
- Razorpay credentials are configured on the backend for payment functionality.
- The frontend is configured with the correct API origin.
- The backend CORS allowlist includes the exact frontend origin.
- Product images are reachable over HTTPS.
- The current catalog is supplied through the database and the optional product seed script.

