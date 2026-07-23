import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook } from "react-icons/fi";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-sand-light/80">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Logo variant="light" />
          <p className="mt-4 font-body text-sm max-w-xs leading-relaxed text-sand-light/60">
            A quiet room, unhurried hands, and rituals drawn from still water —
            Elanova is where the day exhales.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Instagram" className="hover:text-gold-light transition-colors">
              <FiInstagram size={18} />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-gold-light transition-colors">
              <FiFacebook size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sand-light text-sm tracking-widest uppercase mb-4">
            Explore
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link to="/about" className="hover:text-gold-light transition-colors">About us</Link></li>
            <li><Link to="/services" className="hover:text-gold-light transition-colors">Services</Link></li>
            <li><Link to="/contact" className="hover:text-gold-light transition-colors">Contact</Link></li>
            <li><Link to="/register" className="hover:text-gold-light transition-colors">Book a visit</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sand-light text-sm tracking-widest uppercase mb-4">
            Visit
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-sand-light/60">
            <li>14 Willowmere Lane, Ranchi</li>
            <li>Tue – Sun, 10am – 8pm</li>
            <li>hello@elanova.spa</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-light/10 py-6 text-center text-xs text-sand-light/40 font-mono">
        © {new Date().getFullYear()} Elanova Spa &amp; Salon. All rights reserved.
      </div>
    </footer>
  );
}
