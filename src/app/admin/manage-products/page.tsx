"use client";
import React, { useEffect, useState } from "react";
import { ref as dbRef, onValue, remove, update } from "firebase/database";
import { CircularProgress } from "@heroui/react";
import { db } from "../../../firebaseconfig";
import MuiButton from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  sizes: Record<string, number>;
  imageUrl: string;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    const productsRef = dbRef(db, "products");
    const unsub = onValue(productsRef, snap => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([id, prod]: any) => ({ id, ...prod }));
      setProducts(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este producto?")) {
      await remove(dbRef(db, `products/${id}`));
    }
  };

  const handleEdit = (prod: Product) => {
    setEditId(prod.id);
    setEditData({ ...prod });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const handleEditSave = async () => {
    if (!editId) return;
    await update(dbRef(db, `products/${editId}`), editData);
    setEditId(null);
    setEditData({});
  };

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div style={{
      maxWidth: 1000,
      margin: "2.5rem auto",
      background: 'rgba(255,255,255,0.18)',
      borderRadius: 22,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
      padding: 32,
      backdropFilter: 'blur(8px)',
      border: '1.5px solid rgba(255,255,255,0.25)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 24, color: '#1976d2', letterSpacing: 1 }}>Administrar productos</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800, background: 'rgba(255,255,255,0.10)', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(33,150,243,0.07)' }}>
          <thead>
            <tr style={{ background: 'rgba(33,150,243,0.07)' }}>
              <th style={{ padding: 14, fontWeight: 700, color: '#1976d2', backdropFilter: 'blur(4px)' }}>Imagen</th>
              <th style={{ padding: 14, fontWeight: 700, color: '#1976d2', backdropFilter: 'blur(4px)' }}>Nombre</th>
              <th style={{ padding: 14, fontWeight: 700, color: '#1976d2', backdropFilter: 'blur(4px)' }}>Precio</th>
              <th style={{ padding: 14, fontWeight: 700, color: '#1976d2', backdropFilter: 'blur(4px)' }}>Descripción</th>
              <th style={{ padding: 14, fontWeight: 700, color: '#1976d2', backdropFilter: 'blur(4px)' }}>Tallas</th>
              <th style={{ padding: 14, fontWeight: 700, color: '#1976d2', backdropFilter: 'blur(4px)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid #e3f2fd', background: editId === prod.id ? 'rgba(33,150,243,0.08)' : 'rgba(255,255,255,0.45)', backdropFilter: 'blur(4px)' }}>
                <td style={{ padding: 10, textAlign: 'center' }}><img src={prod.imageUrl} alt={prod.name} style={{ width: 60, borderRadius: 10, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)' }} /></td>
                <td style={{ padding: 10 }}>
                  {editId === prod.id ? <input name="name" value={editData.name || ""} onChange={handleEditChange} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }} /> : prod.name}
                </td>
                <td style={{ padding: 10 }}>
                  {editId === prod.id ? <input name="price" type="number" value={editData.price || 0} onChange={handleEditChange} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }} /> : `$${prod.price.toLocaleString()}`}
                </td>
                <td style={{ padding: 10 }}>
                  {editId === prod.id ? <textarea name="description" value={editData.description || ""} onChange={handleEditChange} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1.5px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', minHeight: 40, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }} /> : prod.description}
                </td>
                <td style={{ padding: 10, minWidth: 180 }}>
                  {editId === prod.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {Object.entries(editData.sizes || {}).map(([size, stock]) => (
                        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            style={{ width: 50, borderRadius: 8, border: '1.5px solid #e0e0e0', padding: 4, background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }}
                            value={size}
                            disabled
                          />
                          <input
                            type="number"
                            style={{ width: 60, borderRadius: 8, border: '1.5px solid #e0e0e0', padding: 4, background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }}
                            value={stock}
                            min={0}
                            onChange={e => {
                              const n = { ...(editData.sizes || {}) };
                              n[size] = Number(e.target.value);
                              setEditData(prev => ({ ...prev, sizes: n }));
                            }}
                          />
                          <button type="button" onClick={() => {
                            const n = { ...(editData.sizes || {}) };
                            delete n[size];
                            setEditData(prev => ({ ...prev, sizes: n }));
                          }} style={{
                            background: 'rgba(255,255,255,0.45)', color: '#c43737', border: '1.5px solid #f8bbd0', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '2px 10px', cursor: 'pointer', marginLeft: 2, boxShadow: '0 2px 8px 0 rgba(244,67,54,0.10)', backdropFilter: 'blur(4px)'
                          }}>×</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <input
                          placeholder="Talla"
                          style={{ width: 50, borderRadius: 8, border: '1.5px solid #e0e0e0', padding: 4, background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }}
                          value={newSize}
                          onChange={e => setNewSize(e.target.value)}
                        />
                        <input
                          placeholder="Stock"
                          type="number"
                          style={{ width: 60, borderRadius: 8, border: '1.5px solid #e0e0e0', padding: 4, background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)' }}
                          value={newStock}
                          onChange={e => setNewStock(e.target.value)}
                        />
                        <MuiButton
                          type="button"
                          variant="contained"
                          color="primary"
                          size="medium"
                          onClick={() => {
                            if (!newSize || newStock === '') return;
                            setEditData(prev => ({
                              ...prev,
                              sizes: { ...(prev.sizes || {}), [newSize]: Number(newStock) }
                            }));
                            setNewSize('');
                            setNewStock('');
                          }}
                          style={{
                            background: 'rgba(33,150,243,0.85)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 15,
                            padding: '4px 14px',
                            cursor: 'pointer',
                            marginLeft: 2,
                            boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                            backdropFilter: 'blur(4px)'
                          }}
                        >Agregar</MuiButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {Object.entries(prod.sizes).map(([size, stock]) => (
                        <div key={size}>{size}: {stock}</div>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ padding: 10 }}>
                  {editId === prod.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <MuiButton
                        onClick={handleEditSave}
                        variant="contained"
                        color="primary"
                        size="large"
                        style={{
                          padding: '10px 18px',
                          borderRadius: 12,
                          background: 'rgba(33,150,243,0.85)',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          letterSpacing: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      >Guardar</MuiButton>
                      <MuiButton
                        onClick={() => setEditId(null)}
                        variant="contained"
                        color="primary"
                        size="large"
                        style={{
                          padding: '10px 18px',
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.45)',
                          color: '#1976d2',
                          border: '1.5px solid #90caf9',
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          letterSpacing: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      >Cancelar</MuiButton>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <MuiButton
                        onClick={() => handleEdit(prod)}
                        variant="contained"
                        color="primary"
                        size="large"
                        style={{
                          padding: '10px 18px',
                          borderRadius: 12,
                          background: 'rgba(33,150,243,0.85)',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          letterSpacing: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        <EditIcon style={{ color: '#1976d2', fontSize: 24 }} />
                      </MuiButton>
                      <MuiButton
                        onClick={() => handleDelete(prod.id)}
                        variant="contained"
                        color="primary"
                        size="large"
                        style={{
                          padding: '10px 18px',
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.45)',
                          color: '#c43737',
                          border: '1.5px solid #f8bbd0',
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: '0 2px 8px 0 rgba(244,67,54,0.10)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          letterSpacing: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        <DeleteIcon style={{ color: '#c43737', fontSize: 24 }} />
                      </MuiButton>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
