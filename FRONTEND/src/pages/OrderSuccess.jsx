import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";

const OrderSuccess = () => {
    const { id } = useParams();

    return (
        <Layout>
            <div className="py-20 text-center">
                <p className="text-6xl">✅</p>
                <h1 className="mt-4 text-3xl font-semibold text-ink">Order Placed Successfully</h1>
                <p className="mt-2 text-muted">Order ID: {id?.slice(-8)}</p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link to="/orders" className="rounded-full bg-ink px-7 py-3 font-semibold text-white">View My Orders</Link>
                    <Link to="/products" className="rounded-full border border-ink px-7 py-3 font-semibold text-ink">Continue Shopping</Link>
                </div>
            </div>
        </Layout>
    );
};

export default OrderSuccess;