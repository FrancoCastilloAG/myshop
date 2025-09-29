"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../firebaseconfig";
import { ref as dbRef, push, set, get as dbGet } from "firebase/database";
import { CircularProgress } from "@heroui/react";
import MuiButton from "@mui/material/Button";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState<{ [key: string]: number }>({});
  const [sizeInput, setSizeInput] = useState("");
  const [stockInput, setStockInput] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const roleSnap = await dbGet(dbRef(db, `users/${user.uid}/role`));
      setIsAdmin(roleSnap.exists() && roleSnap.val() === "admin");
    });
    return () => unsubscribe();
  }, []);


  // Cargar el widget de Cloudinary
  const openCloudinaryWidget = () => {
    // @ts-ignore
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.onload = () => openCloudinaryWidget();
      document.body.appendChild(script);
      return;
    }
    // @ts-ignore
    window.cloudinary.openUploadWidget({
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      cropping: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      resourceType: 'image',
    }, (error: any, result: any) => {
      if (!error && result && result.event === "success") {
        setImageUrl(result.info.secure_url);
      }
    });
  };

  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeInput || stockInput === "" || isNaN(Number(stockInput))) return;
    setSizes(prev => ({ ...prev, [sizeInput]: Number(stockInput) }));
    setSizeInput("");
    setStockInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      if (!imageUrl) throw new Error("Debes subir una imagen");
      const productRef = push(dbRef(db, "products"));
      await set(productRef, {
        name: String(name),
        price: typeof price === 'number' ? price : 0,
        description: String(description),
        sizes,
        imageUrl: String(imageUrl),
        createdAt: Date.now()
      });
      setSuccess("Producto agregado correctamente");
      setName("");
      setPrice("");
      setStockInput("");
      setDescription("");
      setSizes({});
  setImageUrl("");
    } catch (err) {
      setError("Error al agregar producto");
    }
    setLoading(false);
  };

  if (isAdmin === null) {
    return <div>Cargando permisos...</div>;
  }
  if (!isAdmin) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>No tienes permisos para agregar productos.</div>;
  }
  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: 440,
      margin: "2.5rem auto",
      background: 'rgba(255,255,255,0.18)',
      borderRadius: 22,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
      padding: 36,
      backdropFilter: 'blur(8px)',
      border: '1.5px solid rgba(255,255,255,0.25)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 24, color: '#1976d2', letterSpacing: 1 }}>Agregar producto</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontWeight: 600, color: '#1976d2' }}>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginTop: 4, marginBottom: 8, padding: 12, borderRadius: 10, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#1976d2' }}>Precio</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            required
            style={{ width: '100%', marginTop: 4, marginBottom: 8, padding: 12, borderRadius: 10, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', fontSize: 16 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#1976d2' }}>Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', marginTop: 4, marginBottom: 8, padding: 12, borderRadius: 10, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', fontSize: 16, minHeight: 60 }} />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#1976d2' }}>Tallas y stock</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input placeholder="Talla (ej: S, M, 38)" value={sizeInput} onChange={e => setSizeInput(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)' }} />
            <input placeholder="Stock" type="number" value={stockInput} onChange={e => setStockInput(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: 80, padding: 10, borderRadius: 8, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)' }} />
            <MuiButton
              type="button"
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleAddSize}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(33,150,243,0.18)',
                color: '#1976d2',
                border: '1.5px solid rgba(33,150,243,0.18)',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                marginLeft: 8,
                backdropFilter: 'blur(10px) saturate(180%)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >Agregar talla</MuiButton>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            {Object.entries(sizes).map(([size, stock]) => (
              <div key={size} style={{ background: '#e3f2fd', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#1976d2', fontSize: 15 }}>
                <span>{size}: {stock}</span>
                <button type="button" onClick={() => setSizes(prev => { const n = { ...prev }; delete n[size]; return n; })} style={{ color: '#c43737', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, marginLeft: 4 }}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#1976d2' }}>Imagen</label>
          <MuiButton
            type="button"
            variant="contained"
            color="primary"
            size="medium"
            onClick={openCloudinaryWidget}
            style={{
              marginBottom: 8,
              marginTop: 4,
              padding: '10px 18px',
              borderRadius: 8,
              background: 'rgba(33,150,243,0.18)',
              color: '#1976d2',
              border: '1.5px solid rgba(33,150,243,0.18)',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
              backdropFilter: 'blur(10px) saturate(180%)',
              transition: 'background 0.2s, color 0.2s',
            }}
          >{imageUrl ? "Cambiar imagen" : "Subir imagen"}</MuiButton>
          {imageUrl && (
            <div style={{ marginBottom: 8, marginTop: 4, display: 'flex', justifyContent: 'center' }}>
              <img src={imageUrl} alt="preview" style={{ maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)' }} />
            </div>
          )}
        </div>
        <MuiButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
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
            marginTop: 12
          }}
        >
          {loading ? "Subiendo..." : "Agregar producto"}
        </MuiButton>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
            <CircularProgress size="lg" color="primary" />
          </div>
        )}
        {success && <div style={{ color: 'green', marginTop: 8, fontWeight: 600 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 8, fontWeight: 600 }}>{error}</div>}
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        background: 'linear-gradient(120deg, #e3f2fd 0%, #fff 100%)',
        opacity: 0.5,
        borderRadius: 22,
      }} />
    </form>
  );
}
