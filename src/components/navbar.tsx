"use client"
import React, { useState, useRef, useEffect } from "react";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { listenUserData, UserData } from "../userUtils";
import { db } from "../firebaseconfig";
import { ref as dbRef, get as dbGet } from "firebase/database";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { createUserIfNotExists } from "../firebaseconfig";
import GoogleIcon from '@mui/icons-material/Google';
import { IconButton, Badge, Drawer, List, ListItem, ListItemText, Modal, Box, TextField, Button as MuiButton, CircularProgress } from "@mui/material";
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
import { fetchUserRole, pagarConMercadoPago } from "./navbarUtils";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
  const [mpLoading, setMpLoading] = useState(false);
  // Modularizado
  const [userData, setUserData] = useState<UserData>({ user: null, uid: null, role: null, address: null });
  const { cart } = useCart();
  const handlePagarConMercadoPago = async () => {
    setMpLoading(true);
    await pagarConMercadoPago(cart, userData.user, setMpError, setMpLink);
    setMpLoading(false);
  };
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuItems = [
    { label: "Productos", href: "/" },
    { label: "Perfil", href: "/perfil" },
  ];
  // Suma total de productos en el carrito
  const cartCount = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);

  const handleGoogleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { auth } = await import("../firebaseconfig");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setLoginOpen(false);
      setUserData((prev) => ({ ...prev, user: result.user, uid: result.user.uid }));
    } catch (err) {
      let message = "Error de autenticación";
      if (err && typeof err === "object" && "message" in err) message = (err as any).message;
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };
  useEffect(() => {
    (async () => {
      const { auth } = await import("../firebaseconfig");
      const { onAuthStateChanged } = await import("firebase/auth");
      onAuthStateChanged(auth, async (firebaseUser) => {
  setUserData({ user: firebaseUser, uid: firebaseUser?.uid ?? null, role: await fetchUserRole(firebaseUser), address: null });
      });
    })();
  }, []);

  // Eliminado: useEffect y useState duplicados

  function isAddressComplete(addr: any) {
    return addr && addr.street && addr.number && addr.city && addr.region && addr.country;
  }

  return (
    <>
      <div ref={navbarRef}>
        <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className="glass" style={{marginBottom: '2rem'}}>
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
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
                  style={{textAlign: 'center', minWidth: 'unset', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 500, fontSize: '1.1rem', background: 'rgba(255,255,255,0.08)', border: 'none', boxShadow: 'none'}}
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
            {userData.user ? (
              <NavbarItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setProfileOpen(false); router.push('/perfil'); }}>
                  <AccountCircleIcon style={{ width: 32, height: 32 }} />
                  <span style={{ fontWeight: 500 }}>{}</span>
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
          </NavbarContent>
          <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ className: 'glass', style: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(200%)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)' } }}>
            <div style={{ width: 300, padding: 16, minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <button
                onClick={() => setCartOpen(false)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: '#888',
                  zIndex: 2
                }}
                aria-label="Cerrar carrito"
              >
                ×
              </button>
              <h3 style={{ textAlign: 'center' }}>Carrito</h3>
              {cart.length === 0 ? (
                <p>El carrito está vacío</p>
              ) : (
                <>
                  <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 12 }}>
                    {cart.map((item, idx) => {
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: 'rgba(240,240,255,0.7)', borderRadius: 10, padding: 8, boxShadow: '0 1px 4px 0 rgba(33,150,243,0.08)' }}>
                          <img 
                            src={item.img} 
                            alt={item.name} 
                            style={{ 
                              width: 72, 
                              height: 72, 
                              objectFit: 'contain', 
                              borderRadius: 10, 
                              background: '#fff', 
                              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', 
                              border: 'none', 
                              padding: 6, 
                              display: 'block' 
                            }} 
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png';
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: 13, color: '#555' }}>Talla: <b>{item.selectedSize}</b></div>
                            <div style={{ fontSize: 13, color: '#555' }}>Cantidad: <b>{item.quantity}</b></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 16 }}>
                      <span>Total productos:</span>
                      <span>
                        ${cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <MuiButton
                    variant="contained"
                    color="success"
                    onClick={() => { setCartOpen(false); window.location.href = '/checkout'; }}
                    disabled={!userData.user || !cart.length}
                    fullWidth
                    style={{ marginTop: 8, backdropFilter: 'blur(8px)', background: 'rgba(33,150,243,0.25)', color: '#fff', borderRadius: 12, border: '1px solid rgba(33,150,243,0.18)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.12)' }}
                  >
                    Ir a checkout
                  </MuiButton>
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
      {/* Loading para login */}
      {loginOpen && (
        <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
          <Box style={{ padding: 32, background: '#fff', borderRadius: 16, minWidth: 320, minHeight: 180, margin: '10vh auto', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {loginLoading ? (
              <CircularProgress size={48} color="primary" />
            ) : (
              <>
                <h3>Accede con Google</h3>
                {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
                <MuiButton 
                  variant="contained" 
                  fullWidth 
                  startIcon={<GoogleIcon />} 
                  style={{backdropFilter: 'blur(8px)', background: 'rgba(33,150,243,0.25)', color: '#fff', borderRadius: 12, border: '1px solid rgba(33,150,243,0.18)'}} 
                  onClick={handleGoogleLogin}
                >
                  Acceder con Google
                </MuiButton>
              </>
            )}
          </Box>
        </Modal>
      )}
    </>
  );
}
