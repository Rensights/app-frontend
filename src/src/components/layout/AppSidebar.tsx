"use client";

import { useCallback, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LinkWithPrefetch } from "./LinkWithPrefetch";

export const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/weekly-deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
] as const;

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AppSidebar = memo(function AppSidebar({ isOpen, onClose, onLogout }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSectionChange = useCallback((item: typeof MENU_ITEMS[number], e: React.MouseEvent) => {
    e.preventDefault();
    if (item.id === "account") {
      router.push("/account");
    } else {
      router.push(item.path);
    }
    onClose();
  }, [router, onClose]);

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo">Rensights</div>
          <div className="logo-subtitle">Dubai Property Intelligence</div>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <LinkWithPrefetch
              key={item.id}
              href={item.path}
              aria-current={pathname === item.path ? "page" : undefined}
              className={`menu-item ${pathname === item.path ? "active" : ""}`}
              onClick={(e) => handleSectionChange(item, e)}
              prefetch={true}
            >
              <span className="menu-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="menu-text">{item.label}</span>
            </LinkWithPrefetch>
          ))}
        </nav>

        <div className="logout-section">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
    </>
  );
});

