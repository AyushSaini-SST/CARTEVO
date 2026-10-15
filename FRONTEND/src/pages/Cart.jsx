import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Layout from "../components/Layout";
import { formatPrice } from "../lib/format";
import { MinusIcon, PlusIcon, TrashIcon } from "../components/Icons";

const Cart = () => {
  const { cart, loading, error, subtotal, totalItems, updateQuantity, removeFromCart } = useCart();
  const [actionError, setActionError] = useState("");

  const handleDecrease = async (productId, quantity) => {
    setActionError("");
    const result = quantity === 1
      ? await removeFromCart(productId)
      : await updateQuantity(productId, quantity - 1);

    if (!result.success) {
      setActionError(result.message || "Unable to update your cart.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center text-xl text-muted">Loading your cart...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded-[28px] bg-white px-6 py-20 text-center">
          <p className="text-2xl italic text-ink">Unable to load your cart.</p>
          <button onClick={() => window.location.reload()} className="mt-6 min-h-[52px] rounded-full bg-ink px-7 font-semibold text-white">
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="rounded-[28px] bg-white px-6 py-20 text-center">
          <p className="text-4xl">🛒</p>
          <p className="mt-4 text-2xl italic text-ink">Your cart is empty</p>
          <p className="mt-2 text-muted">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2">
            Browse Products
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-8 text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
        My Cart
      </h1>
      {actionError && (
        <p role="alert" className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-warn">
          {actionError}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Cart Items */}
        <div className="flex flex-col gap-4">
          {cart.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div key={item._id} className="flex gap-4 rounded-[20px] bg-white p-4">
                <img src={product.image} alt={product.name} className="h-24 w-24 rounded-[14px] object-cover" />

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
                    <p className="text-sm text-muted">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 rounded-full bg-paper p-1">
                      <button
                        onClick={() => handleDecrease(product._id, item.quantity)}
                        aria-label={item.quantity === 1 ? `Remove ${product.name} from cart` : `Decrease ${product.name} quantity`}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-50"
                      >
                        <MinusIcon size={16} />
                      </button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        disabled={item.quantity >= product.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-50"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="text-warn hover:underline"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <span className="text-lg font-semibold text-ink">{formatPrice(product.price * item.quantity)}</span>
                  <span className="text-xs text-muted">{product.stock} left</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-[20px] bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">Order Summary</h2>
          <div className="mt-4 flex justify-between text-muted">
            <span>Items ({totalItems})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-muted">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="my-4 border-t border-line" />
          <div className="flex justify-between text-lg font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 flex w-full min-h-[52px] items-center justify-center rounded-full bg-ink font-semibold text-white hover:bg-ink-2"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;