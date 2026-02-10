import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppButton() {
    const [location] = useLocation();

    // Do not show on admin pages
    if (location.startsWith("/admin")) {
        return null;
    }

    const phoneNumber = "21628858245";
    const message = encodeURIComponent("Bonjour Raies Emballage et Decors, j'aimerais avoir plus d'informations sur vos produits.");

    // Determine URL based on device
    const getWhatsAppUrl = () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            return `https://wa.me/${phoneNumber}?text=${message}`;
        } else {
            return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
        }
    };

    return (
        <motion.a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                window.open(getWhatsAppUrl(), '_blank');
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
            title="Contactez-nous sur WhatsApp"
        >
            {/* Pulse effect */}
            <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[#25D366] -z-10"
            />

            <FaWhatsapp className="w-8 h-8" />

            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-white text-slate-800 text-sm font-bold py-2 px-4 rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Discutons sur WhatsApp !
            </span>
        </motion.a>
    );
}
