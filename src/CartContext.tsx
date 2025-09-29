"use client"
export const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  removeQuantity: () => {},
  clearCart: () => {},
});
import { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  name: string;
  sizes: Record<string, number>;
  price: number;
  img: string;
  selectedSize: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (name: string, selectedSize: string) => void;
  removeQuantity: (name: string, selectedSize: string, qty: number) => void;
  clearCart: () => void;
}


export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Persist cart in localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartItem) => {
    setCart((prev) => {
      // Si el producto tiene imageUrl pero no img, usa imageUrl como img
      const prodWithImg = {
        ...product,
        img: product.img || (product as any).imageUrl || '',
      };
      const idx = prev.findIndex(
        (item) => item.name === prodWithImg.name && item.selectedSize === prodWithImg.selectedSize
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += prodWithImg.quantity;
        return updated;
      }
      return [...prev, prodWithImg];
    });
  };

  const removeFromCart = (name: string, selectedSize: string) => {
    setCart((prev) => prev.filter((item) => !(item.name === name && item.selectedSize === selectedSize)));
  };

  const removeQuantity = (name: string, selectedSize: string, qty: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.name === name && item.selectedSize === selectedSize) {
            const newQty = item.quantity - qty;
            if (newQty > 0) return { ...item, quantity: newQty };
            return null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, removeQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
