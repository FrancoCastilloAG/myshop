"use client"
import { createContext, useContext, useState } from "react";

export interface CartItem {
  name: string;
  sizes: Record<string, number>;
  price: string;
  img: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (name: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

import { ReactNode } from "react";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: CartItem) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
