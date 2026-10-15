import { Link } from "react-router-dom";

const Wordmark = ({ className = "text-[36px]", tone = "text-ink", to = "/home" }) => (
  <Link
    to={to}
    aria-label="Cartevo home"
    className={`font-brand font-semibold leading-none tracking-[0.01em] ${tone} ${className}`}
  >
    Cartevo
  </Link>
);

export default Wordmark;
