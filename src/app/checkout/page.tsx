"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../CartContext";
import { getUserData, listenUserData, UserData } from "../../userUtils";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


export default function CheckoutPage() {
  const [resumenLoading, setResumenLoading] = useState(false);
  const [resumenMsg, setResumenMsg] = useState("");

  // Enviar resumen por correo
  const handleEnviarResumen = async () => {
    setResumenLoading(true);
    setResumenMsg("");
    try {
      const selectedAddress = addresses[selectedAddressIdx] || userData.address;
      const totalProductos = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      let shippingEstimate = 0;
      if (selectedAddress && selectedAddress.city) {
        shippingEstimate = selectedAddress.city.toLowerCase().includes('santiago') ? 3000 : 5000;
      }
      const totalPagar = totalProductos + shippingEstimate;
      const pedido = {
        toUser: 'francocas453@gmail.com',
        userName: userData.user?.displayName || '',
        orderId: 'TEST-' + Math.floor(Math.random()*100000),
        items: cart,
        total: totalPagar,
        address: selectedAddress,
        status: 'pagado',
        createdAt: Date.now(),
        mp_payment_id: 'TEST'
      };
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
      const data = await res.json();
      if (data.success) {
        setResumenMsg('¡Correo de resumen enviado!');
      } else {
        setResumenMsg('Error al enviar el correo.');
      }
    } catch (e) {
      setResumenMsg('Error inesperado al enviar el correo.');
    } finally {
      setResumenLoading(false);
    }
  };
  const { cart, clearCart, removeFromCart, removeQuantity } = useCart();
  const [userData, setUserData] = useState<UserData>({ user: null, uid: null, role: null, address: null });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [addressLoading, setAddressLoading] = useState(true);
  const [shipping, setShipping] = useState<number | "">("");
  const [shippingSaved, setShippingSaved] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = listenUserData((data) => {
      setUserData(data);
      setAddressLoading(false);
      if (data.user && data.user.uid) {
        // Si hay varias direcciones, selecciona la principal o la elegida
        if (Array.isArray(data.address)) {
          setAddresses(data.address);
        } else if (data.address) {
          setAddresses([data.address]);
        } else {
          setAddresses([]);
        }
      } else {
        setAddresses([]);
      }
    });
    return () => unsub();
  }, []);

  function isAddressComplete(addr: any) {
    return addr && addr.street && addr.number && addr.city && addr.region && addr.country;
  }

  const handlePagarConMercadoPago = async () => {
    setMpLoading(true);
    setMpError("");
    try {
      // Formatea los items para MercadoPago
      const mpItems = cart.map(item => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'CLP',
      }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: mpItems,
          userEmail: userData.user?.email,
          userId: userData.uid,
          shipping: shippingEstimate,
          address: addresses[selectedAddressIdx] || userData.address,
          total: totalPagar
        }),
      });
      const data = await res.json();
      if (data.init_point) {
        // Guarda el resumen de la compra en localStorage para mostrarlo en /success
        localStorage.setItem("lastOrder", JSON.stringify({
          items: cart,
          address: addresses[selectedAddressIdx] || userData.address,
          total: totalPagar
        }));
        window.location.href = data.init_point;
      } else {
        setMpError(data.error || JSON.stringify(data));
      }
    } catch (err: any) {
      setMpError(err.message || "Error inesperado");
    } finally {
      setMpLoading(false);
    }
  };

  // Calcular envío estimado automáticamente
  let shippingEstimate = 0;
  const selectedAddress = addresses[selectedAddressIdx] || userData.address;
  if (selectedAddress && selectedAddress.city) {
    shippingEstimate = selectedAddress.city.toLowerCase().includes('santiago') ? 3000 : 5000;
  }
  const totalProductos = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalPagar = totalProductos + shippingEstimate;

  if (!userData.user) return <div style={{ textAlign: 'center', marginTop: 40 }}>Debes iniciar sesión para continuar.</div>;
  if (cart.length === 0) return <div style={{ textAlign: 'center', marginTop: 40 }}>No hay productos en el carrito.</div>;

  return (
    <div style={{ maxWidth: 520, margin: "2.5rem auto", background: 'rgba(255,255,255,0.85)', borderRadius: 22, boxShadow: '0 8px 32px 0 rgba(33,150,243,0.10)', padding: 32, backdropFilter: 'blur(18px) saturate(180%)', border: '1.5px solid rgba(33,150,243,0.10)' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 18, letterSpacing: 0.5 }}>¡Revisa tu compra!</h2>
      <div style={{ marginBottom: 20 }}>
        <b style={{ fontSize: 17 }}>Productos:</b>
        {cart.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0', background: 'rgba(240,245,255,0.7)', borderRadius: 14, padding: 10, boxShadow: '0 1px 4px 0 rgba(33,150,243,0.06)' }}>
            <img src={item.img} alt={item.name} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', border: 'none', padding: 6 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: '#555' }}>Talla: <b>{item.selectedSize}</b></div>
              <div style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                Cantidad:
                <MuiButton size="small" onClick={() => item.quantity > 1 && removeQuantity(item.name, item.selectedSize, 1)} style={{ minWidth: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #cce', color: '#1976d2', fontWeight: 700, padding: 2 }}>
                  <RemoveIcon fontSize="small" />
                </MuiButton>
                <span style={{ width: 32, textAlign: 'center', fontWeight: 500, fontSize: 15 }}>{item.quantity}</span>
                <MuiButton size="small" onClick={() => item.quantity < (item.sizes[item.selectedSize] || 99) && removeQuantity(item.name, item.selectedSize, -1)} style={{ minWidth: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #cce', color: '#1976d2', fontWeight: 700, padding: 2 }}>
                  <AddIcon fontSize="small" />
                </MuiButton>
                <MuiButton size="small" color="error" variant="outlined" style={{ marginLeft: 8, borderRadius: 8, fontWeight: 500 }} onClick={() => removeFromCart(item.name, item.selectedSize)}>
                  <DeleteIcon fontSize="small" />
                </MuiButton>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1976d2' }}>${item.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 18, background: 'rgba(245,250,255,0.7)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '100%' }}>
          <b style={{ fontSize: 16 }}>Dirección de envío:</b>
          {addressLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <CircularProgress size={20} color="primary" /> Cargando dirección...
            </div>
          ) : addresses.length > 1 ? (
            <div style={{ marginTop: 6 }}>
              <select value={selectedAddressIdx} onChange={e => setSelectedAddressIdx(Number(e.target.value))} style={{ padding: 8, borderRadius: 8, border: '1px solid #cce', background: '#f8fafc', fontWeight: 500, fontSize: 15 }}>
                {addresses.map((addr, idx) => (
                  <option key={idx} value={idx}>{addr.street}, {addr.number} - {addr.city}, {addr.region}, {addr.country}</option>
                ))}
              </select>
            </div>
          ) : selectedAddress ? (
            <div style={{ fontSize: 15, color: '#333', marginTop: 6 }}>
              {selectedAddress.street}, {selectedAddress.number} - {selectedAddress.city}, {selectedAddress.region}, {selectedAddress.country}
            </div>
          ) : (
            <div style={{ fontSize: 15, color: '#999', marginTop: 6 }}>No tienes una dirección de envío guardada.</div>
          )}
        </div>
        <MuiButton size="small" variant="text" style={{ minWidth: 32, borderRadius: 8, marginLeft: 8 }} onClick={() => router.push('/perfil')} aria-label="Editar dirección">
          <EditIcon fontSize="medium" />
        </MuiButton>
      </div>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Envío estimado:</span>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#1976d2' }}>${shippingEstimate.toLocaleString()}</span>
      </div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Total a pagar:</span>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1976d2' }}>${totalPagar.toLocaleString()}</span>
      </div>
      {mpError && <div style={{ color: '#e53935', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{mpError}</div>}
      <MuiButton
        variant="contained"
        color="primary"
        size="large"
        onClick={handlePagarConMercadoPago}
  disabled={mpLoading || !isAddressComplete(selectedAddress)}
        style={{
          width: '100%',
          padding: 16,
          fontSize: 18,
          borderRadius: 14,
          boxShadow: '0 4px 24px 0 rgba(33,150,243,0.13)',
          fontWeight: 700,
          letterSpacing: 0.5,
          background: 'rgba(33,150,243,0.18)',
          color: '#1976d2',
          border: '1.5px solid rgba(33,150,243,0.18)',
          backdropFilter: 'blur(10px) saturate(180%)',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {mpLoading ? <CircularProgress size={24} color="inherit" /> : "Pagar con Mercado Pago"}
      </MuiButton>

       <MuiButton
         variant="contained"
         color="secondary"
         size="large"
         onClick={handleEnviarResumen}
         disabled={resumenLoading || !isAddressComplete(selectedAddress)}
         style={{
           width: '100%',
           padding: 16,
           fontSize: 18,
           borderRadius: 14,
           boxShadow: '0 4px 24px 0 rgba(33,150,243,0.13)',
           fontWeight: 700,
           letterSpacing: 0.5,
           background: 'rgba(197,33,243,0.13)',
           color: '#7b1fa2',
           border: '1.5px solid rgba(197,33,243,0.13)',
           backdropFilter: 'blur(10px) saturate(180%)',
           transition: 'background 0.2s, color 0.2s',
           marginTop: 12
         }}
       >
         {resumenLoading ? <CircularProgress size={24} color="inherit" /> : "Enviar resumen por correo"}
       </MuiButton>
       {resumenMsg && <div style={{ color: resumenMsg.startsWith('¡') ? '#388e3c' : '#e53935', marginTop: 10, textAlign: 'center', fontWeight: 500 }}>{resumenMsg}</div>}
      <div style={{ marginTop: 18, fontSize: 13, color: '#777', textAlign: 'center' }}>
        Al continuar, aceptas nuestros <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>términos y condiciones</a> y <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>política de privacidad</a>.
      </div>
    </div>
  );
}
