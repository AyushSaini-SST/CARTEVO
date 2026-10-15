import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import { formatPrice } from "../lib/format";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Layout><div className="py-20 text-center">Loading...</div></Layout>;
  if (!order) return <Layout><div className="py-20 text-center">Order not found</div></Layout>;

  return (
    <Layout>
      <div className="rounded-[20px] bg-white p-6">
        <h1 className="mb-4 text-2xl font-semibold">Order #{order._id.slice(-6)}</h1>
        <p className="mb-6 text-muted">{new Date(order.createdAt).toLocaleString()}</p>

        <h2 className="mb-2 font-semibold">Items</h2>
        {order.items.map((item) => (
          <div key={item.product} className="mb-3 flex justify-between">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="my-4 border-t" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>

        <h2 className="mt-6 mb-2 font-semibold">Shipping Address</h2>
        <p className="text-sm text-muted">
          {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>

        <div className="mt-6 flex gap-4">
          <Link to="/orders" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">Back to Orders</Link>
          <Link to="/products" className="rounded-full border border-ink px-6 py-3 font-semibold text-ink">Continue Shopping</Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;