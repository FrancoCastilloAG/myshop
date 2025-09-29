"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseconfig";
import { ref as dbRef, onValue, remove, update } from "firebase/database";

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
    <div style={{ maxWidth: 800, margin: "2rem auto", background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h3>Administrar productos</h3>
      {products.length === 0 ? <p>No hay productos.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Tallas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                <td><img src={prod.imageUrl} alt={prod.name} style={{ width: 60, borderRadius: 6 }} /></td>
                <td>{editId === prod.id ? <input name="name" value={editData.name || ""} onChange={handleEditChange} /> : prod.name}</td>
                <td>{editId === prod.id ? <input name="price" type="number" value={editData.price || 0} onChange={handleEditChange} /> : `$${prod.price.toLocaleString()}`}</td>
                <td>{editId === prod.id ? <textarea name="description" value={editData.description || ""} onChange={handleEditChange} /> : prod.description}</td>
                <td>
                  {Object.entries(prod.sizes).map(([size, stock]) => (
                    <div key={size}>{size}: {stock}</div>
                  ))}
                </td>
                <td>
                  {editId === prod.id ? (
                    <>
                      <button onClick={handleEditSave} style={{ marginRight: 8 }}>Guardar</button>
                      <button onClick={() => setEditId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(prod)} style={{ marginRight: 8 }}>Editar</button>
                      <button onClick={() => handleDelete(prod.id)} style={{ color: 'red' }}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
