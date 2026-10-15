# Cartevo — Product Brief

## 1. Overview

Cartevo is a curated multi-category online storefront. The current catalog spans electronics, fashion, books, and home. Its customer experience is focused on discovery, saved products, persistent cart management, and a direct path from checkout to payment confirmation.

## 2. Positioning

**For shoppers** who want useful products from several everyday categories in one place, **Cartevo** is a simple, curated storefront that helps them discover, save, and purchase available items without a complicated shopping journey.

The product uses a warm, editorial visual identity: a restrained evergreen and ivory palette, serif Cartevo wordmark, and image-led product presentation.

## 3. Audience

### Primary audience

- Shoppers browsing everyday fashion and home items.
- Readers looking for books.
- Customers who value a clear stock status and a low-friction checkout.

### Secondary audience

- Store operators who curate products and manage operational configuration.
- The current application supports catalog data at the API/database level but does not include an operator dashboard.

## 4. Customer value

- **One catalog, multiple needs:** Browse across electronics, fashion, books, and home.
- **Useful discovery:** Search by product name and filter by category.
- **Continuity:** Keep saved items and cart contents with the customer account.
- **Stock clarity:** See availability and receive server-side stock validation.
- **Purchase confidence:** Use Razorpay Checkout and server-verified payment confirmation.

## 5. Product principles

1. **Curated over crowded:** Keep product discovery focused and readable.
2. **Clarity over surprise:** Show price, category, and stock before checkout.
3. **Customer-owned data:** Keep wishlist, cart, and orders scoped to the signed-in customer.
4. **Trustworthy checkout:** Calculate totals on the server and verify payment signatures server-side.
5. **Editorial restraint:** Use calm color, high-quality imagery, and clear hierarchy without sacrificing contrast or legibility.

## 6. Current scope

### Available customer capabilities

- Customer registration, login, session restoration, and logout.
- Home page with featured content, categories, latest catalog items, and low-stock items.
- Product catalog with name search and category filters.
- Product details with availability and cart controls.
- Customer wishlist.
- Persistent cart and quantity changes.
- Shipping details and Razorpay payment checkout.
- Order success, order history, and order details.

### Current categories

- Electronics
- Fashion
- Books
- Home

The category list is defined in the frontend. Product records are stored in MongoDB.

### Not currently included

- Guest shopping or guest checkout.
- Product reviews, ratings, or recommendations.
- Product variants.
- Discount codes or promotions.
- Shipment tracking.
- Returns/refunds workflow.
- Administrative catalog, inventory, or order management UI.
- Analytics instrumentation.

## 7. Brand and experience direction

- Product name: **Cartevo**
- Brand wordmark: serif display face; no trailing dot
- Visual language: clean editorial retail
- Current base colors: evergreen, ivory, sage, and warm neutral surfaces
- Interaction tone: helpful, concise, and clear about loading, unavailable items, and errors
- Responsive behavior: mobile and desktop layouts for core shopping tasks

## 8. Product lifecycle and catalog operations

The catalog is read from MongoDB. The backend exposes public product creation and read endpoints; the current codebase does not implement an admin role or admin interface. Treat product write access as an operational concern and do not expose it to untrusted users in a production deployment without adding authorization.

The optional `BACKEND/scripts/seedProducts.js` script upserts sample products. It writes to the MongoDB database selected by `MONGO_URL`; verify that environment before running, especially in production.

## 9. Suggested roadmap (not implemented)

These are potential next steps, not current commitments:

1. Add an authenticated, role-protected catalog management workflow.
2. Add product variants and structured inventory by variant.
3. Add order fulfillment states and shipment tracking.
4. Add analytics for catalog, cart, and payment conversion.
5. Add product review and rating moderation.
6. Add automated integration and end-to-end test coverage.

## 10. Suggested product metrics

Instrument only with an appropriate privacy notice and consent approach:

- Catalog search and category filter usage.
- Product detail engagement.
- Wishlist and add-to-cart conversion.
- Checkout start-to-payment success rate.
- Stock-related checkout failures.
- Repeat purchase rate.

