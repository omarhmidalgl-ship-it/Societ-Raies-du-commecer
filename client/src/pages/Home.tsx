import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Box, ShieldCheck, Truck, Package, Sparkles, Gift, Check, Plus, Instagram, Facebook, FileText } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { useProducts } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import type { Promo, Settings } from "@shared/schema";
import { useSelection } from "@/hooks/use-selection";
import { useState, useEffect } from "react";

import { HeroBackground } from "@/components/HeroBackground";
import { SiteBackground } from "@/components/SiteBackground";
import { StatCounter } from "@/components/StatCounter";
import { useTranslation } from "react-i18next";

// Update images to use premium generated ones and uploaded storefront
const storefrontImg = "/storefront.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  viewport: { once: true, margin: "-100px" }
};

function PromosSection() {
  const { t } = useTranslation();
  const { data: promos } = useQuery<Promo[]>({
    queryKey: ["/api/promos"],
  });
  const { isSelected, addToSelection, removeFromSelection } = useSelection();
  const [selectedPromoImage, setSelectedPromoImage] = useState<Promo | null>(null);

  if (!promos || promos.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/50 to-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900">{t("promos.title")}</h2>
              <p className="text-slate-500">{t("promos.subtitle")}</p>
            </div>
          </motion.div>
          <div className="hidden md:block">
            <Link href="/promos" className="text-primary font-bold hover:underline flex items-center gap-2">
              {t("promos.enjoy")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo, idx) => {
            const selected = isSelected(promo.id, 'promo');
            const toggleSelection = () => {
              if (selected) {
                removeFromSelection(promo.id, 'promo');
              } else {
                addToSelection({
                  id: promo.id,
                  name: promo.productName || "Promotion Flash",
                  description: promo.description ?? undefined,
                  imageUrl: promo.imageUrl,
                  type: 'promo'
                });
              }
            };

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative group aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border-4 ${selected ? 'border-primary' : 'border-white'} transition-all duration-300 cursor-pointer`}
              >
                <img
                  src={promo.imageUrl}
                  alt="Promotion"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onClick={() => setSelectedPromoImage(promo)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-opacity duration-300 z-0" />

                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <div className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-primary text-xs font-bold shadow-sm flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5" />
                    {t("promos.flash")}
                  </div>
                  {promo.category && (
                    <div className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm self-end">
                      {promo.category}
                    </div>
                  )}
                  {selected && (
                    <div className="px-3 py-1 bg-white text-primary rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 animate-in zoom-in-50 self-end">
                      <Check className="w-3 h-3" /> Sélectionné
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                  {promo.productName && (
                    <h3 className="text-white text-xl font-bold mb-2 line-clamp-1">{promo.productName}</h3>
                  )}
                  {promo.description && (
                    <p className="text-blue-50 text-xs mb-4 line-clamp-2 leading-relaxed opacity-90">
                      {promo.description}
                    </p>
                  )}
                  <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">
                    <button
                      onClick={toggleSelection}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${selected
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-white text-primary hover:bg-slate-50"
                        }`}
                    >
                      {selected ? (
                        <>Retirer de ma sélection</>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Sélectionner
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedPromoImage && (
          <ImageViewerModal
            isOpen={!!selectedPromoImage}
            onClose={() => setSelectedPromoImage(null)}
            imageUrl={selectedPromoImage.imageUrl}
            title={selectedPromoImage.productName || "Promotion"}
            description={selectedPromoImage.description}
          />
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
  const { data: stickerCatalogs } = useQuery<any[]>({
    queryKey: ["/api/stickers"],
  });

  // Handle scroll to section on mount if hash is present
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly to ensure content is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);


  // Featured products (prioritize 'Nouveautés' category)
  const featuredProducts = (products || []).filter(p => p.category === "Nouveautés").slice(0, 3);
  const finalFeatured = featuredProducts.length > 0 ? featuredProducts : (products?.slice(0, 3) || []);

  // Helper to get embed URL from Instagram post link
  const getInstagramEmbedUrl = (url?: string) => {
    if (!url) return "https://www.instagram.com/p/DTm2ITijqL3/embed";
    const baseUrl = url.split('?')[0].replace(/\/$/, "");
    return `${baseUrl}/embed`;
  };

  // Helper for Facebook embed
  const getFacebookEmbedUrl = (url?: string) => {
    if (!url) return "";
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
  };

  // Helper for TikTok embed
  const getTikTokEmbedUrl = (url?: string) => {
    if (!url) return "";
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (!videoIdMatch) return "";
    return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
  };

  return (
    <div className="min-h-screen font-sans relative">
      <SiteBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <HeroBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t("hero.leader")}
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 leading-tight mb-8">
                {t("hero.welcome")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-primary bg-[length:200%_auto] animate-gradient">Raies</span><br />
                {t("hero.and_decors")}
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                {t("hero.desc")}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  {t("hero.btn_products")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:border-primary/30 hover:text-primary transition-all duration-300"
                >
                  {t("hero.btn_contact")}
                </Link>
                {((stickerCatalogs && stickerCatalogs.length > 0) || settings?.stickersPdfUrl) && (
                  <Link
                    href="/stickers"
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Nos Stickers
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white group">
                <img
                  src={storefrontImg}
                  alt="Raies d'emballage et décors"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay" />

                {/* Visual glass element */}
                <div className="absolute inset-0 border border-white/20 rounded-[2rem] pointer-events-none" />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-xl border border-slate-100 max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Qualité Premium</h3>
                    <p className="text-xs text-slate-500">Certifiée ISO 9001</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust brands section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 contrast-125"
        >
          {['Société de Production', 'Industrie Nord', 'Emballage Plus', 'Global Logistics', 'Tunisia Export'].map((brand, i) => (
            <span key={i} className="text-lg font-display font-black tracking-tighter uppercase whitespace-nowrap">{brand}</span>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/40 backdrop-blur-sm border-y border-slate-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp}><StatCounter value={15} suffix="+" label={t("stats.years")} /></motion.div>
            <motion.div variants={fadeInUp}><StatCounter value={950} suffix="+" label={t("stats.clients")} /></motion.div>
            <motion.div variants={fadeInUp}><StatCounter value={2400} suffix="+" label={t("stats.projects")} /></motion.div>
            <motion.div variants={fadeInUp}><StatCounter value={24} suffix="/7" label={t("stats.support")} /></motion.div>
          </motion.div>
        </div>
      </section>

      {/* Promos Section */}
      <PromosSection />


      {/* Features Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">{t("features.title")}</h2>
            <p className="text-slate-600">{t("features.desc")}</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Box className="w-8 h-8 text-primary" />,
                title: t("features.tailor_made"),
                desc: t("features.tailor_made_desc")
              },
              {
                icon: <Package className="w-8 h-8 text-primary" />,
                title: t("features.sustainable"),
                desc: t("features.sustainable_desc")
              },
              {
                icon: <Truck className="w-8 h-8 text-primary" />,
                title: t("features.logistics"),
                desc: t("features.logistics_desc")
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-blue-50/30 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{t("featured.title")}</h2>
              <p className="text-slate-600">{t("featured.subtitle")}</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              {t("featured.view_all")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-3 gap-8"
            >
              {finalFeatured.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/products" className="inline-flex items-center gap-2 text-primary font-semibold">
              Voir tous nos produits <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Showcase */}
      <section className="py-24 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-sm font-semibold mb-4 border border-slate-100">
              <Sparkles className="w-4 h-4 text-primary" />
              Social Media
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
              Suivez notre actualité en vidéo
            </h2>
            <p className="text-slate-600">
              Découvrez nos dernières créations et les coulisses de notre production sur vos réseaux préférés.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Instagram */}
            <motion.div
              {...fadeInUp}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-4 px-4">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">Instagram</span>
              </div>

              <div className="flex-grow aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-slate-50 relative group mb-6">
                <iframe
                  src={getInstagramEmbedUrl(settings?.instagramReel || "")}
                  className="w-full h-full border-none"
                  allowTransparency={true}
                  allow="encrypted-media"
                  scrolling="no"
                ></iframe>
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://www.instagram.com/ste.raies.emballage.decors/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-bold shadow-lg mt-auto"
              >
                <Instagram className="w-5 h-5" />
                Suivre sur Instagram
              </motion.a>
            </motion.div>

            {/* Facebook */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-4 px-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Facebook className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">Facebook</span>
              </div>

              <div className="flex-grow aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-slate-50 relative group mb-6">
                {settings?.facebookReel ? (
                  <iframe
                    src={getFacebookEmbedUrl(settings.facebookReel)}
                    className="w-full h-full border-none"
                    allowTransparency={true}
                    allow="encrypted-media"
                    scrolling="no"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                    <Facebook className="w-12 h-12 text-blue-100 mb-4" />
                    <h3 className="font-bold text-slate-800 mb-1">Bientôt disponible</h3>
                    <p className="text-xs text-slate-500">Suivez notre page Facebook</p>
                  </div>
                )}
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://www.facebook.com/sredsousse?locale=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#1877F2] text-white rounded-2xl font-bold shadow-lg mt-auto"
              >
                <Facebook className="w-5 h-5" />
                Suivre sur Facebook
              </motion.a>
            </motion.div>

            {/* TikTok */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-4 px-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-black">
                  <FaTiktok className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">TikTok</span>
              </div>

              <div className="flex-grow aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-slate-50 relative group mb-6">
                {settings?.tiktokReel ? (
                  <iframe
                    src={getTikTokEmbedUrl(settings.tiktokReel)}
                    className="w-full h-full border-none"
                    allowTransparency={true}
                    allow="encrypted-media"
                    scrolling="no"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                    <FaTiktok className="w-12 h-12 text-slate-200 mb-4" />
                    <h3 className="font-bold text-slate-800 mb-1">Bientôt sur TikTok</h3>
                    <p className="text-xs text-slate-500">Du contenu exclusif en préparation</p>
                  </div>
                )}
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://www.tiktok.com/@raies.beb.bhar.so?_r=1&_t=ZM-93Cl9Ou1Q6a"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-bold shadow-lg mt-auto"
              >
                <FaTiktok className="w-5 h-5" />
                Suivre sur TikTok
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
