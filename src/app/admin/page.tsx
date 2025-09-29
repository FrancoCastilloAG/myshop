"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseconfig";
import { ref as dbRef, get as dbGet } from "firebase/database";
import { CircularProgress } from "@heroui/react";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }
      // Limpieza: sin logs en producción
      const roleSnap = await dbGet(dbRef(db, `users/${user.uid}/role`));
      if (roleSnap.exists() && roleSnap.val() === "admin") {
        setIsAdmin(true);
      } else {
        router.replace("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
      <CircularProgress size="lg" color="primary" />
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div style={{ maxWidth: 700, margin: "2.5rem auto", background: 'rgba(255,255,255,0.85)', borderRadius: 22, boxShadow: '0 8px 32px 0 rgba(33,150,243,0.10)', padding: 32, backdropFilter: 'blur(18px) saturate(180%)', border: '1.5px solid rgba(33,150,243,0.10)' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 32, letterSpacing: 0.5 }}>Panel de Administrador</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, justifyContent: 'center', alignItems: 'center', margin: '0 auto', maxWidth: 600 }}>
        <button onClick={() => router.push('/admin/add-product')} style={{ padding: '2.5rem 1rem', borderRadius: 18, background: 'rgba(33,150,243,0.13)', border: '1.5px solid rgba(33,150,243,0.18)', color: '#1976d2', fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{fontSize:36}}>➕</span>
          Agregar producto
        </button>
        <button onClick={() => router.push('/admin/manage-products')} style={{ padding: '2.5rem 1rem', borderRadius: 18, background: 'rgba(33,150,243,0.13)', border: '1.5px solid rgba(33,150,243,0.18)', color: '#1976d2', fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{fontSize:36}}>🗂️</span>
          Administrar productos
        </button>
        <button onClick={() => router.push('/admin/envios')} style={{ padding: '2.5rem 1rem', borderRadius: 18, background: 'rgba(33,150,243,0.13)', border: '1.5px solid rgba(33,150,243,0.18)', color: '#1976d2', fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{fontSize:36}}>🚚</span>
          Sección de envíos
        </button>
        <button onClick={() => router.push('/admin')} style={{ padding: '2.5rem 1rem', borderRadius: 18, background: 'rgba(33,150,243,0.13)', border: '1.5px solid rgba(33,150,243,0.18)', color: '#1976d2', fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{fontSize:36}}>📊</span>
          Dashboard
        </button>
      </div>
    </div>
  );
}
