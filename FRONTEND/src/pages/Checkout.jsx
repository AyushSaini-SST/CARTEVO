import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import { formatPrice } from "../lib/format";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      return setError("All fields are required");
    }
    if (!/^\d{10}$/.test(form.phone)) return setError("Invalid phone number");
    if (!/^\d{6}$/.test(form.pincode)) return setError("Pincode must be 6 digits");

    setLoading(true);

    try {
      const res = await axiosInstance.post("/orders/create-payment-order", { shippingAddress: form });

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway");
        setLoading(false);
        return;
      }

      const options = {
        key: res.data.key,
        amount: res.data.amount,
        currency: res.data.currency,
        name: "Cartevo",
        description: "Cartevo Order",
        order_id: res.data.razorpayOrderId,
        handler: async (response) => {
          try {
            await axiosInstance.post("/orders/verify-payment", {
              shopKartOrderId: res.data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchCart();
            navigate(`/order-success/${res.data.shopKartOrderId}`);
          } catch (err) {
            setError("Payment verification failed");
          }
        },
        prefill: { name: form.fullName, contact: form.phone },
        theme: { color: "#000" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", () => setError("Payment failed. Your cart is preserved."));
      paymentObject.open();
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-2xl italic text-ink">Your cart is empty</p>
          <button onClick={() => navigate("/products")} className="mt-6 rounded-full bg-ink px-7 py-3 font-semibold text-white">
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-8 text-[48px] font-semibold text-ink">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <form onSubmit={handleSubmit} className="rounded-[20px] bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Shipping Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {["fullName", "phone", "addressLine1", "city", "state", "pincode"].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                className="rounded-[12px] border border-line px-4 py-3 outline-none focus:border-ink"
              />
            ))}
          </div>
          {error && <p className="mt-4 text-sm text-warn">{error}</p>}
        </form>

        <div className="h-fit rounded-[20px] bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          {cart.map((item) => (
            <div key={item._id} className="mb-3 flex justify-between text-sm">
              <span>{item.product.name} × {item.quantity}</span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="my-4 border-t" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-ink py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;