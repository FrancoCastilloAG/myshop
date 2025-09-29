"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseconfig";
import { ref as dbRef, push, set, get as dbGet } from "firebase/database";

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
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2rem auto", background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h3>Agregar producto</h3>
      <div>
        <label>Nombre:</label>
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
      </div>
      <div>
        <label>Precio:</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
      </div>
      <div>
        <label>Tallas y stock:</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="Talla (ej: S, M, 38)" value={sizeInput} onChange={e => setSizeInput(e.target.value)} style={{ flex: 1 }} />
          <input placeholder="Stock" type="number" value={stockInput} onChange={e => setStockInput(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: 70 }} />
          <button type="button" onClick={handleAddSize}>Agregar</button>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {Object.entries(sizes).map(([size, stock]) => (
            <li key={size}>{size}: {stock}</li>
          ))}
        </ul>
      </div>
      <div>
        <label>Imagen:</label>
        <button type="button" onClick={openCloudinaryWidget} style={{ marginBottom: 8 }}>
          {imageUrl ? "Cambiar imagen" : "Subir imagen"}
        </button>
        {imageUrl && (
          <div style={{ marginBottom: 8 }}>
            <img src={imageUrl} alt="preview" style={{ maxWidth: 200, borderRadius: 8 }} />
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
        {loading ? "Subiendo..." : "Agregar producto"}
      </button>
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}
