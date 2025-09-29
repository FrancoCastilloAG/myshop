"use client";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { db } from "../../firebaseconfig";
import { ref as dbRef, get as dbGet } from "firebase/database";

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const userDbRef = dbRef(db, `users/${firebaseUser.uid}/role`);
        const snap = await dbGet(userDbRef);
        const role = snap.exists() ? snap.val() : null;
        setUserRole(role);
        console.log("Perfil UID:", firebaseUser.uid, "Rol:", role);
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!user) {
    router.replace("/");
    return null;
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2>Perfil de Usuario</h2>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Nombre:</b> {user.displayName || '-'}</div>
      <div><b>UID:</b> {user.uid}</div>
      <div><b>Rol:</b> {userRole ?? <span style={{color:'red'}}>No encontrado</span>}</div>
      {userRole === 'admin' && (
        <button onClick={() => window.location.href = '/admin'} style={{ marginTop: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
          Ir al panel de Admin
        </button>
      )}
      <div style={{ margin: '12px 0 4px 0', fontWeight: 500 }}>Resumen de compras:</div>
      <div style={{ fontSize: 13, color: '#888' }}>(Aquí puedes mostrar el historial real)</div>
      <button onClick={async () => { await signOut(getAuth()); router.replace("/"); }} style={{ marginTop: 16, background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  );
}
