import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { PRODUCT_CATEGORIES } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { SiteBackground } from "@/components/SiteBackground";

export default function Products() {
  const { t } = useTranslation();
  const { data: products, isLoading, isError } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen font-sans relative">
      <SiteBackground />
      <Navbar />

      <div className="pt-32 pb-12 bg-white/40 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">{t("products.title")}</h1>
            <p className="text-slate-600 text-lg">
              {t("products.subtitle")}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Search */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t("products.search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("products.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t("products.category")}</Label>
              <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm text-sm font-medium focus:ring-primary/30 focus:border-primary transition-all hover:bg-white/80">
                  <SelectValue placeholder={t("products.all_categories")} />
                </SelectTrigger>
                <SelectContent side="bottom" avoidCollisions={false} sideOffset={4} className="rounded-2xl bg-white/95 backdrop-blur-xl border-slate-200/50 shadow-2xl">
                  <SelectItem value="all" className="rounded-xl focus:bg-primary focus:text-white transition-colors cursor-pointer">{t("products.all_categories")}</SelectItem>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="rounded-xl focus:bg-primary focus:text-white transition-colors cursor-pointer">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(selectedCategory || searchTerm) && (
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase mr-2">{t("products.active_filters")}:</span>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory(null)} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full flex items-center gap-1.5 hover:bg-primary/10 transition-colors">
                    {selectedCategory} <X className="w-3 h-3" />
                  </button>
                )}
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full flex items-center gap-1.5 hover:bg-primary/10 transition-colors">
                    "{searchTerm}" <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500 transition-colors ml-2"
                >
                  {t("products.clear_all")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-medium">{t("products.error")}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm underline text-red-700">{t("products.retry")}</button>
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-lg">{t("products.no_products")}</p>
            <button onClick={clearFilters} className="mt-4 text-primary font-medium hover:underline">
              {t("products.clear_filters")}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
