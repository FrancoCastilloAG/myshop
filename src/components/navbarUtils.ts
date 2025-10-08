import { db } from "../firebaseconfig";
import { ref as dbRef, get as dbGet } from "firebase/database";
import { createUserIfNotExists } from "../firebaseconfig";
import type { User } from "firebase/auth";
import { CartItem } from "../CartContext";

export async function fetchUserRole(user: User | null): Promise<string | null> {
  if (!user) return null;
  await createUserIfNotExists({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  });
  const userDbRef = dbRef(db, `users/${user.uid}/role`);
  const snap = await dbGet(userDbRef);
  return snap.exists() ? snap.val() : null;
}

export async function pagarConMercadoPago(cart: CartItem[], user: User | null, setMpError: (msg: string) => void, setMpLink: (url: string) => void) {
  setMpError("");
  setMpLink("");
  if (!user || !cart.length) return;
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(item => ({
        id: (item as any).id, // Asegúrate que el CartItem tenga id
        selectedSize: item.selectedSize,
        title: item.name,
        quantity: item.quantity,
        currency_id: 'CLP',
        unit_price: typeof item.price === 'number' ? item.price : (typeof item.price === 'string' ? parseInt((item.price as string).replace(/[^\d]/g, '')) : 0)
      })),
      userEmail: user.email
    })
  });
  const data = await res.json();
  if (data.init_point) {
    setMpLink(data.init_point);
    window.location.href = data.init_point;
  } else {
    setMpError(data.error || JSON.stringify(data));
  }
}
