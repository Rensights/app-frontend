"use client";

import { useCallback, memo, useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSectionChange = useCallback((item: typeof MENU_ITEMS[number], e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    // Close sidebar immediately on mobile before navigation
    if (isMobile) {
      onClose();
    }
    // Small delay to ensure sidebar closes before navigation
    setTimeout(() => {
      if (item.id === "account") {
        router.push("/account");
      } else {
        router.push(item.path);
      }
    }, isMobile ? 100 : 0);
  }, [router, onClose, isMobile]);

  // Only show overlay on mobile when sidebar is open
  const showOverlay = isMobile && isOpen;

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
          {MENU_ITEMS.map((item) => {
            // Check if current path matches or starts with the item path
            // This handles sub-routes like /city-analysis/detailed
            let isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            
            // Special handling for Property Reports - includes analysis-request only
            if (item.id === "reports") {
              isActive = pathname === "/dashboard" ||
                        pathname === "/analysis-request" ||
                        pathname.startsWith("/analysis-request/");
            }

            // Special handling for Weekly Deals - includes /deals and property-details
            if (item.id === "alerts") {
              isActive = pathname === "/weekly-deals" ||
                        pathname.startsWith("/weekly-deals/") ||
                        pathname === "/deals" ||
                        pathname.startsWith("/deals/") ||
                        pathname === "/property-details" ||
                        pathname.startsWith("/property-details/");
            }
            
            return (
              <LinkWithPrefetch
                key={item.id}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleSectionChange(item, e)}
                prefetch={true}
              >
                <span className="menu-icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="menu-text">{item.label}</span>
              </LinkWithPrefetch>
            );
          })}
        </nav>

        <div className="logout-section">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      {showOverlay && (
        <div
          className="sidebar-overlay open"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
});

