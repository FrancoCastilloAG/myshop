"use client"
import { useEffect, useState } from 'react';

type Pedido = {
  id: string;
  userId?: string;
  createdAt?: number;
  status: string;
  // Puedes agregar más campos según tu modelo
};
import { getDatabase, ref, onValue, update } from 'firebase/database';

export default function EnviosPage() {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const db = getDatabase();
      const ordersRef = ref(db, 'orders');
      onValue(ordersRef, (snapshot) => {
        try {
          const data = snapshot.val() || {};
          const allOrders: Pedido[] = Object.entries(data).flatMap(([userId, userOrders]: [string, any]) =>
            Object.values(userOrders).map((order: any) => ({ ...order, userId, displayName: order.displayName || '' }))
          );
          setOrders(allOrders);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError('Error procesando los datos de envíos.');
          setLoading(false);
        }
      }, (err) => {
        setError('Error al leer los envíos: ' + (err?.message || 'Desconocido'));
        setLoading(false);
      });
    } catch (err: any) {
      setError('Error de conexión con Firebase: ' + (err?.message || 'Desconocido'));
      setLoading(false);
    }
  }, []);

  const handleStatusChange = (order: any, newStatus: string) => {
    try {
      const db = getDatabase();
      const orderRef = ref(db, `orders/${order.userId}/${order.id}`);
      update(orderRef, { status: newStatus });
    } catch (err: any) {
      setError('Error actualizando el estado del pedido: ' + (err?.message || 'Desconocido'));
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(33,150,243,0.08)', padding: 32 }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 26, marginBottom: 24 }}>Sección de Envíos</h2>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>Aquí podrás gestionar los envíos de los pedidos pagados.</p>
      {error && (
        <div style={{ textAlign: 'center', color: '#e53935', marginBottom: 18, fontWeight: 500 }}>
          {error}
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#1976d2' }}>Cargando envíos...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>No hay pedidos registrados.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ padding: 10, borderRadius: 8 }}>ID</th>
              <th style={{ padding: 10 }}>Usuario</th>
              <th style={{ padding: 10 }}>Fecha</th>
              <th style={{ padding: 10 }}>Estado</th>
              <th style={{ padding: 10 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any, idx: number) => (
              <tr key={order.id} style={{ background: idx % 2 ? '#f7f7fa' : '#fff' }}>
                <td style={{ padding: 10 }}>{order.id}</td>
                <td style={{ padding: 10 }}>{order.displayName || 'Sin nombre'}</td>
                <td style={{ padding: 10 }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                <td style={{ padding: 10 }}>{order.status}</td>
                <td style={{ padding: 10 }}>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order, e.target.value)}
                    style={{ padding: 6, borderRadius: 6 }}
                  >
                    <option value="pagado">Pagado</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
