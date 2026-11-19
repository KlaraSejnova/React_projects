import Icon from "./app-icon";
import type { Page } from "./types";

export default function Navigation({
  activePage,
  onNavigate,
  mobile = false,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  mobile?: boolean;
}) {
  const items: { page: Page; label: string; icon: string }[] = [
    { page: "overview", label: "Přehled", icon: "overview" },
    { page: "runs", label: "Moje běhy", icon: "runs" },
    { page: "compare", label: "Porovnání", icon: "compare" },
  ];
  return (
    <nav className={mobile ? "mobile-nav" : "nav-list"} aria-label="Hlavní navigace">
      {items.map((item) => (
        <button
          aria-current={activePage === item.page ? "page" : undefined}
          className={`nav-item${activePage === item.page ? " active" : ""}`}
          key={item.page}
          onClick={() => onNavigate(item.page)}
        >
          <Icon name={item.icon} size={16} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

