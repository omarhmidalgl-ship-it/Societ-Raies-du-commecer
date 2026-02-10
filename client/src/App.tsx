import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import ProductDetail from "@/pages/ProductDetail";
import Promos from "@/pages/Promos";
import Stickers from "@/pages/Stickers";
import Print from "@/pages/Print";
import Admin from "@/pages/Admin";
import { SelectionFloat } from "@/components/SelectionFloat";
import { AuthProvider } from "./hooks/use-auth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/promos" component={Promos} />
      <Route path="/stickers" component={Stickers} />
      <Route path="/print" component={Print} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Add conditional font class for Arabic
    if (lang === "ar") {
      document.body.classList.add("font-arabic");
    } else {
      document.body.classList.remove("font-arabic");
    }
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>

      <AuthProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Router />
          <SelectionFloat />
          <WhatsAppButton />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>

    </QueryClientProvider>
  );
}

export default App;
