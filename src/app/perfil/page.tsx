"use client";
import React, { useEffect, useState } from "react";
import { listenUserData, UserData } from "../../userUtils";
import { signOut, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { db } from "../../firebaseconfig";
import { ref as dbRef, get as dbGet, set as dbSet, update as dbUpdate } from "firebase/database";
import { CircularProgress } from "@heroui/react";
import MuiButton from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';

export default function PerfilPage() {
  const [userData, setUserData] = useState<UserData>({ user: null, uid: null, role: null, address: null });
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({
    street: "",
    number: "",
    city: "",
    region: "",
    country: ""
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = listenUserData((data) => {
      setUserData(data);
      setLoading(false);
      if (data.uid) {
        // Cargar direcciones (hasta 2)
        const addressesRef = dbRef(db, `users/${data.uid}/addresses`);
        dbGet(addressesRef).then(snap => {
          if (snap.exists()) setAddresses(snap.val());
          else setAddresses([]);
        });
        // Cargar pedidos del usuario
        setOrdersLoading(true);
        const ordersRef = dbRef(db, `orders/${data.uid}`);
        dbGet(ordersRef).then(snap => {
          if (snap.exists()) {
            const dataOrders = snap.val();
            const arr = Object.entries(dataOrders).map(([oid, order]: any) => ({ id: oid, ...order }));
            setOrders(arr.reverse());
          } else {
            setOrders([]);
          }
          setOrdersLoading(false);
        });
      } else {
        setOrders([]);
        setOrdersLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!userData.user) {
    router.replace("/");
    return null;
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2>Perfil de Usuario</h2>
  <div><b>Email:</b> {userData.user?.email}</div>
  <div><b>Nombre:</b> {userData.user?.displayName || '-'}</div>
  <div><b>UID:</b> {userData.uid}</div>
  <div><b>Rol:</b> {userData.role ?? <span style={{ color: 'red' }}>No encontrado</span>}</div>
  {userData.role === 'admin' && (
        <button onClick={() => window.location.href = '/admin'} style={{ marginTop: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
          Ir al panel de Admin
        </button>
      )}
      <div style={{ margin: '12px 0 4px 0', fontWeight: 500 }}>Resumen de compras:</div>
      {ordersLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
          <CircularProgress size="lg" color="primary" />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ fontSize: 13, color: '#888' }}>No tienes compras registradas.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12 }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: '#f7f7fa', borderRadius: 10, padding: 12, boxShadow: '0 1px 4px 0 rgba(33,150,243,0.07)' }}>
              <div style={{ fontWeight: 600, color: '#1976d2', fontSize: 15 }}>Pedido #{order.id}</div>
              <div style={{ fontSize: 14 }}>Fecha: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</div>
              <div style={{ fontSize: 14 }}>Estado: <b>{order.status || 'Pendiente'}</b></div>
              <div style={{ fontSize: 14 }}>Total: <b>${order.total?.toLocaleString() || '—'}</b></div>
              <div style={{ fontSize: 14 }}>Productos:
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {order.items?.map((item: any, idx: number) => (
                    <li key={idx} style={{ marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span> x{item.quantity} ({item.selectedSize})
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>Dirección: {order.address ? `${order.address.street}, ${order.address.number} - ${order.address.city}, ${order.address.region}, ${order.address.country}` : '—'}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ margin: '18px 0 8px 0', fontWeight: 500 }}>Direcciones de envío:</div>
      {addresses.map((addr, idx) => (
        <div key={idx} style={{ background: '#f7f7fa', borderRadius: 8, padding: 10, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {addr.street}, {addr.number} - {addr.city}, {addr.region}, {addr.country}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <MuiButton size="small" variant="outlined" color="error" onClick={async () => {
              const newAddresses = addresses.filter((_, i) => i !== idx);
              await dbSet(dbRef(db, `users/${userData.uid}/addresses`), newAddresses);
              setAddresses(newAddresses);
              if (selectedAddressIdx === idx) setSelectedAddressIdx(0);
            }}>
              <DeleteIcon fontSize="small" />
            </MuiButton>
          </div>
        </div>
      ))}
      {addresses.length < 2 && (
        <form onSubmit={async e => {
          e.preventDefault();
          setAddressLoading(true);
          const newAddresses = [...addresses, address];
          await dbSet(dbRef(db, `users/${userData.uid}/addresses`), newAddresses);
          setAddresses(newAddresses);
          setAddress({ street: "", number: "", city: "", region: "", country: "" });
          setAddressLoading(false);
          setAddressSaved(true);
          setTimeout(() => setAddressSaved(false), 2000);
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Calle"
              value={address.street}
              onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
              required
              style={{ flex: 2, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="Número"
              value={address.number}
              onChange={e => setAddress(a => ({ ...a, number: e.target.value }))}
              required
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="Ciudad"
              value={address.city}
              onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
              required
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="Región"
              value={address.region}
              onChange={e => setAddress(a => ({ ...a, region: e.target.value }))}
              required
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="País"
              value={address.country}
              onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
              required
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" disabled={addressLoading} style={{ marginTop: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
            {addressLoading ? 'Guardando...' : 'Agregar dirección'}
          </button>
          {addressSaved && <div style={{ color: 'green', marginTop: 6 }}>¡Dirección guardada!</div>}
        </form>
      )}
      <button onClick={async () => { await signOut(getAuth()); router.replace("/"); }} style={{ marginTop: 16, background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  );
}
