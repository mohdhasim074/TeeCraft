
import { useState } from "react";
import { Link } from "react-router";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link
                    className="brand"
                    to="/"
                    aria-label="TeeCraft homepage"
                    onClick={closeMenu}
                >
                    <span className="brand-mark" aria-hidden="true">
                        T
                    </span>

                    <span className="brand-name">TeeCraft</span>
                </Link>

                <button
                    className="menu-toggle"
                    type="button"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                    onClick={() => setMenuOpen((current) => !current)}
                >
                    {menuOpen ? "Close" : "Menu"}
                </button>

                <nav
                    id="primary-navigation"
                    className={`navigation ${menuOpen ? "navigation-open" : ""}`}
                    aria-label="Primary navigation"
                >
                    <Link to="/" onClick={closeMenu}>
                        Home
                    </Link>

                    <a href="/#categories" onClick={closeMenu}>
                        Explore
                    </a>

                    <a href="/#about" onClick={closeMenu}>
                        About
                    </a>
                </nav>
            </div>
        </header>
    );
}

export default Header;
