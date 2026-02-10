import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import type { Product } from "@shared/schema";
import { useSelection } from "@/hooks/use-selection";
import { ImageViewerModal } from "./ImageViewerModal";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

import { useTranslation } from "react-i18next";

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { isSelected, addToSelection, removeFromSelection } = useSelection();
  const selected = isSelected(product.id, 'product');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const toggleSelection = () => {
    if (selected) {
      removeFromSelection(product.id, 'product');
    } else {
      addToSelection({
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        type: 'product'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group bg-white rounded-2xl overflow-hidden border ${selected ? 'border-primary shadow-md' : 'border-border shadow-sm'} hover:shadow-xl transition-all duration-300 flex flex-col h-full ring-primary/20 ${selected ? 'ring-4' : ''}`}
    >
      <div className="relative h-64 overflow-hidden bg-white p-4 cursor-pointer" onClick={() => setIsImageViewerOpen(true)}>
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300 z-10" />
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-primary rounded-full shadow-sm">
            {product.category}
          </span>
          {selected && (
            <span className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded-full shadow-sm flex items-center gap-1 animate-in zoom-in-50 duration-300">
              <Check className="w-3 h-3" /> {t("product_card.selected")}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-center mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={toggleSelection}
            className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${selected
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90"
              }`}
          >
            {selected ? (
              <>{t("product_card.remove")}</>
            ) : (
              <>
                <Plus className="w-4 h-4" /> {t("product_card.select")}
              </>
            )}
          </button>
        </div>
      </div>

      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={product.imageUrl}
        title={product.name}
        description={product.description}
      />
    </motion.div>
  );
}
