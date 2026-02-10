import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import logo from "@assets/logo_raies__1768568127933.png";
import { useSelection } from "@/hooks/use-selection";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartSheet } from "./CartSheet";


export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();


  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/promos", label: t("nav.promos") },
    { href: "/stickers", label: t("nav.stickers") },
    { href: "/print", label: t("nav.print") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.split("#")[1];
      if (location === "/") {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (location === href) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const isActive = (path: string) => location === path;

  return (
    <>
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/10 isolate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex-shrink-0 flex items-center gap-3"
                onClick={() => {
                  if (location === "/") {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <img
                  src={logo}
                  alt="SRED Logo"
                  className="h-12 w-auto mix-blend-multiply contrast-[1.1] brightness-[1.05]"
                />
                <div className="hidden md:flex flex-col">
                  <span className="font-display font-bold text-xl text-primary leading-tight">SRED</span>
                  <span className="text-xs text-muted-foreground tracking-wide font-medium">EMBALLAGES ET DÉCORS</span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className={`text-sm font-medium transition-colors duration-200 ${isActive(link.href)
                    ? "text-primary border-b-2 border-primary py-1"
                    : "text-muted-foreground hover:text-primary py-1 border-b-2 border-transparent hover:border-primary/20"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                <SelectionCounter onOpenCart={() => setIsCartOpen(true)} />
                <LanguageSwitcher />

              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <SelectionCounter onOpenCart={() => setIsCartOpen(true)} />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.href)
                    ? "bg-primary/5 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}

function SelectionCounter({ className = "", onOpenCart }: { className?: string; onOpenCart: () => void }) {
  const { count } = useSelection();

  return (
    <button
      onClick={onOpenCart}
      className={`relative p-2 text-muted-foreground hover:text-primary transition-colors ${className}`}
      aria-label="View Selection"
    >
      <ShoppingBag className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in-50 duration-300">
          {count}
        </span>
      )}
    </button>
  );
}
