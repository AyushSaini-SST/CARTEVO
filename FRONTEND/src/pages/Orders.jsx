import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import { formatPrice } from "../lib/format";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/orders");
        setOrders(res.data.orders);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Layout><div className="py-20 text-center">Loading orders...</div></Layout>;
  if (error) return <Layout><div className="py-20 text-center">Failed to load orders</div></Layout>;

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-2xl italic text-ink">You have not placed any orders yet</p>
          <Link to="/products" className="mt-6 inline-block rounded-full bg-ink px-7 py-3 font-semibold text-white">
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-8 text-[48px] font-semibold text-ink">My Orders</h1>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-[20px] bg-white p-6">
            <div className="mb-4 flex justify-between">
              <div>
                <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${order.status === "PLACED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {order.status}
              </span>
            </div>
            {order.items.map((item) => (
              <div key={item.product} className="mb-2 flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <Link to={`/orders/${order._id}`} className="mt-4 inline-block text-sm text-ink underline">
              View Details →
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Orders;