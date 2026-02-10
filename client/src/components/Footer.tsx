import { Link } from "wouter";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import logo from "@assets/logo_raies__1768568127933.png";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#001a35] text-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="SRED Logo" className="h-10 w-auto rounded opacity-90" />
              <span className="font-display font-bold text-lg text-white">SRED</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {t("footer.desc")}
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/sredsousse?locale=fr_FR" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors duration-300">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.instagram.com/ste.raies.emballage.decors/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors duration-300">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.tiktok.com/@raies.beb.bhar.so?_r=1&_t=ZM-93Cl9Ou1Q6a" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#000000] transition-colors duration-300">
                <FaTiktok className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white text-lg mb-6">{t("footer.nav_title")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors duration-200">{t("nav.home")}</Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-400 hover:text-white transition-colors duration-200">{t("nav.products")}</Link>
              </li>
              <li>
                <Link href="/promos" className="text-slate-400 hover:text-white transition-colors duration-200">{t("nav.promos")}</Link>
              </li>
              <li>
                <Link href="/stickers" className="text-slate-400 hover:text-white transition-colors duration-200">{t("nav.stickers")}</Link>
              </li>
              <li>
                <Link href="/print" className="text-slate-400 hover:text-white transition-colors duration-200">{t("nav.print")}</Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">{t("nav.contact")}</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold text-white text-lg mb-6">{t("footer.contact_title")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a
                  href={t("contact.maps_link")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-white transition-colors duration-200"
                >
                  {t("contact.address_value")}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-slate-400 text-sm">+216 73 229 294</span>
                  <span className="text-slate-400 text-sm">+216 28 329 294</span>
                  <span className="text-slate-400 text-sm">+216 73 222 760</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-slate-400 text-sm">raies.emballage@topnet.tn</span>
              </li>
            </ul>
          </div>


        </div>

        <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
