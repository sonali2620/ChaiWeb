import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  MessageSquare,
  Tag,
  PlusCircle,
  ExternalLink
} from "lucide-react";

const AdminNavbar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard & Analytics", path: "/admin", icon: <LayoutDashboard size={17} /> },
    { label: "Orders Management", path: "/admin/orders", icon: <ShoppingBag size={17} /> },
    { label: "Product Catalog", path: "/admin/products", icon: <Coffee size={17} /> },
    { label: "Add Product", path: "/add-product", icon: <PlusCircle size={17} /> },
    { label: "Customer Reviews", path: "/admin/feedback", icon: <MessageSquare size={17} /> },
    { label: "Coupons & Offers", path: "/admin/coupons", icon: <Tag size={17} /> }
  ];

  return (
    <div className="bg-white border-bottom shadow-sm mb-4">
      <div className="container-fluid px-3 px-lg-4 py-2">
        <div className="d-flex align-items-center justify-content-between overflow-x-auto gap-2">
          <div className="d-flex align-items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold ${
                    isActive
                      ? "btn-chai-primary"
                      : "btn-light text-dark border-0 hover-bg"
                  }`}
                  style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link
            to="/products"
            className="btn btn-sm btn-outline-secondary d-none d-md-flex align-items-center gap-1 rounded-pill"
            style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
            target="_blank"
          >
            <ExternalLink size={14} /> View Live Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;