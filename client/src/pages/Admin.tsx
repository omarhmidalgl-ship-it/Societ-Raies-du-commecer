

import { AdminBackground } from "@/components/AdminBackground";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, Product, Promo, Settings } from "@shared/schema";
import { PRODUCT_CATEGORIES } from "@shared/schema";
import { Loader2, Plus, Trash2, Upload, LogOut, UserPlus, KeyRound, MessagesSquare, Calendar, Package, TrendingUp, Facebook, Instagram, Pencil, FileText, Search, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useAuth } from "../hooks/use-auth";

import { FaTiktok } from "react-icons/fa";

const PRODUCTS_PER_PAGE = 6;
const PROMOS_PER_PAGE = 4;

function AdminPagination({
    currentPage,
    totalPages,
    onPageChange
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(i + 1)}
                        className={`w-9 h-9 rounded-xl font-bold ${currentPage === i + 1 ? "bg-primary text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function Admin() {
    const { user, loginMutation, logoutMutation, isLoading: loadingUser } = useAuth();
    const [view, setView] = useState<"auth" | "forgot" | "reset">("auth");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedPromoCategory, setSelectedPromoCategory] = useState<string>("all");
    const [productSearch, setProductSearch] = useState("");
    const [promoSearch, setPromoSearch] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
    const [productPage, setProductPage] = useState(1);
    const [promoPage, setPromoPage] = useState(1);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password });
    };

    // Queries
    const { data: messages } = useQuery<Message[]>({
        queryKey: ["/api/messages"],
        enabled: !!user,
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });

    const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
        queryKey: ["/api/products"],
        enabled: !!user,
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });

    const { data: promos, isLoading: loadingPromos } = useQuery<Promo[]>({
        queryKey: ["/api/promos"],
        enabled: !!user,
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });

    const { data: currentSettings, isLoading: loadingSettings } = useQuery<Settings>({
        queryKey: ["/api/settings"],
        enabled: !!user,
        staleTime: 300000,
        refetchOnWindowFocus: false,
    });

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p =>
            (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.description || "").toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [products, productSearch]);

    const filteredPromos = useMemo(() => {
        if (!promos) return [];
        return promos.filter(p =>
            (p.productName || "").toLowerCase().includes(promoSearch.toLowerCase()) ||
            (p.description || "").toLowerCase().includes(promoSearch.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(promoSearch.toLowerCase())
        );
    }, [promos, promoSearch]);

    // Resets pages when searching
    useEffect(() => {
        setProductPage(1);
    }, [productSearch]);

    useEffect(() => {
        setPromoPage(1);
    }, [promoSearch]);

    const paginatedProducts = useMemo(() => {
        const start = (productPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, productPage]);

    const paginatedPromos = useMemo(() => {
        const start = (promoPage - 1) * PROMOS_PER_PAGE;
        return filteredPromos.slice(start, start + PROMOS_PER_PAGE);
    }, [filteredPromos, promoPage]);

    const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const totalPromoPages = Math.ceil(filteredPromos.length / PROMOS_PER_PAGE);

    const { data: adminUsers, isLoading: loadingAdminUsers } = useQuery<any[]>({
        queryKey: ["/api/admin/users"],
        enabled: !!user && (user as any).role === "superadmin",
        staleTime: 300000,
        refetchOnWindowFocus: false,
    });

    // Analytics Processing
    const evolutionData = useMemo(() => {
        if (!messages) return [];

        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return {
                month: format(date, 'MMM', { locale: fr }),
                fullDate: date,
                count: 0
            };
        });

        messages.forEach(msg => {
            const msgDate = new Date(msg.createdAt || "");
            const monthIndex = last6Months.findIndex(m =>
                m.fullDate.getMonth() === msgDate.getMonth() &&
                m.fullDate.getFullYear() === msgDate.getFullYear()
            );
            if (monthIndex !== -1) {
                last6Months[monthIndex].count++;
            }
        });

        return last6Months;
    }, [messages]);

    const stats = useMemo(() => {
        const total = messages?.length || 0;
        const now = new Date();
        const thisMonth = messages?.filter(m => {
            const d = new Date(m.createdAt || "");
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length || 0;

        const lastMonthDate = subMonths(now, 1);
        const lastMonth = messages?.filter(m => {
            const d = new Date(m.createdAt || "");
            return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        }).length || 0;

        const growth = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

        return { total, thisMonth, growth, lastMonth };
    }, [messages]);

    // Mutations
    const createProductMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/products", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Erreur lors de la création");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produit ajouté avec succès" });
            setSelectedCategory("");
        },
        onError: () => {
            toast({ variant: "destructive", title: "Erreur lors de l'ajout du produit" });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produit supprimé" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Impossible de supprimer le produit" });
        },
    });

    const createPromoMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/promos", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Erreur lors de la création");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
            toast({ title: "Promotion ajoutée avec succès" });
            setSelectedPromoCategory("all");
        },
        onError: () => {
            toast({ variant: "destructive", title: "Erreur lors de l'ajout de la promotion" });
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Partial<Product> }) => {
            const res = await apiRequest("PATCH", `/api/products/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            setEditingProduct(null);
            toast({ title: "Produit mis à jour" });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Erreur lors de la mise à jour",
                description: error.message
            });
        }
    });

    const updatePromoMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Partial<Promo> }) => {
            const res = await apiRequest("PATCH", `/api/promos/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
            setEditingPromo(null);
            toast({ title: "Promotion mise à jour" });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Erreur lors de la mise à jour",
                description: error.message
            });
        }
    });

    const deletePromoMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/promos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
            toast({ title: "Promotion supprimée" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Impossible de supprimer la promotion" });
        },
    });

    const deleteMessageMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/messages/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
            toast({ title: "Message supprimé" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Impossible de supprimer le message" });
        },
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (settings: Partial<Settings>) => {
            const res = await apiRequest("PATCH", "/api/settings", settings);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
            toast({ title: "Paramètres mis à jour avec succès" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Erreur lors de la mise à jour" });
        },
    });


    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/admin/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Accès révoqué", description: "Le compte a été supprimé avec succès." });
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/user/change-password", data);
        },
        onSuccess: () => {
            toast({ title: "Succès", description: "Votre mot de passe a été mis à jour avec succès." });
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        }
    });

    const createAdminUserMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/admin/users", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Succès", description: "Nouvel administrateur ajouté avec succès." });
        },
        onError: (error: Error) => {
            console.error("[DEBUG] Erreur création admin:", error);
            // If the error message starts with "Unexpected token", it's a parsing error
            const displayError = error.message.includes("Unexpected token")
                ? "Le serveur a renvoyé une réponse invalide. Veuillez vérifier les logs."
                : error.message;
            toast({ variant: "destructive", title: "Erreur", description: displayError });
        }
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            await apiRequest("POST", "/api/forgot-password", { email });
        },
        onSuccess: () => {
            toast({ title: "Code envoyé", description: "Un code de confirmation a été envoyé à votre adresse email." });
            setView("reset");
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/reset-password", data);
        },
        onSuccess: () => {
            toast({ title: "Succès", description: "Votre mot de passe a été réinitialisé. Connectez-vous avec vos nouveaux accès." });
            setResetCode("");
            setPassword("");
            setConfirmPassword("");
            setIsCodeVerified(false);
            setView("auth");
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        }
    });

    const verifyCodeMutation = useMutation({
        mutationFn: async (data: { email: string, code: string }) => {
            await apiRequest("POST", "/api/verify-code", data);
        },
        onSuccess: () => {
            setIsCodeVerified(true);
            toast({ title: "Code valide", description: "Veuillez maintenant saisir votre nouveau mot de passe." });
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Code invalide", description: error.message });
        }
    });

    // Sticker Catalogs Mutations
    const { data: stickerCatalogs, isLoading: loadingStickerCatalogs } = useQuery<any[]>({
        queryKey: ["/api/stickers"],
        enabled: !!user,
    });

    const createStickerMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/stickers", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Erreur lors de l'envoi");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/stickers"] });
            toast({ title: "Catalogue ajouté" });
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        }
    });

    const deleteStickerMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/stickers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/stickers"] });
            toast({ title: "Catalogue supprimé" });
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        }
    });


    const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Ensure Select values are present in FormData if they aren't automatically picked up
        // (Radix Select with name attribute should work, but being explicit is safer with controlled state)
        if (!formData.get("category") && selectedCategory) formData.set("category", selectedCategory);

        createProductMutation.mutate(formData, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    const handleAddPromo = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        if (!formData.get("category") && selectedPromoCategory && selectedPromoCategory !== "all") {
            formData.set("category", selectedPromoCategory);
        }

        createPromoMutation.mutate(formData, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    if (loadingUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <AdminBackground />
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    if (!user) {
        return (
            <div className="min-h-screen font-sans flex items-center justify-center px-4 py-12 relative overflow-hidden">
                <AdminBackground />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="bg-white/70 backdrop-blur-2xl p-2 rounded-3xl shadow-2xl border-white/20">
                        <CardHeader className="text-center space-y-2 pb-6">
                            <CardTitle className="text-3xl font-bold font-display text-slate-900">
                                {view === "forgot" ? "Réinitialisation" :
                                    view === "reset" ? "Nouveau Mot de passe" :
                                        "Administration"}
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                {view === "forgot" ? "Entrez votre email pour recevoir votre code" :
                                    view === "reset" ? "Saisissez le code reçu par email et votre nouveau mot de passe" :
                                        "Gérez vos produits, messages et promotions"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {view === "auth" && (
                                <>
                                    <form onSubmit={handleAuth} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Identifiant</Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                placeholder="admin"
                                                className="h-11 bg-slate-50 border-slate-200 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="password">Mot de passe</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => setView("forgot")}
                                                    className="text-[11px] font-bold text-primary hover:underline"
                                                >
                                                    Mot de passe oublié ?
                                                </button>
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="h-11 bg-slate-50 border-slate-200 focus:ring-primary/20"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? (
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <KeyRound className="h-5 w-5" />
                                                    Se connecter
                                                </div>
                                            )}
                                        </Button>
                                    </form>


                                </>
                            )}

                            {view === "forgot" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        forgotPasswordMutation.mutate(email);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="reset-email">Votre Email</Label>
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="admin@example.com"
                                            className="h-11 bg-slate-50 border-slate-200"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 font-bold bg-primary"
                                        disabled={forgotPasswordMutation.isPending}
                                    >
                                        {forgotPasswordMutation.isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                        ) : (
                                            "Envoyer le code"
                                        )}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setView("auth")}
                                        className="w-full text-sm font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        Retour à la connexion
                                    </button>
                                </form>
                            )}

                            {view === "reset" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!isCodeVerified) {
                                            verifyCodeMutation.mutate({ email, code: resetCode });
                                        } else {
                                            if (password !== confirmPassword) {
                                                return toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas" });
                                            }
                                            resetPasswordMutation.mutate({ email, code: resetCode, newPassword: password });
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="reset-code">Code de confirmation</Label>
                                        <div className="relative">
                                            <Input
                                                id="reset-code"
                                                value={resetCode}
                                                onChange={(e) => {
                                                    setResetCode(e.target.value);
                                                    setIsCodeVerified(false);
                                                }}
                                                required
                                                placeholder="••••••••"
                                                maxLength={8}
                                                disabled={isCodeVerified || verifyCodeMutation.isPending}
                                                className={`h - 11 bg - slate - 50 border - slate - 200 tracking - [0.2em] text - center font - bold text - lg ${resetCode.length > 0 && !/^[a-fA-F0-9]{0,8}$/.test(resetCode) ? 'border-red-400' : (resetCode.length > 0 && resetCode.length !== 8 ? 'border-orange-400' : '')} `}
                                            />
                                            {isCodeVerified && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            )}
                                        </div>
                                        {resetCode.length > 0 && !/^[a-fA-F0-9]*$/.test(resetCode) && (
                                            <p className="text-[10px] text-red-500 font-bold italic">Caractères invalides (hex uniquement)</p>
                                        )}
                                        {resetCode.length > 0 && resetCode.length !== 8 && /^[a-fA-F0-9]*$/.test(resetCode) && (
                                            <p className="text-[10px] text-orange-500 font-bold italic">Le code doit faire 8 caractères</p>
                                        )}
                                    </div>

                                    {!isCodeVerified ? (
                                        <Button
                                            type="submit"
                                            className="w-full h-11 font-bold bg-slate-900"
                                            disabled={verifyCodeMutation.isPending || resetCode.length !== 8 || !/^[a-fA-F0-9]{8}$/.test(resetCode)}
                                        >
                                            {verifyCodeMutation.isPending ? (
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                            ) : (
                                                "Vérifier le code"
                                            )}
                                        </Button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    className={`h - 11 bg - slate - 50 border - slate - 200 ${password.length > 0 && password.length < 6 ? 'border-red-400' : ''} `}
                                                />
                                                {password.length > 0 && password.length < 6 && (
                                                    <p className="text-[10px] text-red-500 font-bold italic">Minimum 6 caractères</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    className={`h - 11 bg - slate - 50 border - slate - 200 ${confirmPassword.length > 0 && password !== confirmPassword ? 'border-red-400' : ''} `}
                                                />
                                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                                    <p className="text-[10px] text-red-500 font-bold italic">Les mots de passe ne correspondent pas</p>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full h-11 font-bold bg-primary"
                                                disabled={
                                                    resetPasswordMutation.isPending ||
                                                    password.length < 6 ||
                                                    password !== confirmPassword
                                                }
                                            >
                                                {resetPasswordMutation.isPending ? (
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                ) : (
                                                    "Changer le mot de passe"
                                                )}
                                            </Button>
                                        </motion.div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isCodeVerified) {
                                                setIsCodeVerified(false);
                                            } else {
                                                setView("forgot");
                                            }
                                        }}
                                        className="w-full text-sm font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        {isCodeVerified ? "Changer de code" : "Retour"}
                                    </button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen font-sans flex flex-col relative text-slate-100">
                <AdminBackground />
                <div className="pt-32 pb-12 bg-white/5 backdrop-blur-md border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <h1 className="text-4xl font-display font-bold text-white mb-2">Tableau de Bord</h1>
                                <p className="text-slate-300">
                                    Bienvenue, <span className="font-bold text-primary-foreground">{user.username}</span>. Voici les dernières activités de votre vitrine.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnexion
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    <Tabs defaultValue="dashboard" className="w-full">
                        <TabsList className={`flex flex-wrap h-auto w-full max-w-4xl mx-auto mb-12 bg-white/10 p-1.5 rounded-2xl shadow-2xl border border-white/20`}>
                            <TabsTrigger
                                value="dashboard"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold"
                            >
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger
                                value="messages"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold relative"
                            >
                                Messages
                                {messages && messages.filter(m => !m.read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                                        {messages.filter(m => !m.read).length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="products"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold"
                            >
                                Produits
                            </TabsTrigger>
                            <TabsTrigger
                                value="promos"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold"
                            >
                                Promos
                            </TabsTrigger>
                            <TabsTrigger
                                value="stickers"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold"
                            >
                                Stickers
                            </TabsTrigger>
                            {(user as any).role === "superadmin" && (
                                <TabsTrigger
                                    value="team"
                                    className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold"
                                >
                                    Équipe
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="settings"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold"
                            >
                                Paramètres
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard" className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="rounded-3xl border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Messages Totaux</p>
                                                <h3 className="text-4xl font-black text-white">{stats.total}</h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-foreground">
                                                <MessagesSquare className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center text-sm font-bold text-slate-500">
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Depuis le lancement
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Ce mois-ci</p>
                                                <h3 className="text-4xl font-black text-white">{stats.thisMonth}</h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className={`mt-6 flex items-center text-sm font-bold ${stats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.growth >= 0 ? '+' : ''}{stats.growth}%
                                            <span className="text-slate-500 ml-2 font-medium">vs mois dernier</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Catalogue</p>
                                                <h3 className="text-4xl font-black text-white">{products?.length || 0}</h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                                <Package className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center text-sm font-bold text-slate-500">
                                            Produits en ligne
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="rounded-3xl border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md p-8 mb-12">
                                <CardHeader className="p-0 mb-8">
                                    <CardTitle className="text-2xl font-bold font-display text-white flex items-center gap-3">
                                        <TrendingUp className="text-primary-foreground h-6 w-6" />
                                        Évolution des demandes
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 font-medium">Nombre de messages reçus au cours des 6 derniers mois</CardDescription>
                                </CardHeader>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={evolutionData}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                    fontWeight: 'bold',
                                                    padding: '12px 16px'
                                                }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                name="Messages"
                                                fill="url(#colorCount)"
                                                radius={[8, 8, 0, 0]}
                                                barSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="messages">
                            {!messages || messages.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                        <Loader2 className="h-10 w-10" />
                                    </div>
                                    <p className="text-slate-500 text-lg font-medium">Aucun message reçu pour le moment.</p>
                                </div>
                            ) : (
                                <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/10">
                                                    <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Date</th>
                                                    <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Nom</th>
                                                    <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Téléphone</th>
                                                    <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Message</th>
                                                    <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Articles</th>
                                                    <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {messages.map((msg) => {
                                                    let selectedItems = [];
                                                    try {
                                                        selectedItems = msg.selectedItems ? JSON.parse(msg.selectedItems) : [];
                                                    } catch (e) {
                                                        console.error("Failed to parse selected items", e);
                                                    }

                                                    return (
                                                        <tr key={msg.id} className="hover:bg-white/5 transition-colors group">
                                                            <td className="p-5 text-slate-400 whitespace-nowrap text-sm font-medium">
                                                                {new Date(msg.createdAt || "").toLocaleString("fr-FR", {
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </td>
                                                            <td className="p-5 text-slate-100 font-bold">{msg.name}</td>
                                                            <td className="p-5">
                                                                <a href={`tel:${msg.phone} `} className="text-primary-foreground hover:text-white transition-colors font-bold flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px]">📞</div>
                                                                    {msg.phone}
                                                                </a>
                                                            </td>
                                                            <td className="p-5 text-slate-300 max-w-xs break-words text-sm leading-relaxed">{msg.message}</td>
                                                            <td className="p-5">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {selectedItems.map((item: any, idx: number) => (
                                                                        <div key={idx} className="relative group hover:scale-110 transition-transform cursor-help" title={item.name}>
                                                                            <img
                                                                                src={item.imageUrl}
                                                                                alt={item.name}
                                                                                loading="lazy"
                                                                                className="w-12 h-12 rounded-xl object-cover border-2 border-white/10 shadow-lg"
                                                                            />
                                                                            <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-slate-900 shadow-xl">
                                                                                {item.quantity}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="p-5 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                                                                    onClick={() => {
                                                                        if (confirm("Voulez-vous vraiment supprimer ce message ?")) {
                                                                            deleteMessageMutation.mutate(msg.id);
                                                                        }
                                                                    }}
                                                                    disabled={deleteMessageMutation.isPending}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="products">
                            <div className="grid lg:grid-cols-3 gap-10">
                                <Card className="lg:col-span-1 h-fit rounded-3xl border-white/20 shadow-2xl sticky top-28 overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardHeader className="bg-white/5 border-b border-white/10 pb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                                            <Plus className="text-secondary-foreground h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-2xl text-white">Ajouter un produit</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Enrichissez votre catalogue avec de nouveaux articles.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-8">
                                        <form onSubmit={handleAddProduct} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Image de présentation</Label>
                                                <Input
                                                    name="image"
                                                    type="file"
                                                    required
                                                    accept="image/*"
                                                    className="cursor-pointer bg-white/5 border-white/10 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Nom de l'article</Label>
                                                <Input name="name" required placeholder="Ex: Boîte Prestige" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Catégorie</Label>
                                                <Select
                                                    name="category"
                                                    required
                                                    value={selectedCategory}
                                                    onValueChange={setSelectedCategory}
                                                >
                                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 backdrop-blur-sm font-medium focus:ring-primary/30 transition-all hover:bg-white/10 text-white">
                                                        <SelectValue placeholder="Sélectionnez..." />
                                                    </SelectTrigger>
                                                    <SelectContent side="bottom" avoidCollisions={false} sideOffset={4} className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border-white/10 shadow-2xl text-white">
                                                        {PRODUCT_CATEGORIES.map((cat) => (
                                                            <SelectItem key={cat} value={cat} className="rounded-xl py-3 cursor-pointer focus:bg-primary focus:text-white transition-colors">
                                                                {cat}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Description courte</Label>
                                                <Textarea name="description" required placeholder="Détails techniques, dimensions, etc..." className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-500" />
                                            </div>
                                            <Button type="submit" className="w-full h-12 font-bold transition-all hover:shadow-lg rounded-xl shadow-primary/20" disabled={createProductMutation.isPending}>
                                                {createProductMutation.isPending ? (
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Plus className="h-5 w-5" /> Ajouter au catalogue
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="lg:col-span-2">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                        <h3 className="text-2xl font-bold font-display text-white flex items-center gap-3">
                                            Vos articles récents
                                            <span className="text-sm font-normal text-slate-300 bg-white/10 px-3 py-1 rounded-full">{filteredProducts.length}</span>
                                        </h3>
                                        <div className="relative w-full md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Rechercher un produit..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10 rounded-xl"
                                            />
                                            {productSearch && (
                                                <button
                                                    onClick={() => setProductSearch("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {loadingProducts ? (
                                        <div className="flex justify-center py-24">
                                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 dashed border-dashed">
                                            <p className="text-slate-400 italic font-medium">
                                                {productSearch ? "Aucun résultat pour votre recherche." : "Aucun produit dans le catalogue."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                {paginatedProducts.map((product) => (
                                                    <motion.div
                                                        layout
                                                        key={product.id}
                                                        className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
                                                    >
                                                        <div className="flex gap-5 items-start">
                                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900/50 flex-shrink-0 border border-white/10">
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    loading="lazy"
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-16">
                                                                <h4 className="font-bold text-white truncate text-lg">{product.name}</h4>
                                                                <div className="inline-block bg-primary/20 text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 mb-2">
                                                                    {product.category}
                                                                </div>
                                                                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
                                                            </div>
                                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl"
                                                                    onClick={() => {
                                                                        setEditingProduct(product);
                                                                    }}
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                                                                    onClick={() => {
                                                                        if (confirm("Supprimer definitivement ?")) deleteProductMutation.mutate(product.id)
                                                                    }}
                                                                    disabled={deleteProductMutation.isPending}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <AdminPagination
                                                currentPage={productPage}
                                                totalPages={totalProductPages}
                                                onPageChange={setProductPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white rounded-3xl max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>Modifier le produit</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nom de l'article</Label>
                                            <Input
                                                value={editingProduct?.name || ""}
                                                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                className="bg-white/5 border-white/10 h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Catégorie</Label>
                                            <Select
                                                value={editingProduct?.category || ""}
                                                onValueChange={(val) => setEditingProduct(prev => prev ? { ...prev, category: val } : null)}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 text-white border-white/10">
                                                    {PRODUCT_CATEGORIES.map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={editingProduct?.description || ""}
                                                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                className="bg-white/5 border-white/10 min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setEditingProduct(null)} className="rounded-xl">Annuler</Button>
                                        <Button
                                            onClick={() => editingProduct && updateProductMutation.mutate({
                                                id: editingProduct.id,
                                                data: {
                                                    name: editingProduct.name,
                                                    category: editingProduct.category,
                                                    description: editingProduct.description
                                                }
                                            })}
                                            disabled={updateProductMutation.isPending}
                                            className="rounded-xl font-bold"
                                        >
                                            {updateProductMutation.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>

                        <TabsContent value="promos">
                            <div className="grid lg:grid-cols-3 gap-10">
                                <Card className="lg:col-span-1 h-fit rounded-3xl border-white/20 shadow-2xl sticky top-28 overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardHeader className="bg-white/5 border-b border-white/10 pb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                                            <Upload className="text-secondary-foreground h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-2xl text-white">Nouvelle campagne</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Mettez en avant vos offres exceptionnelles sur la page d'accueil.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-8">
                                        <form onSubmit={handleAddPromo} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Visuel promotionnel</Label>
                                                <Input
                                                    name="image"
                                                    type="file"
                                                    required
                                                    accept="image/*"
                                                    className="cursor-pointer bg-white/5 border-white/10 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Titre de l'offre (Optionnel)</Label>
                                                <Input name="productName" placeholder="Ex: Spécial Mariage" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Rayon concerné</Label>
                                                <Select
                                                    name="category"
                                                    value={selectedPromoCategory}
                                                    onValueChange={setSelectedPromoCategory}
                                                >
                                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 backdrop-blur-sm font-medium focus:ring-primary/30 transition-all hover:bg-white/10 text-white">
                                                        <SelectValue placeholder="Toutes catégories" />
                                                    </SelectTrigger>
                                                    <SelectContent side="bottom" avoidCollisions={false} sideOffset={4} className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border-white/10 shadow-2xl text-white">
                                                        <SelectItem value="all" className="rounded-xl py-3 cursor-pointer focus:bg-primary focus:text-white transition-colors">
                                                            Toutes catégories
                                                        </SelectItem>
                                                        {PRODUCT_CATEGORIES.map((cat) => (
                                                            <SelectItem key={cat} value={cat} className="rounded-xl py-3 cursor-pointer focus:bg-primary focus:text-white transition-colors">
                                                                {cat}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-slate-300 font-bold">Message promotionnel</Label>
                                                <Textarea name="description" placeholder="Ex: Jusqu'à -30% sur toute la collection..." className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-500" />
                                            </div>

                                            <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-primary/20" disabled={createPromoMutation.isPending}>
                                                {createPromoMutation.isPending ? (
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Upload className="h-5 w-5" /> Publier l'offre
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="lg:col-span-2">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                        <h3 className="text-2xl font-bold font-display text-white">Promotions en ligne</h3>
                                        <div className="relative w-full md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Rechercher une promo..."
                                                value={promoSearch}
                                                onChange={(e) => setPromoSearch(e.target.value)}
                                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10 rounded-xl"
                                            />
                                            {promoSearch && (
                                                <button
                                                    onClick={() => setPromoSearch("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {loadingPromos ? (
                                        <div className="flex justify-center py-24">
                                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        </div>
                                    ) : filteredPromos.length === 0 ? (
                                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 dashed border-dashed">
                                            <p className="text-slate-400 italic font-medium">
                                                {promoSearch ? "Aucun résultat pour votre recherche." : "Aucune promotion active pour le moment."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 gap-8">
                                                {paginatedPromos.map((promo) => (
                                                    <motion.div
                                                        layout
                                                        key={promo.id}
                                                        className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden group relative"
                                                    >
                                                        <div className="flex flex-col md:flex-row h-full">
                                                            <div className="w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
                                                                <img
                                                                    src={promo.imageUrl}
                                                                    alt="Offre"
                                                                    loading="lazy"
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                            </div>
                                                            <div className="p-8 flex-1 flex flex-col justify-center">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <h4 className="text-2xl font-bold text-white mb-1">{promo.productName || "Offre Spéciale"}</h4>
                                                                        <span className="text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] bg-primary/20 px-2 py-0.5 rounded-md">
                                                                            {promo.category || "Offre Globale"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="rounded-xl border-white/10 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                                            onClick={() => {
                                                                                setEditingPromo(promo);
                                                                            }}
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="rounded-xl border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                                                            onClick={() => {
                                                                                if (confirm("Supprimer cette promo ?")) deletePromoMutation.mutate(promo.id)
                                                                            }}
                                                                            disabled={deletePromoMutation.isPending}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-300 leading-relaxed font-medium italic border-l-4 border-primary/40 pl-6 my-4">
                                                                    {promo.description}
                                                                </p>
                                                                <div className="mt-4 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                                    <span className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                                        Campagne Active
                                                                    </span>
                                                                    <span>Publiée le {new Date(promo.createdAt || "").toLocaleDateString("fr-FR")}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <AdminPagination
                                                currentPage={promoPage}
                                                totalPages={totalPromoPages}
                                                onPageChange={setPromoPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Dialog open={!!editingPromo} onOpenChange={(open) => !open && setEditingPromo(null)}>
                                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white rounded-3xl max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>Modifier la promotion</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Titre de l'offre</Label>
                                            <Input
                                                value={editingPromo?.productName || ""}
                                                onChange={(e) => setEditingPromo(prev => prev ? { ...prev, productName: e.target.value } : null)}
                                                className="bg-white/5 border-white/10 h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Catégorie</Label>
                                            <Select
                                                value={editingPromo?.category || ""}
                                                onValueChange={(val) => setEditingPromo(prev => prev ? { ...prev, category: val } : null)}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 text-white border-white/10">
                                                    <SelectItem value="all">Toutes catégories</SelectItem>
                                                    {PRODUCT_CATEGORIES.map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={editingPromo?.description || ""}
                                                onChange={(e) => setEditingPromo(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                className="bg-white/5 border-white/10 min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setEditingPromo(null)} className="rounded-xl">Annuler</Button>
                                        <Button
                                            onClick={() => editingPromo && updatePromoMutation.mutate({
                                                id: editingPromo.id,
                                                data: {
                                                    productName: editingPromo.productName,
                                                    category: editingPromo.category,
                                                    description: editingPromo.description
                                                }
                                            })}
                                            disabled={updatePromoMutation.isPending}
                                            className="rounded-xl font-bold"
                                        >
                                            {updatePromoMutation.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>

                        <TabsContent value="stickers">
                            <div className="grid lg:grid-cols-3 gap-10">
                                <Card className="lg:col-span-1 h-fit rounded-3xl border-white/20 shadow-2xl sticky top-28 overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardHeader className="bg-white/5 border-b border-white/10 pb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                                            <ImageIcon className="text-secondary-foreground h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-2xl text-white">Nouveau Catalogue</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Ajoutez un nouveau catalogue d'images pour vos stickers.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-8 text-left">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const form = e.currentTarget;
                                                const formData = new FormData(form);
                                                createStickerMutation.mutate(formData, {
                                                    onSuccess: () => form.reset()
                                                });
                                            }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2 text-left">
                                                <Label className="text-slate-300 font-bold">Image du Catalogue</Label>
                                                <Input
                                                    name="image"
                                                    type="file"
                                                    required
                                                    accept="image/*"
                                                    className="cursor-pointer bg-white/5 border-white/10 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                                                />
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <Label className="text-slate-300 font-bold">Titre</Label>
                                                <Input name="title" required placeholder="Ex: Stickers Mariage" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <Label className="text-slate-300 font-bold">Description</Label>
                                                <Textarea name="description" placeholder="Courte description du contenu..." className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-500" />
                                            </div>
                                            <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-primary/20" disabled={createStickerMutation.isPending}>
                                                {createStickerMutation.isPending ? (
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Plus className="h-5 w-5" /> Ajouter le catalogue
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="lg:col-span-2">
                                    <h3 className="text-2xl font-bold font-display text-white mb-8">Catalogues en ligne</h3>
                                    {loadingStickerCatalogs ? (
                                        <div className="flex justify-center py-24">
                                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        </div>
                                    ) : !stickerCatalogs || stickerCatalogs.length === 0 ? (
                                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 dashed border-dashed">
                                            <p className="text-slate-400 italic font-medium">Aucun catalogue disponible.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {stickerCatalogs.map((catalog) => (
                                                <motion.div
                                                    layout
                                                    key={catalog.id}
                                                    className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl group relative overflow-hidden"
                                                >
                                                    <div className="flex gap-6 items-center">
                                                        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 border border-orange-500/20 overflow-hidden">
                                                            {catalog.imageUrl ? (
                                                                <img src={catalog.imageUrl} alt={catalog.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon className="w-8 h-8" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <h4 className="font-bold text-white text-lg">{catalog.title}</h4>
                                                            <p className="text-slate-400 text-sm line-clamp-1">{catalog.description}</p>
                                                            <a href={catalog.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">
                                                                Voir l'image
                                                            </a>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                                                            onClick={() => {
                                                                if (confirm("Supprimer ce catalogue ?")) deleteStickerMutation.mutate(catalog.id)
                                                            }}
                                                            disabled={deleteStickerMutation.isPending}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>



                        {(user as any).role === "superadmin" && (
                            <TabsContent value="team" className="space-y-8">
                                <div className="max-w-6xl mx-auto space-y-12">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold font-display text-white">Gestion de l'Équipe</h3>
                                            <p className="text-slate-400">Gérez les accès administrateurs de la vitrine SRED.</p>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-3 gap-10">
                                        <Card className="lg:col-span-1 h-fit rounded-3xl border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                                            <CardHeader className="bg-white/5 border-b border-white/10 pb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                                                    <UserPlus className="text-secondary-foreground h-6 w-6" />
                                                </div>
                                                <CardTitle className="text-2xl text-white">Ajouter un membre</CardTitle>
                                                <CardDescription className="text-slate-400">
                                                    Créez un nouvel accès pour un collaborateur.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-8 text-left">
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        const formData = new FormData(e.currentTarget);
                                                        createAdminUserMutation.mutate({
                                                            username: formData.get("username"),
                                                            email: formData.get("email"),
                                                            password: formData.get("password"),
                                                            role: formData.get("role")
                                                        });
                                                        e.currentTarget.reset();
                                                    }}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold">Identifiant</Label>
                                                        <Input name="username" required placeholder="ex: omar" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold">Email</Label>
                                                        <Input name="email" type="email" required placeholder="omar@example.com" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold">Mot de passe provisoire</Label>
                                                        <Input name="password" type="password" required placeholder="••••••••" className="h-12 bg-white/5 border-white/10 text-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold">Rôle</Label>
                                                        <Select name="role" defaultValue="admin">
                                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 backdrop-blur-sm font-medium focus:ring-primary/30 transition-all hover:bg-white/10 text-white">
                                                                <SelectValue placeholder="Rôle..." />
                                                            </SelectTrigger>
                                                            <SelectContent side="bottom" className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border-white/10 shadow-2xl text-white">
                                                                <SelectItem value="admin" className="rounded-xl py-3 cursor-pointer focus:bg-primary focus:text-white transition-colors">Administrateur</SelectItem>
                                                                <SelectItem value="superadmin" className="rounded-xl py-3 cursor-pointer focus:bg-primary focus:text-white transition-colors">Super Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-primary/20" disabled={createAdminUserMutation.isPending}>
                                                        {createAdminUserMutation.isPending ? (
                                                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <UserPlus className="h-5 w-5" /> Créer le compte
                                                            </div>
                                                        )}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>

                                        <div className="lg:col-span-2">
                                            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
                                                <div className="overflow-x-auto text-left">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-white/5 border-b border-white/10">
                                                                <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Membre</th>
                                                                <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider">Rôle</th>
                                                                <th className="p-5 font-bold text-slate-300 uppercase text-xs tracking-wider text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {loadingAdminUsers ? (
                                                                <tr>
                                                                    <td colSpan={3} className="p-10 text-center">
                                                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                                                    </td>
                                                                </tr>
                                                            ) : adminUsers?.map((admin) => (
                                                                <tr key={admin.id} className="hover:bg-white/5 transition-colors group">
                                                                    <td className="p-5">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-white">{admin.username}</span>
                                                                            <span className="text-xs text-slate-400">{admin.email}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-5">
                                                                        <span className={`px - 3 py - 1 rounded - full text - [10px] font - black uppercase tracking - widest ${admin.role === 'superadmin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'} `}>
                                                                            {admin.role}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-5 text-right">
                                                                        {user.role === "superadmin" && admin.username !== "Mohamed" && admin.id !== user.id && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                                                                                onClick={() => {
                                                                                    if (confirm(`Voulez-vous vraiment révoquer l'accès de ${admin.username} ?`)) {
                                                                                        deleteUserMutation.mutate(admin.id);
                                                                                    }
                                                                                }}
                                                                                disabled={deleteUserMutation.isPending}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </td >
                                                                </tr >
                                                            ))}
                                                        </tbody >
                                                    </table >
                                                </div >
                                            </div >
                                        </div >
                                    </div >
                                </div >
                            </TabsContent >
                        )}

                        <TabsContent value="settings">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <Card className="rounded-3xl border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardHeader className="bg-white/5 border-b border-white/10 pb-8 p-8">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-foreground">
                                                <Instagram className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-white">Réseaux Sociaux & Reels</CardTitle>
                                                <CardDescription className="text-slate-400">Gérez les liens des vidéos qui s'affichent sur votre page d'accueil.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        {loadingSettings ? (
                                            <div className="flex justify-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : (
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.currentTarget);
                                                    updateSettingsMutation.mutate({
                                                        instagramReel: formData.get("instagramReel") as string,
                                                        facebookReel: formData.get("facebookReel") as string,
                                                        tiktokReel: formData.get("tiktokReel") as string,
                                                    });
                                                }}
                                                className="space-y-8"
                                            >
                                                <div className="grid gap-6">
                                                    <div className="space-y-6">
                                                        <Label className="text-slate-300 font-bold block">Image du Catalogue General</Label>
                                                        {currentSettings?.stickersImageUrl && (
                                                            <div className="w-32 h-32 rounded-2xl overflow-hidden border border-white/10">
                                                                <img src={currentSettings.stickersImageUrl} alt="Stickers Banner" className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4">
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const formData = new FormData();
                                                                        formData.append("stickersImage", file);
                                                                        fetch("/api/settings/stickers-image", {
                                                                            method: "PATCH",
                                                                            body: formData
                                                                        }).then(res => {
                                                                            if (res.ok) {
                                                                                queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
                                                                                toast({ title: "Succès", description: "Image mise à jour" });
                                                                            } else {
                                                                                toast({ variant: "destructive", title: "Erreur", description: "Échec de l'upload" });
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                                className="cursor-pointer bg-white/5 border-white/10 h-10 file:mr-2 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white max-w-xs"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold flex items-center gap-2">
                                                            <Instagram className="w-4 h-4 text-pink-500" />
                                                            Lien Instagram Reel
                                                        </Label>
                                                        <Input
                                                            name="instagramReel"
                                                            defaultValue={currentSettings?.instagramReel || ""}
                                                            placeholder="https://www.instagram.com/p/..."
                                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                                        />
                                                        <p className="text-[11px] text-slate-500">Exemple: https://www.instagram.com/p/DTm2ITijqL3/</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold flex items-center gap-2">
                                                            <Facebook className="w-4 h-4 text-blue-500" />
                                                            Lien Facebook Reel / Vidéo
                                                        </Label>
                                                        <Input
                                                            name="facebookReel"
                                                            defaultValue={currentSettings?.facebookReel || ""}
                                                            placeholder="https://www.facebook.com/reels/..."
                                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                                        />
                                                        <p className="text-[11px] text-slate-500">Exemple: https://www.facebook.com/reels/123456789/</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold flex items-center gap-2">
                                                            <FaTiktok className="w-4 h-4 text-white" />
                                                            Lien TikTok Video
                                                        </Label>
                                                        <Input
                                                            name="tiktokReel"
                                                            defaultValue={currentSettings?.tiktokReel || ""}
                                                            placeholder="https://www.tiktok.com/@user/video/..."
                                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                                        />
                                                        <p className="text-[11px] text-slate-500">Exemple: https://www.tiktok.com/@raies/video/123456789</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full h-14 font-bold rounded-2xl shadow-lg shadow-primary/20"
                                                    disabled={updateSettingsMutation.isPending}
                                                >
                                                    {updateSettingsMutation.isPending ? (
                                                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                    ) : (
                                                        "Enregistrer les modifications"
                                                    )}
                                                </Button>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>


                                <Card className="mt-12 rounded-3xl border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                                    <CardHeader className="bg-white/5 border-b border-white/10 pb-8 p-8">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-foreground">
                                                <KeyRound className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-white">Sécurité</CardTitle>
                                                <CardDescription className="text-slate-400">Mettez à jour votre mot de passe administrateur.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const formData = new FormData(e.currentTarget);
                                                const oldPassword = formData.get("oldPassword") as string;
                                                const newPassword = formData.get("newPassword") as string;
                                                const confirmNew = formData.get("confirmNew") as string;

                                                if (newPassword !== confirmNew) {
                                                    return toast({ variant: "destructive", title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas" });
                                                }

                                                changePasswordMutation.mutate({ oldPassword, newPassword });
                                                e.currentTarget.reset();
                                            }}
                                            className="space-y-8"
                                        >
                                            <div className="grid gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-300 font-bold">Ancien mot de passe</Label>
                                                    <Input
                                                        name="oldPassword"
                                                        type="password"
                                                        required
                                                        placeholder="••••••••"
                                                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                                    />
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold">Nouveau mot de passe</Label>
                                                        <Input
                                                            name="newPassword"
                                                            type="password"
                                                            required
                                                            placeholder="••••••••"
                                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300 font-bold">Confirmer le nouveau</Label>
                                                        <Input
                                                            name="confirmNew"
                                                            type="password"
                                                            required
                                                            placeholder="••••••••"
                                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-14 font-bold rounded-2xl shadow-lg shadow-primary/20"
                                                disabled={changePasswordMutation.isPending}
                                            >
                                                {changePasswordMutation.isPending ? (
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                ) : (
                                                    "Mettre à jour le mot de passe"
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs >
                </div >

            </div >
        </>
    );
}
