import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-icon">
        <HeartPulse size={27} />
      </span>
      <span className="brand-copy">
        <strong>
          ArogyaMitra <em>AI</em>
        </strong>
        <small>Smarter Healthcare for Everyone</small>
      </span>
    </Link>
  );
}
