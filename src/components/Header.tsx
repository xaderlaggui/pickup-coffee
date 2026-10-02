import { SunIcon, MoonIcon } from "./icons";
import { ResolvedTheme } from "../types";

interface HeaderProps {
  theme: ResolvedTheme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
}

export default function Header({ theme, onToggleTheme, onLogoClick }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner page-container">
        <button
          type="button"
          className="wordmark"
          onClick={onLogoClick}
          aria-label="Pickup Coffee - go to menu"
        >
          <span className="wordmark-pickup">Pickup</span>
          <span className="wordmark-coffee">Coffee</span>
        </button>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
