import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import Logo from "../ui/Logo";
import Button from "../ui/Button"; 
const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-sand-light/90 backdrop-blur-md shadow-sm"
          : "bg-sand-light/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 h-20 flex items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-body text-[15px] ripple-underline ${
                  isActive ? "text-forest font-medium" : "text-ink/70 hover:text-forest"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="font-body text-[15px] text-ink/70 hover:text-forest px-2">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm">Book a visit</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-forest text-2xl"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-sand-light border-t border-blush px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-body text-base ${isActive ? "text-forest font-medium" : "text-ink/70"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-3 pt-3 border-t border-blush">
            <Link to="/login" onClick={() => setOpen(false)} className="text-ink/70">
              Log in
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">
                Book a visit
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
