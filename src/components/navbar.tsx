"use client"
import React, { useState, useRef, useEffect } from "react";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { User } from "firebase/auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { IconButton, Badge, Drawer, List, ListItem, ListItemText, Modal, Box, TextField, Button as MuiButton } from "@mui/material";
import { useCart } from "../CartContext";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@heroui/react";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function navbar() {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [navbarWidth, setNavbarWidth] = useState<number>(0);
  const [navbarLeft, setNavbarLeft] = useState<number>(0);
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarWidth(navbarRef.current.offsetWidth);
      setNavbarLeft(navbarRef.current.offsetLeft);
    }
    const handleResize = () => {
      if (navbarRef.current) {
        setNavbarWidth(navbarRef.current.offsetWidth);
        setNavbarLeft(navbarRef.current.offsetLeft);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mpError, setMpError] = useState("");
  const [mpLink, setMpLink] = useState("");
  const pagarConMercadoPago = async () => {
    setMpError("");
    setMpLink("");
    if (!user || !cart.length) return;
  const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          title: item.name,
          quantity: item.quantity,
          currency_id: 'CLP',
          unit_price: parseInt(item.price.replace(/[^\d]/g, ''))
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
  };
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuItems = [
    { label: "Productos", href: "/" },
    { label: "Profile", href: "#" },
    { label: "Dashboard", href: "#" },
    { label: "Activity", href: "#" },
  ];
  const { cart, removeQuantity, removeFromCart, clearCart } = useCart();
  // Suma total de productos en el carrito
  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleGoogleLogin = async () => {
    setLoginError("");
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { auth } = await import("../firebaseconfig");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setLoginOpen(false);
      setUser(result.user);
    } catch (err) {
      let message = "Error de autenticación";
      if (err && typeof err === "object" && "message" in err) message = (err as any).message;
      setLoginError(message);
    }
  };

  React.useEffect(() => {
    (async () => {
      const { auth } = await import("../firebaseconfig");
      const { onAuthStateChanged } = await import("firebase/auth");
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });
    })();
  }, []);

  return (
    <>
  <div ref={navbarRef}>
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className="glass" style={{marginBottom: '2rem'}}>
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent>
        <NavbarContent className="sm:hidden pr-3" justify="center">
          <NavbarBrand>
            <AcmeLogo />
            <p className="font-bold text-inherit">ACME</p>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarBrand>
            <AcmeLogo />
            <p className="font-bold text-inherit">ACME</p>
          </NavbarBrand>
          {menuItems.map((item, index) => (
            <NavbarItem key={item.label}>
              <Link
                color={index === 2 ? "warning" : index === menuItems.length - 1 ? "danger" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          {user ? (
            <NavbarItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AccountCircleIcon style={{ width: 32, height: 32 }} />
                <span style={{ fontWeight: 500 }}>{user.displayName || user.email}</span>
              </div>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <IconButton color="primary" onClick={() => setLoginOpen(true)}>
                <GoogleIcon style={{ width: 32, height: 32 }} />
              </IconButton>
            </NavbarItem>
          )}
          <NavbarItem>
            <IconButton color="primary" onClick={() => setCartOpen(true)}>
              <Badge badgeContent={cartCount} sx={{
                '& .MuiBadge-badge': {
                  background: 'rgba(33,150,243,0.85)',
                  color: '#fff',
                  boxShadow: '0 2px 8px 0 rgba(33,150,243,0.12)',
                  border: '1px solid rgba(33,150,243,0.18)',
                }
              }}>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </NavbarItem>
          {/* ...existing code... */}
        </NavbarContent>
  <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ className: 'glass', style: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(200%)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)' } }}>
          <div style={{ width: 300, padding: 16, minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3>Carrito</h3>
            {cart.length === 0 ? (
              <p>El carrito está vacío</p>
            ) : (
              <>
                <List>
                  {cart.map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={item.name}
                        secondary={`Talla: ${item.selectedSize} | Cantidad: ${item.quantity} | Precio: ${item.price}`}
                      />
                        <MuiButton
                          variant="outlined"
                          color="error"
                          size="small"
                          style={{ marginLeft: 8 }}
                          onClick={() => removeQuantity(item.name, item.selectedSize, 1)}
                          disabled={item.quantity <= 1}
                        >
                          -1
                        </MuiButton>
                        <MuiButton
                          variant="outlined"
                          color="error"
                          size="small"
                          style={{ marginLeft: 4 }}
                          onClick={() => removeFromCart(item.name, item.selectedSize)}
                        >
                          Quitar
                        </MuiButton>
                    </ListItem>
                  ))}
                </List>
                <MuiButton
                  variant="contained"
                  color="success"
                  onClick={pagarConMercadoPago}
                  disabled={!user || !cart.length}
                  fullWidth
                  style={{ marginTop: 16, backdropFilter: 'blur(8px)', background: 'rgba(33,150,243,0.25)', color: '#fff', borderRadius: 12, border: '1px solid rgba(33,150,243,0.18)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.12)' }}
                >
                  Pagar con Mercado Pago
                </MuiButton>
                  <MuiButton
                    variant="contained"
                    color="error"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                    fullWidth
                    style={{ marginTop: 8, backdropFilter: 'blur(8px)', background: 'rgba(244,67,54,0.25)', color: '#fff', borderRadius: 12, border: '1px solid rgba(244,67,54,0.18)', boxShadow: '0 2px 8px 0 rgba(244,67,54,0.12)' }}
                  >
                    Vaciar carrito
                  </MuiButton>
                {mpError && (
                  <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Error: {mpError}</div>
                )}
                {mpLink && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <a href={mpLink} target="_blank" rel="noopener noreferrer">Ir a Mercado Pago</a>
                  </div>
                )}
              </>
            )}
          </div>
        </Drawer>
  <NavbarMenu className="glass" style={{position: 'fixed', top: '5.5rem', left: navbarLeft ?? 0, width: navbarWidth ?? '100%', zIndex: 100}}>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`} className="glass" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem 0'}}>
              <Link
                style={{textAlign: 'center', minWidth: 'unset', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 500, fontSize: '1.1rem', background: 'rgba(255,255,255,0.08)', border: 'none', boxShadow: 'none'}}
                color={index === 2 ? "warning" : index === menuItems.length - 1 ? "danger" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
    </Navbar>
  </div>
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 350, p: 4, borderRadius: 3, textAlign: 'center', backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.08)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.18)' }}>
          <h3>Accede con Google</h3>
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
          <MuiButton variant="contained" fullWidth startIcon={<GoogleIcon />} style={{backdropFilter: 'blur(8px)', background: 'rgba(33,150,243,0.25)', color: '#fff', borderRadius: 12, border: '1px solid rgba(33,150,243,0.18)'}} onClick={handleGoogleLogin}>
            Acceder con Google
          </MuiButton>
        </Box>
      </Modal>
    </>
  );
}