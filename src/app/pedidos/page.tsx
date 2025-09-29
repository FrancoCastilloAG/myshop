"use client";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, get as dbGet, onValue } from "firebase/database";
import { CircularProgress } from "@mui/material";
import { db } from "../../firebaseconfig";

export default function PedidosPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const roleSnap = await dbGet(dbRef(db, `users/${firebaseUser.uid}/role`));
        setIsAdmin(roleSnap.exists() && roleSnap.val() === "admin");
        const ordersRef = isAdmin ? dbRef(db, "orders") : dbRef(db, `orders/${firebaseUser.uid}`);
        onValue(ordersRef, snap => {
          const data = snap.val() || {};
          let arr = [];
          if (isAdmin) {
            arr = Object.entries(data).flatMap(([uid, userOrders]: any) =>
              Object.entries(userOrders).map(([oid, order]: any) => ({ id: oid, uid, ...order }))
            );
          } else {
            arr = Object.entries(data).map(([oid, order]: any) => ({ id: oid, ...order }));
          }
          setOrders(arr.reverse());
          setLoading(false);
        });
      } else {
        setOrders([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [isAdmin]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}><CircularProgress /></div>;
  if (!user) return <div style={{ textAlign: 'center', marginTop: 40 }}>Debes iniciar sesión para ver tus pedidos.</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', background: 'rgba(255,255,255,0.18)', borderRadius: 22, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', padding: 32, backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 24, color: '#1976d2', letterSpacing: 1 }}>{isAdmin ? 'Todos los pedidos' : 'Mis pedidos'}</h2>
      {orders.length === 0 ? <div style={{ textAlign: 'center', color: '#888' }}>No hay pedidos.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 14, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.08)', padding: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 17, color: '#1976d2' }}>Pedido #{order.id}</div>
              <div style={{ fontSize: 15, margin: '8px 0' }}>Fecha: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Estado: <b>{order.status || 'Pendiente'}</b></div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Total: <b>${order.total?.toLocaleString() || '—'}</b></div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Productos:
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {order.items?.map((item: any, idx: number) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span> x{item.quantity} ({item.selectedSize})
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ fontSize: 15, color: '#555' }}>Dirección: {order.address ? `${order.address.street}, ${order.address.number} - ${order.address.city}, ${order.address.region}, ${order.address.country}` : '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
