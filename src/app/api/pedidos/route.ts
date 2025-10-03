import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // En producción: variable de entorno con el JSON stringificado
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // En desarrollo local: archivo en la raíz del proyecto
    // Ajusta la ruta si tu archivo está en otro lugar
    return require('../../../serviceAccountKey.json');
  }
}

if (!getApps().length) {
  initializeApp({
    credential: cert(getServiceAccount()),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  });
}
const db = getDatabase();

export async function POST(req: NextRequest) {
  try {
    const { userId, order } = await req.json();
    console.log('[API/pedidos] userId:', userId);
    console.log('[API/pedidos] order:', order);
    if (!userId || !order) {
      console.error('[API/pedidos] Faltan datos: userId u order');
      return NextResponse.json({ error: 'userId y order son requeridos' }, { status: 400 });
    }
    const orderRef = db.ref(`orders/${userId}`);
    const newOrderRef = orderRef.push();
    try {
      await newOrderRef.set({ ...order, id: newOrderRef.key, createdAt: Date.now(), status: 'pagado' });
    } catch (firebaseError) {
      console.error('[API/pedidos] Error Firebase:', firebaseError);
      return NextResponse.json({ error: 'Error guardando pedido en Firebase', details: firebaseError }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: newOrderRef.key });
  } catch (error) {
    console.error('[API/pedidos] Error general:', error);
    return NextResponse.json({ error: 'Error guardando pedido', details: error }, { status: 500 });
  }
}
