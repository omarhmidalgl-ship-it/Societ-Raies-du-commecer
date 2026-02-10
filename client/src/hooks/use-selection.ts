
import { useState, useEffect } from 'react';

export interface SelectionItem {
    id: number | string;
    name: string;
    description?: string;
    imageUrl?: string;
    type: 'product' | 'promo';
    quantity: number;
}

export function useSelection() {
    const [selection, setSelection] = useState<SelectionItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sred_selection');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Migrating old items that don't have quantity
                    return parsed.map((item: any) => ({
                        ...item,
                        quantity: item.quantity || 1
                    }));
                } catch (e) {
                    console.error('Failed to parse selection', e);
                }
            }
        }
        return [];
    });

    // Initialize/Sync listener
    useEffect(() => {
        const handleSync = () => {
            const saved = localStorage.getItem('sred_selection');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSelection(parsed.map((item: any) => ({
                        ...item,
                        quantity: item.quantity || 1
                    })));
                } catch (e) {
                    console.error('Failed to parse selection', e);
                }
            } else {
                setSelection([]);
            }
        };

        window.addEventListener('selection-updated', handleSync);
        return () => window.removeEventListener('selection-updated', handleSync);
    }, []);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('sred_selection', JSON.stringify(selection));
        // Dispatch custom event for cross-tab or cross-component sync if needed
        window.dispatchEvent(new Event('selection-updated'));
    }, [selection]);

    const addToSelection = (item: Omit<SelectionItem, 'quantity'> & { quantity?: number }) => {
        setSelection(prev => {
            const existing = prev.find(i => i.id === item.id && i.type === item.type);
            if (existing) {
                // If it exists, we could either do nothing or increment. 
                // Given the request "he can buy two", let's increment if added again or just let them manage in cart.
                // For now, let's keep it simple: if exists, don't add duplicate, user manages quantity in Cart.
                return prev;
            }
            return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
    };

    const removeFromSelection = (id: number | string, type: 'product' | 'promo') => {
        setSelection(prev => prev.filter(i => !(i.id === id && i.type === type)));
    };

    const updateQuantity = (id: number | string, type: 'product' | 'promo', quantity: number) => {
        setSelection(prev => prev.map(item =>
            (item.id === id && item.type === type)
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
        ));
    };

    const clearSelection = () => {
        setSelection([]);
    };

    const isSelected = (id: number | string, type: 'product' | 'promo') => {
        return !!selection.find(i => i.id === id && i.type === type);
    };

    return {
        selection,
        addToSelection,
        removeFromSelection,
        updateQuantity,
        clearSelection,
        isSelected,
        count: selection.length,
        totalItems: selection.reduce((sum, item) => sum + item.quantity, 0)
    };
}
